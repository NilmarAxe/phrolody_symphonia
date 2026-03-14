'use client';

import { useQuery } from '@tanstack/react-query';
import { tracksService } from '@/services/tracks.service';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Play, Music, Sparkles } from 'lucide-react';
import { usePlayerStore } from '@/store/player.store';
import { useAuthStore } from '@/store/auth.store';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export function RecommendedTracks() {
  const { isAuthenticated } = useAuthStore();
  const { playTrack, setQueue } = usePlayerStore();

  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks', 'recommendations'],
    queryFn: () => tracksService.getRecommendations(8),
    enabled: isAuthenticated,
  });

  const handlePlayTrack = (index: number) => {
    if (tracks) {
      setQueue(tracks);
      playTrack(tracks[index]);
    }
  };

  if (!isAuthenticated) return null;
  if (isLoading) return <LoadingSpinner className="py-12" />;
  if (!tracks || tracks.length === 0) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-secondary-200 flex items-center gap-3">
            <Sparkles className="w-7 h-7 text-primary-500" />
            Recommended For You
          </h2>
          <p className="text-neutral-500 mt-1">Based on your listening history</p>
        </div>
        <Link
          href="/browse"
          className="text-sm text-primary-500 hover:text-primary-400 transition-colors"
        >
          See all →
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Link href={`/tracks/${track.id}`}>
              <Card className="group hover:border-primary-500 transition-all duration-300 cursor-pointer">
                <CardContent className="p-0">
                  {/* Cover Art */}
                  <div className="relative aspect-square overflow-hidden rounded-t-xl">
                    {track.coverArt ? (
                      <Image
                        src={track.coverArt}
                        alt={track.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                        <Music className="w-16 h-16 text-white/50" />
                      </div>
                    )}

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        onClick={(e) => { e.preventDefault(); handlePlayTrack(index); }}
                        className="player-control-primary"
                        aria-label={`Play ${track.title}`}
                      >
                        <Play className="w-6 h-6 fill-white" />
                      </button>
                    </div>

                    {/* Recommended Badge */}
                    <div className="absolute top-3 left-3 px-2 py-1 bg-primary-500/80 backdrop-blur-sm rounded-full text-xs text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      For you
                    </div>
                  </div>

                  {/* Track Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-secondary-200 line-clamp-1 group-hover:text-primary-500 transition-colors">
                      {track.title}
                    </h3>
                    <p className="text-sm text-neutral-500 mt-1 line-clamp-1">
                      {track.composer}
                    </p>
                    {track.performer && (
                      <p className="text-xs text-neutral-600 mt-1 line-clamp-1">
                        {track.performer}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3 text-xs text-neutral-600">
                      <span>
                        {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                      </span>
                      {track.genre && <span>{track.genre.name}</span>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}