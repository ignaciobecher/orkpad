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
import { ADMIN_USER_ID } from '../../common/guards/admin.guard';
import { SupportService } from './support.service';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { buildAllowedOrigins } from '../../common/cors/allowed-origins';

interface SupportSocketData {
  userId: string;
  workspaceId: string;
  isAdmin: boolean;
}

interface AuthenticatedSocket extends Socket {
  data: SupportSocketData;
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
  namespace: '/support',
})
@Injectable()
export class SupportGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SupportGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly supportService: SupportService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const auth = client.handshake.auth as { token?: string };
      const rawToken =
        auth.token ||
        client.handshake.headers?.cookie
          ?.split(';')
          .map((c) => c.trim())
          .find((c) => c.startsWith('accessToken='))
          ?.split('=')[1];

      if (!rawToken) throw new Error('Token no encontrado');

      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        workspaceId: string;
      }>(rawToken, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      const isAdmin = payload.sub === ADMIN_USER_ID;
      client.data = {
        userId: payload.sub,
        workspaceId: payload.workspaceId,
        isAdmin,
      };

      if (isAdmin) {
        await client.join('support:admin');
      } else {
        const conversation =
          await this.supportService.getOrCreateMyConversation(
            payload.workspaceId,
            payload.sub,
          );
        await client.join(
          `support:conversation:${(conversation._id as any).toString()}`,
        );
      }

      this.logger.log(
        `Conectado [${isAdmin ? 'admin' : 'customer'}] id=${client.id} ws=${payload.workspaceId}`,
      );
    } catch (err) {
      this.logger.warn(`Conexión rechazada para ${client.id}: ${err}`);
      client.disconnect(true);
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Desconectado: ${client.id}`);
  }

  @SubscribeMessage('customer:send-message')
  async handleCustomerMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { content: string },
  ) {
    if (client.data.isAdmin) throw new WsException('No autorizado');

    const dto: CreateSupportMessageDto = { content: payload.content };
    const { message, conversation } =
      await this.supportService.sendCustomerMessage(
        client.data.workspaceId,
        client.data.userId,
        dto,
      );
    const conversationId = (conversation._id as any).toString();

    this.server
      .to(`support:conversation:${conversationId}`)
      .emit('new-message', message);
    this.server.to('support:admin').emit('new-message', message);
    this.server.to('support:admin').emit('conversation-updated', {
      conversationId,
      lastMessageAt: new Date(),
    });

    return message;
  }

  @SubscribeMessage('admin:send-message')
  async handleAdminMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: { conversationId: string; content: string },
  ) {
    if (!client.data.isAdmin) throw new WsException('No autorizado');

    const dto: CreateSupportMessageDto = { content: payload.content };
    const message = await this.supportService.sendAdminMessage(
      payload.conversationId,
      client.data.userId,
      dto,
    );

    this.server
      .to(`support:conversation:${payload.conversationId}`)
      .emit('new-message', message);
    this.server.to('support:admin').emit('conversation-updated', {
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
    if (!client.data.isAdmin) throw new WsException('No autorizado');

    await this.supportService.findConversationForAdmin(payload.conversationId);
    await client.join(`support:conversation:${payload.conversationId}`);
    return { joined: payload.conversationId };
  }
}
