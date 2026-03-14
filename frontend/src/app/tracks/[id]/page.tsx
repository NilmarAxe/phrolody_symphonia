'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tracksService } from '@/services/tracks.service';
import { favoritesService } from '@/services/favorites.service';
import { useAuthStore } from '@/store/auth.store';
import { AddToPlaylistModal } from '@/components/modals/AddToPlaylistModal';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Play,
  Music,
  Clock,
  Calendar,
  Radio,
  Heart,
  Share2,
  Plus,
  BarChart3,
} from 'lucide-react';
import { usePlayerStore } from '@/store/player.store';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface TrackDetailPageProps {
  params: { id: string };
}

export default function TrackDetailPage({ params }: TrackDetailPageProps) {
  const { id } = params;
  const { playTrack, setQueue } = usePlayerStore();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);

  const { data: track, isLoading } = useQuery({
    queryKey: ['track', id],
    queryFn: () => tracksService.getTrackById(id),
  });

  const { data: isFavorite } = useQuery({
    queryKey: ['favorite-status', id],
    queryFn: () => favoritesService.isFavorite(id),
    enabled: isAuthenticated,
  });

  const favoriteMutation = useMutation({
    mutationFn: () => favoritesService.toggleFavorite(id, isFavorite ?? false),
    onSuccess: (newStatus) => {
      queryClient.setQueryData(['favorite-status', id], newStatus);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success(newStatus ? 'Added to favorites!' : 'Removed from favorites');
    },
    onError: () => toast.error('Failed to update favorites'),
  });

  const handlePlay = () => {
    if (track) {
      setQueue([track]);
      playTrack(track);
    }
  };

  const handleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      return;
    }
    favoriteMutation.mutate();
  };

  const handleAddToPlaylist = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to playlist');
      return;
    }
    setShowPlaylistModal(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: track?.title,
        text: `Check out ${track?.title} by ${track?.composer}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-secondary-200 mb-2">
            Track not found
          </h2>
          <p className="text-neutral-500 mb-6">The track you're looking for doesn't exist</p>
          <Link href="/browse">
            <Button>Browse Music</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="relative bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 items-start"
          >
            {/* Cover Art */}
            <div className="relative w-full md:w-80 aspect-square rounded-xl overflow-hidden flex-shrink-0 shadow-2xl">
              {track.coverArt ? (
                <Image src={track.coverArt} alt={track.title} fill className="object-cover" priority />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <Music className="w-32 h-32 text-white/50" />
                </div>
              )}
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-500 text-sm mb-4">
                <Radio className="w-4 h-4" />
                Track
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary-200 mb-4 line-clamp-2">
                {track.title}
              </h1>

              <Link
                href={`/browse?composer=${encodeURIComponent(track.composer)}`}
                className="text-xl text-neutral-400 hover:text-primary-500 transition-colors inline-block mb-6"
              >
                {track.composer}
              </Link>

              <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-6">
                {track.year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {track.year}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                </div>
                <div className="flex items-center gap-1">
                  <BarChart3 className="w-4 h-4" />
                  {track.playCount.toLocaleString()} plays
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <Button size="lg" onClick={handlePlay}>
                  <Play className="w-5 h-5 mr-2 fill-white" />
                  Play
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleFavorite}
                  disabled={favoriteMutation.isPending}
                  className={isFavorite ? 'text-primary-500 border-primary-500' : ''}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isFavorite ? 'fill-primary-500 text-primary-500' : ''}`} />
                  {isFavorite ? 'Favorited' : 'Favorite'}
                </Button>
                <Button variant="outline" size="lg" onClick={handleAddToPlaylist}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Playlist
                </Button>
                <Button variant="ghost" size="lg" onClick={handleShare}>
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {track.description && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-display font-semibold text-secondary-200 mb-4">
                    About This Track
                  </h2>
                  <p className="text-neutral-400 leading-relaxed">{track.description}</p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-display font-semibold text-secondary-200 mb-4">
                  Credits
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Composer</span>
                    <span className="text-secondary-200 font-medium">{track.composer}</span>
                  </div>
                  {track.performer && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Performer</span>
                      <span className="text-secondary-200 font-medium">{track.performer}</span>
                    </div>
                  )}
                  {track.conductor && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Conductor</span>
                      <span className="text-secondary-200 font-medium">{track.conductor}</span>
                    </div>
                  )}
                  {track.orchestra && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Orchestra</span>
                      <span className="text-secondary-200 font-medium">{track.orchestra}</span>
                    </div>
                  )}
                  {track.uploadedBy && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Uploaded by</span>
                      <span className="text-secondary-200 font-medium">{track.uploadedBy.username}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-display font-semibold text-secondary-200 mb-4">
                  Musical Details
                </h3>
                <div className="space-y-3 text-sm">
                  {track.opus && (
                    <div>
                      <div className="text-neutral-500 mb-1">Opus</div>
                      <div className="text-secondary-200 font-medium">{track.opus}</div>
                    </div>
                  )}
                  {track.catalogNumber && (
                    <div>
                      <div className="text-neutral-500 mb-1">Catalog Number</div>
                      <div className="text-secondary-200 font-medium">{track.catalogNumber}</div>
                    </div>
                  )}
                  {track.movement && (
                    <div>
                      <div className="text-neutral-500 mb-1">Movement</div>
                      <div className="text-secondary-200 font-medium">{track.movement}</div>
                    </div>
                  )}
                  {track.key && (
                    <div>
                      <div className="text-neutral-500 mb-1">Key</div>
                      <div className="text-secondary-200 font-medium">{track.key}</div>
                    </div>
                  )}
                  {track.genre && (
                    <div>
                      <div className="text-neutral-500 mb-1">Genre</div>
                      <Link href={`/browse?genreId=${track.genre.id}`} className="text-primary-500 hover:text-primary-400 font-medium">
                        {track.genre.name}
                      </Link>
                    </div>
                  )}
                  {track.period && (
                    <div>
                      <div className="text-neutral-500 mb-1">Period</div>
                      <Link href={`/browse?periodId=${track.period.id}`} className="text-primary-500 hover:text-primary-400 font-medium">
                        {track.period.name}
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-display font-semibold text-secondary-200 mb-4">
                  Technical Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Format</span>
                    <span className="text-secondary-200 font-medium uppercase">{track.audioFormat}</span>
                  </div>
                  {track.bitrate && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Bitrate</span>
                      <span className="text-secondary-200 font-medium">{track.bitrate} kbps</span>
                    </div>
                  )}
                  {track.sampleRate && (
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Sample Rate</span>
                      <span className="text-secondary-200 font-medium">{track.sampleRate} Hz</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-neutral-500">File Size</span>
                    <span className="text-secondary-200 font-medium">
                      {(track.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AddToPlaylistModal
        trackId={id}
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
      />
    </div>
  );
}