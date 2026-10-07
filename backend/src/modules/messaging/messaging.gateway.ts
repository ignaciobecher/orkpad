import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { buildAllowedOrigins } from '../../common/cors/allowed-origins';

interface AdminSocketData {
  type: 'admin';
  workspaceId: string;
  userId: string;
}

type SocketData = AdminSocketData;

interface AuthenticatedSocket extends Socket {
  data: SocketData;
}

const ALLOWED_ORIGINS = buildAllowedOrigins(process.env.FRONTEND_URL);

@WebSocketGateway({
  cors: {
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  },
  namespace: '/messaging',
})
@Injectable()
export class MessagingGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly messagingService: MessagingService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const auth = client.handshake.auth as {
        type?: string;
        token?: string;
      };

      if (auth.type === 'admin') {
        await this.authenticateAdmin(client, auth.token || '');
      } else {
        this.logger.warn(
          `Conexión rechazada — falta autenticación: ${client.id}`,
        );
        client.disconnect(true);
        return;
      }

      this.logger.log(
        `Conectado [${client.data.type}] id=${client.id} ws=${client.data.workspaceId}`,
      );
    } catch (err) {
      this.logger.warn(`Conexión rechazada para ${client.id}: ${err}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Desconectado: ${client.id}`);
  }

  private async authenticateAdmin(client: AuthenticatedSocket, token: string) {
    // Admite token del handshake auth O de la cookie accessToken
    const rawToken =
      token ||
      client.handshake.headers?.cookie
        ?.split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith('accessToken='))
        ?.split('=')[1];

    if (!rawToken) throw new Error('Token no encontrado');

    let payload: { sub: string; workspaceId: string };
    try {
      payload = await this.jwtService.verifyAsync(rawToken, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new Error('JWT inválido');
    }

    client.data = {
      type: 'admin',
      workspaceId: payload.workspaceId,
      userId: payload.sub,
    };

    await client.join(`workspace:${payload.workspaceId}`);
  }

  @SubscribeMessage('admin:send-message')
  async handleAdminMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId: string; content: string },
  ) {
    if (client.data.type !== 'admin') throw new WsException('No autorizado');

    const dto: CreateMessageDto = { content: payload.content };
    const message = await this.messagingService.sendAdminMessage(
      client.data.workspaceId,
      payload.conversationId,
      client.data.userId,
      dto,
    );

    this.server
      .to(`conversation:${payload.conversationId}`)
      .emit('new-message', message);

    this.server
      .to(`workspace:${client.data.workspaceId}`)
      .emit('conversation-updated', {
        conversationId: payload.conversationId,
        lastMessageAt: new Date(),
      });

    return message;
  }

  @SubscribeMessage('admin:join-conversation')
  async handleAdminJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId: string },
  ) {
    if (client.data.type !== 'admin') throw new WsException('No autorizado');

    await this.messagingService.findConversation(
      client.data.workspaceId,
      payload.conversationId,
    );

    await client.join(`conversation:${payload.conversationId}`);
    return { joined: payload.conversationId };
  }

  emitToWorkspace(workspaceId: string, event: string, data: any) {
    this.server.to(`workspace:${workspaceId}`).emit(event, data);
  }

  emitToConversation(conversationId: string, event: string, data: any) {
    this.server.to(`conversation:${conversationId}`).emit(event, data);
  }
}
