'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { usersService } from '@/services/users.service';
import { playlistsService } from '@/services/playlists.service';
import { favoritesService } from '@/services/favorites.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Music, ListMusic, Heart, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function LibraryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'history' | 'playlists' | 'favorites'>('history');

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, hydrated, router]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersService.getMyStats(),
    enabled: isAuthenticated,
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ['my-playlists'],
    queryFn: () => playlistsService.getMyPlaylists(),
    enabled: isAuthenticated,
  });

  const { data: favoritesData, isLoading: favoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoritesService.getFavorites(),
    enabled: isAuthenticated,
  });

  const favorites = favoritesData?.data ?? [];

  if (!hydrated || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  const tabs = [
    { id: 'history', label: 'Recently Played', icon: Clock },
    { id: 'playlists', label: 'Playlists', icon: ListMusic },
    { id: 'favorites', label: 'Favorites', icon: Heart },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-display font-bold text-secondary-200 mb-2">My Library</h1>
          <p className="text-neutral-500">Your personal music collection</p>
          <div className="flex flex-wrap gap-8 mt-6">
            <div>
              <div className="text-2xl font-display font-bold text-primary-500">{playlists?.length || 0}</div>
              <div className="text-sm text-neutral-500">Playlists</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-accent-500">{favorites.length}</div>
              <div className="text-sm text-neutral-500">Favorites</div>
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-tertiary-400">{stats?.totalPlayHistory || 0}</div>
              <div className="text-sm text-neutral-500">Total Plays</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-8 border-b border-neutral-800">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-primary-500 text-primary-500'
                  : 'border-transparent text-neutral-500 hover:text-secondary-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'history' && (
          <div>
            {statsLoading ? <LoadingSpinner /> : stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  {stats.recentActivity.map((activity: any, index: number) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="flex items-center gap-4 p-4 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800 last:border-b-0"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                        {activity.track.coverArt ? (
                          <Image src={activity.track.coverArt} alt={activity.track.title} width={48} height={48} className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                            <Music className="w-6 h-6 text-white/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/tracks/${activity.track.id}`} className="font-medium text-secondary-200 hover:text-primary-500 transition-colors line-clamp-1 block">
                          {activity.track.title}
                        </Link>
                        <p className="text-sm text-neutral-500">{activity.track.composer}</p>
                      </div>
                      <div className="text-xs text-neutral-600">
                        {new Date(activity.playedAt).toLocaleDateString()}
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            ) : (
              <div className="text-center py-24">
                <Clock className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                <h3 className="text-xl font-display font-semibold text-secondary-200 mb-2">No activity yet</h3>
                <p className="text-neutral-500 mb-6">Start listening to see your history here</p>
                <Link href="/browse"><Button>Browse Music</Button></Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'playlists' && (
          <div>
            {playlistsLoading ? <LoadingSpinner /> : playlists && playlists.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {playlists.map((playlist, index) => (
                  <motion.div key={playlist.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Link href={`/playlists/${playlist.id}`}>
                      <Card className="group hover:border-primary-500 transition-all duration-300 cursor-pointer">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                              <ListMusic className="w-7 h-7 text-white" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-secondary-200 line-clamp-1 group-hover:text-primary-500 transition-colors">{playlist.name}</h3>
                              <p className="text-sm text-neutral-500">{(playlist as any).tracks?.length || 0} tracks</p>
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
                <h3 className="text-xl font-display font-semibold text-secondary-200 mb-2">No playlists yet</h3>
                <Link href="/playlists/create"><Button>Create Playlist</Button></Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div>
            {favoritesLoading ? <LoadingSpinner /> : favorites.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((track, index) => (
                  <motion.div key={track.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                    <Link href={`/tracks/${track.id}`}>
                      <Card className="group hover:border-primary-500 transition-all duration-300 cursor-pointer">
                        <CardContent className="p-0">
                          <div className="relative aspect-square overflow-hidden rounded-t-xl">
                            {track.coverArt ? (
                              <Image src={track.coverArt} alt={track.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                                <Music className="w-16 h-16 text-white/50" />
                              </div>
                            )}
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold text-secondary-200 line-clamp-1 group-hover:text-primary-500 transition-colors">{track.title}</h3>
                            <p className="text-sm text-neutral-500 mt-1">{track.composer}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <Heart className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                <h3 className="text-xl font-display font-semibold text-secondary-200 mb-2">No favorites yet</h3>
                <Link href="/browse"><Button>Browse Music</Button></Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}