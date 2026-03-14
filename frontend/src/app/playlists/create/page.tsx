'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ListMusic, Save, ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { playlistsService } from '@/services/playlists.service';
import { useRequireAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';
import Link from 'next/link';

const playlistSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters'),
  description: z.string().max(500, 'Description must not exceed 500 characters').optional(),
  coverImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isPublic: z.boolean().default(false),
  isCollaborative: z.boolean().default(false),
});

type PlaylistFormData = z.infer<typeof playlistSchema>;

export default function CreatePlaylistPage() {
  useRequireAuth();
  const router = useRouter();
  const [coverPreview, setCoverPreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
    defaultValues: {
      isPublic: false,
      isCollaborative: false,
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: PlaylistFormData) => playlistsService.createPlaylist(data),
    onSuccess: (playlist) => {
      toast.success('Playlist created successfully!');
      router.push(`/playlists/${playlist.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create playlist');
    },
  });

  const onSubmit = (data: PlaylistFormData) => {
    createMutation.mutate(data);
  };

  const handleCoverImageChange = (url: string) => {
    setValue('coverImage', url);
    setCoverPreview(url);
  };

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-8">
          <Link href="/playlists" className="inline-flex items-center text-neutral-400 hover:text-secondary-200 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Playlists
          </Link>
          <h1 className="text-3xl font-display font-bold text-secondary-200">
            Create Playlist
          </h1>
          <p className="text-neutral-500 mt-2">
            Create a new playlist to organize your favorite tracks
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ListMusic className="w-5 h-5 text-primary-500" />
                  Playlist Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Cover Image Preview */}
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-gradient-primary flex items-center justify-center">
                      {coverPreview ? (
                        <>
                          <img
                            src={coverPreview}
                            alt="Playlist cover"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setCoverPreview('');
                              setValue('coverImage', '');
                            }}
                            className="absolute top-2 right-2 p-2 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </>
                      ) : (
                        <Upload className="w-16 h-16 text-white/50" />
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <Input
                    {...register('name')}
                    label="Playlist Name"
                    placeholder="My Awesome Playlist"
                    error={errors.name?.message}
                    disabled={createMutation.isPending}
                  />

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-200 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      {...register('description')}
                      placeholder="Tell us about your playlist..."
                      rows={4}
                      className="input-field resize-none"
                      disabled={createMutation.isPending}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-error-500" role="alert">
                        {errors.description.message}
                      </p>
                    )}
                  </div>

                  {/* Cover Image URL */}
                  <div>
                    <Input
                      {...register('coverImage')}
                      label="Cover Image URL (Optional)"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      error={errors.coverImage?.message}
                      helperText="Enter a URL to an image for your playlist cover"
                      disabled={createMutation.isPending}
                      onChange={(e) => handleCoverImageChange(e.target.value)}
                    />
                  </div>

                  {/* Settings */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-secondary-200">Settings</h3>

                    <label className="flex items-center justify-between p-4 rounded-lg bg-neutral-900 cursor-pointer hover:bg-neutral-800 transition-colors">
                      <div>
                        <div className="font-medium text-secondary-200">Public Playlist</div>
                        <div className="text-sm text-neutral-500">
                          Anyone can see and listen to this playlist
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        {...register('isPublic')}
                        className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                        disabled={createMutation.isPending}
                      />
                    </label>

                    <label className="flex items-center justify-between p-4 rounded-lg bg-neutral-900 cursor-pointer hover:bg-neutral-800 transition-colors">
                      <div>
                        <div className="font-medium text-secondary-200">Collaborative</div>
                        <div className="text-sm text-neutral-500">
                          Allow others to add tracks to this playlist
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        {...register('isCollaborative')}
                        className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-primary-500 focus:ring-primary-500 focus:ring-offset-0"
                        disabled={createMutation.isPending}
                      />
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <Button
                      type="submit"
                      className="flex-1"
                      isLoading={createMutation.isPending}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Create Playlist
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.back()}
                      disabled={createMutation.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
