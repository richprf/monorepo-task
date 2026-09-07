import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import type { Notification } from './notification.types.js';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  /** In-memory presence: which userId currently has an open socket. */
  private readonly onlineUsers = new Map<string, string>();

  handleConnection(client: Socket) {
    const raw = client.handshake.query.userId;
    const userId = Array.isArray(raw) ? raw[0] : raw;

    if (!userId || typeof userId !== 'string' || !userId.trim()) {
      console.log(
        `[Gateway] اتصال رد شد — query.userId موجود نیست (socket ${client.id})`,
      );
      client.disconnect();
      return;
    }

    const id = userId.trim();
    this.onlineUsers.set(id, client.id);
    console.log(`کاربر آنلاین شد: ${id} (socket.id=${client.id})`);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
        console.log(`کاربر آفلاین شد: ${userId} (socket.id=${client.id})`);
        return;
      }
    }
  }

  isUserOnline(userId: string): boolean {
    return this.onlineUsers.has(userId);
  }

  sendToUser(userId: string, notification: Notification): boolean {
    const socketId = this.onlineUsers.get(userId);
    if (!socketId) {
      return false;
    }
    this.server.to(socketId).emit('newNotification', notification);
    return true;
  }
}
