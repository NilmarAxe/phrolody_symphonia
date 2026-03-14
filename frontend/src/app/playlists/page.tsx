'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { playlistsService } from '@/services/playlists.service';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ListMusic, Plus, Globe, Lock, Music } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function PlaylistsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, hydrated, router]);

  const { data: playlists, isLoading } = useQuery({
    queryKey: ['my-playlists'],
    queryFn: () => playlistsService.getMyPlaylists(),
    enabled: isAuthenticated,
  });

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-secondary-200 mb-2">
                My Playlists
              </h1>
              <p className="text-neutral-500">
                Manage and organize your music collections
              </p>
            </div>
            <Link href="/playlists/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Playlist
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : playlists && playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist, index) => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Link href={`/playlists/${playlist.id}`}>
                  <Card className="group hover:border-primary-500 transition-all duration-300 cursor-pointer h-full">
                    <CardContent className="p-0">
                      {/* Cover */}
                      <div className="relative aspect-square overflow-hidden rounded-t-xl">
                        {playlist.coverImage ? (
                          <img
                            src={playlist.coverImage}
                            alt={playlist.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <ListMusic className="w-16 h-16 text-white/50" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-4">
                        <h3 className="font-semibold text-secondary-200 line-clamp-1 group-hover:text-primary-500 transition-colors">
                          {playlist.name}
                        </h3>
                        {playlist.description && (
                          <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                            {playlist.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between mt-3 text-xs text-neutral-600">
                          <span className="flex items-center gap-1">
                            <Music className="w-3 h-3" />
                            {playlist.tracks?.length || 0} tracks
                          </span>
                          {playlist.isPublic ? (
                            <span className="flex items-center gap-1">
                              <Globe className="w-3 h-3" />
                              Public
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <ListMusic className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-secondary-200 mb-2">
              No playlists yet
            </h3>
            <p className="text-neutral-500 mb-6">
              Create your first playlist to organize your favorite tracks
            </p>
            <Link href="/playlists/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
