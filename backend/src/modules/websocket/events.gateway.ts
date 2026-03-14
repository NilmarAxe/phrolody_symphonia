import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface ConnectedUser {
  userId: string;
  username: string;
  socketId: string;
  currentTrack?: {
    id: string;
    title: string;
    composer: string;
    coverArt?: string;
  };
  connectedAt: Date;
}

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/ws',
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private connectedUsers = new Map<string, ConnectedUser>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user: ConnectedUser = {
        userId: payload.sub,
        username: payload.username || payload.email?.split('@')[0] || 'User',
        socketId: client.id,
        connectedAt: new Date(),
      };

      this.connectedUsers.set(client.id, user);
      client.data.userId = payload.sub;
      client.data.username = user.username;

      this.logger.log(`User connected: ${user.username} (${client.id})`);

      // Notify all clients of new user count
      this.broadcastOnlineCount();

      // Send current online users to new client
      client.emit('online_users', this.getOnlineUsers());
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.logger.log(`User disconnected: ${user.username} (${client.id})`);
      this.connectedUsers.delete(client.id);
      this.broadcastOnlineCount();
      this.broadcastOnlineUsers();
    }
  }

  @SubscribeMessage('now_playing')
  handleNowPlaying(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { trackId: string; title: string; composer: string; coverArt?: string },
  ) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    user.currentTrack = {
      id: data.trackId,
      title: data.title,
      composer: data.composer,
      coverArt: data.coverArt,
    };

    this.connectedUsers.set(client.id, user);

    // Broadcast updated online users
    this.broadcastOnlineUsers();
  }

  @SubscribeMessage('stop_playing')
  handleStopPlaying(@ConnectedSocket() client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (!user) return;

    user.currentTrack = undefined;
    this.connectedUsers.set(client.id, user);
    this.broadcastOnlineUsers();
  }

  // Emit to all clients
  broadcastOnlineCount() {
    this.server.emit('online_count', { count: this.connectedUsers.size });
  }

  broadcastOnlineUsers() {
    this.server.emit('online_users', this.getOnlineUsers());
  }

  // Notify specific user of an event (favorites, playlists)
  notifyUser(userId: string, event: string, data: any) {
    for (const [, user] of this.connectedUsers) {
      if (user.userId === userId) {
        this.server.to(user.socketId).emit(event, data);
      }
    }
  }

  // Broadcast to everyone except sender
  broadcastToOthers(socketId: string, event: string, data: any) {
    this.server.except(socketId).emit(event, data);
  }

  private getOnlineUsers() {
    return Array.from(this.connectedUsers.values()).map((u) => ({
      userId: u.userId,
      username: u.username,
      currentTrack: u.currentTrack,
      connectedAt: u.connectedAt,
    }));
  }

  getOnlineCount(): number {
    return this.connectedUsers.size;
  }
}