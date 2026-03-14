'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { usersService } from '@/services/users.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Settings, User, Lock, Bell, Trash2, Save } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'notifications'>('profile');

  useEffect(() => { setHydrated(true); }, []);
  useEffect(() => {
    if (hydrated && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, hydrated, router]);

  const { register: registerProfile, handleSubmit: handleProfileSubmit } = useForm({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      bio: '',
    },
  });

  const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors }, reset: resetPassword } = useForm<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }>();

  const profileMutation = useMutation({
    mutationFn: (data: any) => usersService.updateProfile(data),
    onSuccess: () => toast.success('Profile updated successfully!'),
    onError: () => toast.error('Failed to update profile'),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: any) => usersService.updatePassword(data.currentPassword, data.newPassword),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      resetPassword();
    },
    onError: () => toast.error('Failed to change password'),
  });

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your data. Are you absolutely sure?')) {
        try {
          await usersService.deactivateAccount();
          await logout();
          router.push('/');
          toast.success('Account deleted');
        } catch {
          toast.error('Failed to delete account');
        }
      }
    }
  };

  if (!hydrated || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>;
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-950">
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-display font-bold text-secondary-200 mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary-500" />
            Settings
          </h1>
          <p className="text-neutral-500">Manage your account preferences</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-56 flex-shrink-0">
            <nav className="space-y-1">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    activeSection === id
                      ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20'
                      : 'text-neutral-400 hover:text-secondary-200 hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex-1 max-w-2xl space-y-6">
            {activeSection === 'profile' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-primary-500" />
                      Profile Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit((data) => profileMutation.mutate(data))} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input {...registerProfile('firstName')} label="First Name" placeholder="Your first name" disabled={profileMutation.isPending} />
                        <Input {...registerProfile('lastName')} label="Last Name" placeholder="Your last name" disabled={profileMutation.isPending} />
                      </div>
                      <Input {...registerProfile('username')} label="Username" placeholder="Your username" disabled={profileMutation.isPending} />
                      <div>
                        <label className="block text-sm font-medium text-secondary-200 mb-2">Bio (Optional)</label>
                        <textarea {...registerProfile('bio')} placeholder="Tell us about yourself..." rows={3} className="input-field resize-none" disabled={profileMutation.isPending} />
                      </div>
                      <Button type="submit" isLoading={profileMutation.isPending}>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-error-500/20">
                  <CardHeader>
                    <CardTitle className="text-error-500 flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-400 text-sm mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button variant="outline" onClick={handleDeleteAccount} className="border-error-500/50 text-error-500 hover:bg-error-500/10">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'security' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-primary-500" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordSubmit((data) => passwordMutation.mutate(data))} className="space-y-4">
                      <Input {...registerPassword('currentPassword', { required: 'Current password is required' })} label="Current Password" type="password" placeholder="Enter current password" error={passwordErrors.currentPassword?.message} disabled={passwordMutation.isPending} />
                      <Input {...registerPassword('newPassword', { required: 'New password is required', minLength: { value: 8, message: 'Min 8 characters' } })} label="New Password" type="password" placeholder="Enter new password" error={passwordErrors.newPassword?.message} disabled={passwordMutation.isPending} />
                      <Input {...registerPassword('confirmPassword', { required: 'Please confirm your password' })} label="Confirm New Password" type="password" placeholder="Confirm new password" error={passwordErrors.confirmPassword?.message} disabled={passwordMutation.isPending} />
                      <Button type="submit" isLoading={passwordMutation.isPending}>
                        <Lock className="w-4 h-4 mr-2" />
                        Update Password
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeSection === 'notifications' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary-500" />
                      Notification Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[
                      { label: 'New tracks added', description: 'Get notified when new classical pieces are added' },
                      { label: 'Playlist updates', description: 'Get notified when collaborative playlists are updated' },
                      { label: 'Weekly digest', description: 'Receive a weekly summary of new additions' },
                    ].map(({ label, description }) => (
                      <label key={label} className="flex items-center justify-between p-4 rounded-lg bg-neutral-900 cursor-pointer hover:bg-neutral-800 transition-colors">
                        <div>
                          <div className="font-medium text-secondary-200">{label}</div>
                          <div className="text-sm text-neutral-500">{description}</div>
                        </div>
                        <input type="checkbox" className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-primary-500" />
                      </label>
                    ))}
                    <Button>
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}