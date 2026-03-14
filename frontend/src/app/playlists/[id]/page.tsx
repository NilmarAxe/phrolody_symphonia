'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playlistsService } from '@/services/playlists.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  Play,
  Music,
  ListMusic,
  Edit,
  Trash2,
  Plus,
  Clock,
  User,
  Globe,
  Lock,
  Users,
} from 'lucide-react';
import { usePlayerStore } from '@/store/player.store';
import { useAuthStore } from '@/store/auth.store';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface PlaylistDetailPageProps {
  params: { id: string };
}

export default function PlaylistDetailPage({ params }: PlaylistDetailPageProps) {
  const { id } = params;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { playTrack, setQueue } = usePlayerStore();

  const { data: playlist, isLoading } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => playlistsService.getPlaylistById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => playlistsService.deletePlaylist(id),
    onSuccess: () => {
      toast.success('Playlist deleted successfully');
      router.push('/playlists');
    },
    onError: () => {
      toast.error('Failed to delete playlist');
    },
  });

  const removeTrackMutation = useMutation({
    mutationFn: (trackId: string) => playlistsService.removeTrack(id, trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlist', id] });
      toast.success('Track removed from playlist');
    },
    onError: () => {
      toast.error('Failed to remove track');
    },
  });

  const handlePlayAll = () => {
    if (playlist?.tracks && playlist.tracks.length > 0) {
      const tracks = playlist.tracks.map((pt) => pt.track);
      setQueue(tracks);
      playTrack(tracks[0]);
    }
  };

  const handlePlayTrack = (index: number) => {
    if (playlist?.tracks) {
      const tracks = playlist.tracks.map((pt) => pt.track);
      setQueue(tracks);
      playTrack(tracks[index]);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  const handleRemoveTrack = (trackId: string) => {
    if (confirm('Remove this track from the playlist?')) {
      removeTrackMutation.mutate(trackId);
    }
  };

  const isOwner = user?.id === playlist?.userId;
  const canEdit = isOwner || playlist?.isCollaborative;
  const totalDuration = playlist?.tracks?.reduce((acc, pt) => acc + pt.track.duration, 0) || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ListMusic className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <h2 className="text-2xl font-display font-bold text-secondary-200 mb-2">
            Playlist not found
          </h2>
          <p className="text-neutral-500 mb-6">The playlist you're looking for doesn't exist</p>
          <Link href="/playlists">
            <Button>Go to Playlists</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-8 items-start"
          >
            {/* Cover Art */}
            <div className="relative w-full md:w-64 aspect-square rounded-xl overflow-hidden flex-shrink-0 shadow-2xl">
              {playlist.coverImage ? (
                <Image
                  src={playlist.coverImage}
                  alt={playlist.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <ListMusic className="w-24 h-24 text-white/50" />
                </div>
              )}
            </div>

            {/* Playlist Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-500/10 border border-accent-500/20 rounded-full text-accent-500 text-sm">
                  <ListMusic className="w-4 h-4" />
                  Playlist
                </div>
                {playlist.isPublic ? (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 rounded-full text-neutral-400 text-xs">
                    <Globe className="w-3 h-3" />
                    Public
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 rounded-full text-neutral-400 text-xs">
                    <Lock className="w-3 h-3" />
                    Private
                  </div>
                )}
                {playlist.isCollaborative && (
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-800 rounded-full text-neutral-400 text-xs">
                    <Users className="w-3 h-3" />
                    Collaborative
                  </div>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-display font-bold text-secondary-200 mb-4">
                {playlist.name}
              </h1>

              {playlist.description && (
                <p className="text-neutral-400 mb-4">{playlist.description}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-neutral-500 mb-6">
                {playlist.user && (
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {playlist.user.username}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  {playlist.tracks?.length || 0} tracks
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {Math.floor(totalDuration / 60)} min
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  onClick={handlePlayAll}
                  disabled={!playlist.tracks || playlist.tracks.length === 0}
                >
                  <Play className="w-5 h-5 mr-2 fill-white" />
                  Play All
                </Button>
                {canEdit && (
                  <Link href={`/playlists/${id}/edit`}>
                    <Button variant="outline" size="lg">
                      <Edit className="w-5 h-5 mr-2" />
                      Edit
                    </Button>
                  </Link>
                )}
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="lg"
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-5 h-5 text-error-500" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tracks List */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {playlist.tracks && playlist.tracks.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-neutral-800 text-xs font-medium text-neutral-500 uppercase">
                  <div className="col-span-1">#</div>
                  <div className="col-span-7">Title</div>
                  <div className="col-span-2 hidden md:block">Composer</div>
                  <div className="col-span-1 hidden md:block">Duration</div>
                  <div className="col-span-1"></div>
                </div>

                {playlist.tracks.map((playlistTrack, index) => {
                  const { track } = playlistTrack;
                  return (
                    <div
                      key={playlistTrack.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800 last:border-b-0 group"
                    >
                      <div className="col-span-1 flex items-center">
                        <span className="text-neutral-500 group-hover:hidden">{index + 1}</span>
                        <button
                          onClick={() => handlePlayTrack(index)}
                          className="hidden group-hover:block text-primary-500"
                        >
                          <Play className="w-4 h-4 fill-primary-500" />
                        </button>
                      </div>

                      <div className="col-span-7 flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded bg-neutral-800 flex-shrink-0 overflow-hidden">
                          {track.coverArt ? (
                            <Image
                              src={track.coverArt}
                              alt={track.title}
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                              <Music className="w-5 h-5 text-white/50" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/tracks/${track.id}`}
                            className="font-medium text-secondary-200 hover:text-primary-500 transition-colors line-clamp-1 block"
                          >
                            {track.title}
                          </Link>
                          <p className="text-sm text-neutral-500 line-clamp-1 md:hidden">
                            {track.composer}
                          </p>
                        </div>
                      </div>

                      <div className="col-span-2 hidden md:flex items-center">
                        <Link
                          href={`/browse?composer=${encodeURIComponent(track.composer)}`}
                          className="text-sm text-neutral-400 hover:text-primary-500 transition-colors line-clamp-1"
                        >
                          {track.composer}
                        </Link>
                      </div>

                      <div className="col-span-1 hidden md:flex items-center text-sm text-neutral-500">
                        {Math.floor(track.duration / 60)}:
                        {(track.duration % 60).toString().padStart(2, '0')}
                      </div>

                      <div className="col-span-1 flex items-center justify-end">
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveTrack(track.id)}
                            className="p-2 rounded-lg text-neutral-500 hover:text-error-500 hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Music className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                <h3 className="text-xl font-display font-semibold text-secondary-200 mb-2">
                  No tracks yet
                </h3>
                <p className="text-neutral-500 mb-6">
                  {canEdit ? 'Start adding tracks to this playlist' : 'This playlist is empty'}
                </p>
                {canEdit && (
                  <Link href="/browse">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Browse Music
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
