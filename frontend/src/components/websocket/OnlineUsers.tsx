'use client';

import { useSocket } from '@/hooks/useSocket';
import { Music } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function OnlineUsers() {
  const { onlineUsers, onlineCount } = useSocket();

  const usersListening = onlineUsers.filter((u) => u.currentTrack);

  return (
    <div className="px-2 py-3 border-t border-neutral-800">
      {/* Online count */}
      <div className="flex items-center gap-2 px-3 py-2 mb-2">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-xs text-neutral-500">
          {onlineCount} {onlineCount === 1 ? 'user' : 'users'} online
        </span>
      </div>

      {/* Users listening */}
      <AnimatePresence>
        {usersListening.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1"
          >
            <p className="text-xs text-neutral-600 px-3 mb-1 flex items-center gap-1">
              <Music className="w-3 h-3" />
              Now listening
            </p>
            {usersListening.slice(0, 3).map((user) => (
              <motion.div
                key={user.userId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs text-primary-400 font-medium">
                    {user.username[0].toUpperCase()}
                  </span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-neutral-400 font-medium truncate">
                    {user.username}
                  </p>
                  {user.currentTrack && (
                    <p className="text-xs text-neutral-600 truncate">
                      {user.currentTrack.title}
                    </p>
                  )}
                </div>

                {/* Cover */}
                {user.currentTrack?.coverArt && (
                  <div className="w-6 h-6 rounded flex-shrink-0 overflow-hidden">
                    <Image
                      src={user.currentTrack.coverArt}
                      alt={user.currentTrack.title}
                      width={24}
                      height={24}
                      className="object-cover"
                    />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}