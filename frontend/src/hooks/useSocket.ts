'use client';

import { useEffect, useState, useCallback } from 'react';
import { socketService, OnlineUser } from '@/services/socket.service';
import { useAuthStore } from '@/store/auth.store';
import { usePlayerStore } from '@/store/player.store';
import { authService } from '@/services/auth.service';

export function useSocket() {
  const { isAuthenticated } = useAuthStore();
  const { currentTrack, isPlaying } = usePlayerStore();
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Connect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const token = authService.getAccessToken();
      if (!token) return;
      socketService.connect(token);
      setIsConnected(true);

      const handleOnlineUsers = (users: OnlineUser[]) => {
        setOnlineUsers(users);
        setOnlineCount(users.length);
      };

      const handleOnlineCount = (data: { count: number }) => {
        setOnlineCount(data.count);
      };

      socketService.on('online_users', handleOnlineUsers);
      socketService.on('online_count', handleOnlineCount);

      return () => {
        socketService.off('online_users', handleOnlineUsers);
        socketService.off('online_count', handleOnlineCount);
      };
    } else {
      socketService.disconnect();
      setIsConnected(false);
      setOnlineUsers([]);
      setOnlineCount(0);
    }
  }, [isAuthenticated]);

  // Emit now playing when track changes
  useEffect(() => {
    if (!isConnected) return;

    if (currentTrack && isPlaying) {
      socketService.emitNowPlaying({
        trackId: currentTrack.id,
        title: currentTrack.title,
        composer: currentTrack.composer,
        coverArt: currentTrack.coverArt,
      });
    } else if (!isPlaying) {
      socketService.emitStopPlaying();
    }
  }, [currentTrack, isPlaying, isConnected]);

  const onNotification = useCallback((callback: (data: any) => void) => {
    socketService.on('notification', callback);
    return () => socketService.off('notification', callback);
  }, []);

  return {
    onlineUsers,
    onlineCount,
    isConnected,
    onNotification,
  };
}