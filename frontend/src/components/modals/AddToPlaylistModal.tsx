'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistsService } from '@/services/playlists.service';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Music, Plus, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface AddToPlaylistModalProps {
  trackId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToPlaylistModal({ trackId, isOpen, onClose }: AddToPlaylistModalProps) {
  const [addedPlaylists, setAddedPlaylists] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['my-playlists'],
    queryFn: () => playlistsService.getMyPlaylists(),
    enabled: isOpen,
  });

  const addMutation = useMutation({
    mutationFn: (playlistId: string) => playlistsService.addTrack(playlistId, trackId),
    onSuccess: (_, playlistId) => {
      setAddedPlaylists((prev) => new Set([...prev, playlistId]));
      queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] });
      toast.success('Track added to playlist!');
    },
    onError: () => toast.error('Failed to add track to playlist'),
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <h2 className="text-xl font-display font-semibold text-secondary-200">
              Add to Playlist
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-500 hover:text-secondary-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            ) : playlists && playlists.length > 0 ? (
              <div className="space-y-2">
                {playlists.map((playlist) => {
                  const isAdded = addedPlaylists.has(playlist.id);
                  return (
                    <div
                      key={playlist.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-800 transition-colors"
                    >
                      {/* Cover */}
                      <div className="w-12 h-12 rounded-lg bg-neutral-800 flex-shrink-0 overflow-hidden">
                        {playlist.coverImage ? (
                          <Image
                            src={playlist.coverImage}
                            alt={playlist.name}
                            width={48}
                            height={48}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-500/30 to-primary-700/30 flex items-center justify-center">
                            <Music className="w-5 h-5 text-primary-400" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-secondary-200 line-clamp-1">{playlist.name}</p>
                        <p className="text-sm text-neutral-500">
                          {playlist.tracks?.length ?? 0} tracks
                        </p>
                      </div>

                      {/* Add Button */}
                      <button
                        onClick={() => !isAdded && addMutation.mutate(playlist.id)}
                        disabled={isAdded || addMutation.isPending}
                        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                          isAdded
                            ? 'text-green-500 bg-green-500/10'
                            : 'text-neutral-500 hover:text-primary-500 hover:bg-primary-500/10'
                        }`}
                      >
                        {isAdded ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          <Plus className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-500 mb-4">No playlists yet</p>
                <Button size="sm" onClick={onClose}>
                  Create a Playlist
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}