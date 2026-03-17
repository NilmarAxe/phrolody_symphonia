'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { usersService } from '@/services/users.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { User, ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, hydrated, router]);

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      avatar: user?.avatar || '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersService.updateProfile(data),
    onSuccess: (updatedUser) => {
      setUser(updatedUser);
      toast.success('Profile updated successfully!');
      router.push('/profile');
    },
    onError: () => toast.error('Failed to update profile'),
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
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/profile">
              <button className="p-2 rounded-lg text-neutral-400 hover:text-secondary-200 hover:bg-neutral-800 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
            </Link>
            <h1 className="text-4xl font-display font-bold text-secondary-200">Edit Profile</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Avatar Preview */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-neutral-700">
                  {user?.avatar ? (
                    <Image src={user.avatar} alt={user.username} width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                      <User className="w-10 h-10 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-400 mb-1">Profile Picture</p>
                  <p className="text-xs text-neutral-600">Enter an image URL below to update your avatar</p>
                </div>
              </div>

              <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-200 mb-2">Avatar URL</label>
                  <input
                    {...register('avatar')}
                    type="text"
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-secondary-200 placeholder-neutral-600 focus:outline-none focus:border-primary-500"
                    disabled={updateMutation.isPending}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    {...register('firstName')}
                    label="First Name"
                    placeholder="Your first name"
                    disabled={updateMutation.isPending}
                  />
                  <Input
                    {...register('lastName')}
                    label="Last Name"
                    placeholder="Your last name"
                    disabled={updateMutation.isPending}
                  />
                </div>

                <Input
                  {...register('username', {
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Minimum 3 characters' },
                  })}
                  label="Username"
                  placeholder="Your username"
                  error={errors.username?.message}
                  disabled={updateMutation.isPending}
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    isLoading={updateMutation.isPending}
                    className="flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                  <Link href="/profile">
                    <Button variant="outline">Cancel</Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}