import { io, Socket } from 'socket.io-client';

interface OnlineUser {
  userId: string;
  username: string;
  currentTrack?: {
    id: string;
    title: string;
    composer: string;
    coverArt?: string;
  };
  connectedAt: Date;
}

type EventCallback = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners = new Map<string, EventCallback[]>();

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io('http://localhost:4000/ws', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reattachListeners();
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Emit now playing
  emitNowPlaying(track: { trackId: string; title: string; composer: string; coverArt?: string }) {
    this.socket?.emit('now_playing', track);
  }

  // Emit stop playing
  emitStopPlaying() {
    this.socket?.emit('stop_playing');
  }

  // Listen to events
  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
    this.socket?.on(event, callback);
  }

  // Remove listener
  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event) || [];
    const filtered = callbacks.filter((cb) => cb !== callback);
    this.listeners.set(event, filtered);
    this.socket?.off(event, callback);
  }

  // Reattach all listeners after reconnect
  private reattachListeners() {
    for (const [event, callbacks] of this.listeners) {
      for (const callback of callbacks) {
        this.socket?.on(event, callback);
      }
    }
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
export type { OnlineUser };