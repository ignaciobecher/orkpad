import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface BoardSocketData {
  userId?: string;
  workspaceId?: string;
}

@WebSocketGateway({
  namespace: '/boards',
  cors: { origin: true, credentials: true },
})
@Injectable()
export class BoardsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(BoardsGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const rawCookie = client.handshake.headers?.cookie ?? '';
      const cookieToken = /(?:^|;\s*)accessToken=([^;]+)/.exec(rawCookie)?.[1];
      const token =
        (client.handshake.auth?.token as string) ||
        (client.handshake.query?.token as string) ||
        client.handshake.headers?.authorization?.replace('Bearer ', '') ||
        (cookieToken ? decodeURIComponent(cookieToken) : undefined);
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
      const data = client.data as BoardSocketData;
      data.userId = payload.sub ?? payload.userId;
      data.workspaceId = payload.workspaceId;
      if (!data.userId || !data.workspaceId) {
        client.disconnect();
        return;
      }
      client.join(`workspace:${data.workspaceId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage('project:join')
  handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { projectId: string },
  ) {
    const data = client.data as BoardSocketData;
    if (!body?.projectId || !data.workspaceId) return { ok: false };
    client.join(`project:${body.projectId}`);
    return { ok: true, projectId: body.projectId };
  }

  @SubscribeMessage('project:leave')
  handleLeave(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: { projectId: string },
  ) {
    if (body?.projectId) client.leave(`project:${body.projectId}`);
    return { ok: true };
  }

  emitToProject(projectId: string, event: string, payload: any) {
    try {
      this.server?.to(`project:${projectId}`).emit(event, payload);
    } catch (e) {
      this.logger.warn(`emit failed: ${event} ${e}`);
    }
  }

  emitToWorkspace(workspaceId: string, event: string, payload: any) {
    try {
      this.server?.to(`workspace:${workspaceId}`).emit(event, payload);
    } catch (e) {
      this.logger.warn(`emit failed: ${event} ${e}`);
    }
  }
}
