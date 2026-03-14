'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { usersService } from '@/services/users.service';
import { playlistsService } from '@/services/playlists.service';
import { useAuthStore } from '@/store/auth.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import {
  User,
  Mail,
  Calendar,
  Music,
  ListMusic,
  Heart,
  Clock,
  Edit,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, hydrated, router]);

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => usersService.getMyStats(),
    enabled: isAuthenticated,
  });

  const { data: playlists } = useQuery({
    queryKey: ['my-playlists'],
    queryFn: () => playlistsService.getMyPlaylists(),
    enabled: isAuthenticated,
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Profile Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-6 items-start"
          >
            {/* Avatar */}
            <div className="relative w-32 h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-neutral-800">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.username} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-secondary-200">
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user?.username}
                </h1>
                <span className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-full text-primary-500 text-xs font-medium uppercase">
                  {user?.role}
                </span>
              </div>

              <p className="text-neutral-400 mb-4">@{user?.username}</p>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 text-sm mb-6">
                <div>
                  <div className="text-2xl font-display font-bold text-primary-500">
                    {stats?.totalPlaylists || 0}
                  </div>
                  <div className="text-neutral-500">Playlists</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-accent-500">
                    {stats?.totalFavorites || 0}
                  </div>
                  <div className="text-neutral-500">Favorites</div>
                </div>
                <div>
                  <div className="text-2xl font-display font-bold text-tertiary-400">
                    {stats?.totalPlayHistory || 0}
                  </div>
                  <div className="text-neutral-500">Plays</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <Link href="/profile/edit">
                  <Button variant="outline">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* My Playlists */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-bold text-secondary-200">
                  My Playlists
                </h2>
                <Link href="/playlists/create">
                  <Button size="sm">Create Playlist</Button>
                </Link>
              </div>

              {playlists && playlists.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {playlists.map((playlist) => (
                    <Link key={playlist.id} href={`/playlists/${playlist.id}`}>
                      <Card className="group hover:border-primary-500 transition-all duration-300 cursor-pointer h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                              <ListMusic className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-secondary-200 line-clamp-1 group-hover:text-primary-500 transition-colors">
                                {playlist.name}
                              </h3>
                              <p className="text-sm text-neutral-500 mt-1 line-clamp-2">
                                {playlist.description || 'No description'}
                              </p>
                              <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                                <span>{playlist.tracks?.length || 0} tracks</span>
                                {playlist.isPublic && (
                                  <span className="text-primary-500">Public</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ListMusic className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-secondary-200 mb-2">
                      No playlists yet
                    </h3>
                    <p className="text-neutral-500 mb-4">
                      Create your first playlist to organize your favorite tracks
                    </p>
                    <Link href="/playlists/create">
                      <Button>Create Playlist</Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-2xl font-display font-bold text-secondary-200 mb-6">
                Recent Activity
              </h2>

              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    {stats.recentActivity.map((activity) => (
                      <Link
                        key={activity.id}
                        href={`/tracks/${activity.track.id}`}
                        className="flex items-center gap-4 p-4 hover:bg-neutral-800/50 transition-colors border-b border-neutral-800 last:border-b-0"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                          {activity.track.coverArt ? (
                            <Image
                              src={activity.track.coverArt}
                              alt={activity.track.title}
                              width={48}
                              height={48}
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                              <Music className="w-6 h-6 text-white/50" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-secondary-200 line-clamp-1">
                            {activity.track.title}
                          </h4>
                          <p className="text-sm text-neutral-500 line-clamp-1">
                            {activity.track.composer}
                          </p>
                        </div>
                        <div className="text-xs text-neutral-600 flex-shrink-0">
                          {new Date(activity.playedAt).toLocaleDateString()}
                        </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Clock className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-secondary-200 mb-2">
                      No activity yet
                    </h3>
                    <p className="text-neutral-500">
                      Start listening to see your recent activity here
                    </p>
                  </CardContent>
                </Card>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle>Account Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-neutral-500">Email</div>
                    <div className="text-secondary-200 break-all">{user?.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-neutral-500">Member since</div>
                    <div className="text-secondary-200">{formatDate(user?.createdAt)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-neutral-500" />
                  <div>
                    <div className="text-neutral-500">Last login</div>
                    <div className="text-secondary-200">{formatDate(user?.lastLoginAt)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link
                  href="/favorites"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <Heart className="w-5 h-5 text-primary-500" />
                  <span className="text-secondary-200">My Favorites</span>
                </Link>
                <Link
                  href="/library"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-neutral-800 transition-colors"
                >
                  <Music className="w-5 h-5 text-accent-500" />
                  <span className="text-secondary-200">My Library</span>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
