'use client';

import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { favoritesService } from '@/services/favorites.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Heart, Play, Music, Trash2 } from 'lucide-react';
import { usePlayerStore } from '@/store/player.store';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { playTrack, setQueue } = usePlayerStore();
  const queryClient = useQueryClient();

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, hydrated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getFavorites(),
    enabled: hydrated && isAuthenticated,
  });

  const favorites = data?.data ?? [];

  const removeMutation = useMutation({
    mutationFn: (trackId: string) => favoritesService.removeFavorite(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Removed from favorites');
    },
    onError: () => toast.error('Failed to remove from favorites'),
  });

  const handlePlayAll = () => {
    if (favorites.length > 0) {
      setQueue(favorites);
      playTrack(favorites[0]);
    }
  };

  if (!hydrated || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-display font-bold text-secondary-200 mb-2 flex items-center gap-3">
                <Heart className="w-8 h-8 text-primary-500" />
                My Favorites
              </h1>
              <p className="text-neutral-500">
                {favorites.length} tracks you love
              </p>
            </div>
            {favorites.length > 0 && (
              <Button onClick={handlePlayAll}>
                <Play className="w-4 h-4 mr-2 fill-white" />
                Play All
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <LoadingSpinner className="py-12" />
        ) : favorites.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-neutral-800 text-xs font-medium text-neutral-500 uppercase">
                <div className="col-span-1">#</div>
                <div className="col-span-7">Title</div>
                <div className="col-span-2 hidden md:block">Composer</div>
                <div className="col-span-1 hidden md:block">Duration</div>
                <div className="col-span-1"></div>
              </div>

              {favorites.map((track, index) => (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800 last:border-b-0 group"
                >
                  <div className="col-span-1 flex items-center">
                    <span className="text-neutral-500 group-hover:hidden">{index + 1}</span>
                    <button onClick={() => { setQueue(favorites); playTrack(track); }} className="hidden group-hover:block text-primary-500">
                      <Play className="w-4 h-4 fill-primary-500" />
                    </button>
                  </div>

                  <div className="col-span-7 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded bg-neutral-800 flex-shrink-0 overflow-hidden">
                      {track.coverArt ? (
                        <Image src={track.coverArt} alt={track.title} width={40} height={40} className="object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                          <Music className="w-5 h-5 text-white/50" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <Link href={`/tracks/${track.id}`} className="font-medium text-secondary-200 hover:text-primary-500 transition-colors line-clamp-1 block">
                        {track.title}
                      </Link>
                      <p className="text-sm text-neutral-500 line-clamp-1 md:hidden">{track.composer}</p>
                    </div>
                  </div>

                  <div className="col-span-2 hidden md:flex items-center">
                    <span className="text-sm text-neutral-400 line-clamp-1">{track.composer}</span>
                  </div>

                  <div className="col-span-1 hidden md:flex items-center text-sm text-neutral-500">
                    {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                  </div>

                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={() => removeMutation.mutate(track.id)}
                      className="p-2 rounded-lg text-neutral-500 hover:text-error-500 hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        ) : (
          <div className="text-center py-24">
            <Heart className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
            <h3 className="text-xl font-display font-semibold text-secondary-200 mb-2">No favorites yet</h3>
            <p className="text-neutral-500 mb-6">Start adding tracks to your favorites</p>
            <Link href="/browse"><Button>Browse Music</Button></Link>
          </div>
        )}
      </div>
    </div>
  );
}