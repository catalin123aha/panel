import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { GatewayService } from './gateway.service';
import { JwtService } from '@nestjs/jwt';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class GatewayGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients = new Map<string, Set<string>>();

  constructor(
    private gatewayService: GatewayService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      client.data.userId = userId;

      // Add client to user's room
      const userRoom = `user:${userId}`;
      client.join(userRoom);

      // Track user's clients
      if (!this.connectedClients.has(userId)) {
        this.connectedClients.set(userId, new Set());
      }
      this.connectedClients.get(userId)!.add(client.id);

      // Get user's bots and join their rooms
      const bots = await this.gatewayService.getUserBots(userId);
      bots.forEach((bot) => {
        client.join(`bot:${bot.id}`);
      });

      console.log(`Client connected: ${client.id} for user: ${userId}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;

    if (userId) {
      const userRoom = `user:${userId}`;
      client.leave(userRoom);

      // Remove client from tracking
      const clients = this.connectedClients.get(userId);
      if (clients) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.connectedClients.delete(userId);
        }
      }

      console.log(`Client disconnected: ${client.id} for user: ${userId}`);
    }
  }

  @SubscribeMessage('subscribe:bot')
  async subscribeToBot(@ConnectedSocket() client: Socket, @MessageBody() data: { botId: string }) {
    const userId = client.data.userId;
    const hasAccess = await this.gatewayService.validateBotAccess(data.botId, userId);

    if (!hasAccess) {
      client.emit('error', { message: 'Access denied' });
      return;
    }

    client.join(`bot:${data.botId}`);
    client.emit('subscribed', { botId: data.botId });
  }

  @SubscribeMessage('unsubscribe:bot')
  async unsubscribeFromBot(@ConnectedSocket() client: Socket, @MessageBody() data: { botId: string }) {
    client.leave(`bot:${data.botId}`);
    client.emit('unsubscribed', { botId: data.botId });
  }

  // Server-side methods to emit events

  emitBotStatus(botId: string, data: any) {
    this.server.to(`bot:${botId}`).emit('bot:status', data);
  }

  emitBotStats(botId: string, data: any) {
    this.server.to(`bot:${botId}`).emit('bot:stats', data);
  }

  emitNotification(userId: string, data: any) {
    this.server.to(`user:${userId}`).emit('notification:new', data);
  }

  emitDeploymentProgress(botId: string, data: any) {
    this.server.to(`bot:${botId}`).emit('deployment:progress', data);
  }
}
