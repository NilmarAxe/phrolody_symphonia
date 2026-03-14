'use client';

import { useQuery } from '@tanstack/react-query';
import { tracksService } from '@/services/tracks.service';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Play, Music, Clock } from 'lucide-react';
import { usePlayerStore } from '@/store/player.store';
import { motion } from 'framer-motion';
import Image from 'next/image';

export function RecentTracks() {
  const { data: tracks, isLoading } = useQuery({
    queryKey: ['tracks', 'recent'],
    queryFn: () => tracksService.getRecentTracks(10),
  });

  const { playTrack, setQueue } = usePlayerStore();

  const handlePlayTrack = (index: number) => {
    if (tracks) {
      setQueue(tracks);
      playTrack(tracks[index]);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (!tracks || tracks.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-secondary-200">
            Recent Additions
          </h2>
          <p className="text-neutral-500 mt-1">Newly added classical pieces</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tracks.map((track, index) => (
          <motion.div
            key={track.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card className="group hover:border-accent-500 transition-all duration-300 cursor-pointer">
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
                    <div className="w-full h-full bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center">
                      <Music className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      onClick={() => handlePlayTrack(index)}
                      className="player-control-primary"
                      aria-label={`Play ${track.title}`}
                    >
                      <Play className="w-6 h-6 fill-white" />
                    </button>
                  </div>

                  {/* New Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 bg-accent-500 rounded-full text-xs text-white font-medium">
                    NEW
                  </div>

                  {/* Date Badge */}
                  <div className="absolute top-3 right-3 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-full text-xs text-secondary-200 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(track.createdAt)}
                  </div>
                </div>

                {/* Track Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-secondary-200 line-clamp-1 group-hover:text-accent-500 transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-1">
                    {track.composer}
                  </p>
                  {track.year && (
                    <p className="text-xs text-neutral-600 mt-1">
                      Composed in {track.year}
                    </p>
                  )}
                  
                  {/* Duration & Period */}
                  <div className="flex items-center justify-between mt-3 text-xs text-neutral-600">
                    <span>{Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}</span>
                    {track.period && <span>{track.period.name}</span>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}