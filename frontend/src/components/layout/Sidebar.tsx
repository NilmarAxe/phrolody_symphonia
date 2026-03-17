'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Music,
  Search,
  Heart,
  Library,
  ListMusic,
  Settings,
  User,
  LogOut,
  Upload,
  Shield,
  ChevronLeft,
  ChevronRight,
  Home,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { cn } from '@/utils/cn';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { OnlineUsers } from '@/components/websocket/OnlineUsers';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Browse', href: '/browse', icon: Search },
    { name: 'My Library', href: '/library', icon: Library },
    { name: 'Favorites', href: '/favorites', icon: Heart },
    { name: 'Playlists', href: '/playlists', icon: ListMusic },
  ];

  const secondaryItems = [
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    ...(isAdmin ? [
      { name: 'Upload', href: '/upload', icon: Upload },
      { name: 'Admin', href: '/admin', icon: Shield },
    ] : []),
  ];

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-neutral-900 border-r border-neutral-800 transition-all duration-300 flex-shrink-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-neutral-800">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center group-hover:shadow-glow-primary transition-shadow flex-shrink-0">
              <Music className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-display font-bold text-secondary-200 truncate">
              Phrolody
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center mx-auto">
            <Music className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1 rounded-lg text-neutral-500 hover:text-secondary-200 hover:bg-neutral-800 transition-colors',
            collapsed && 'mx-auto mt-2'
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-primary-500/10 text-primary-500'
                  : 'text-neutral-400 hover:text-secondary-200 hover:bg-neutral-800'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="my-3 border-t border-neutral-800" />

        {secondaryItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                collapsed ? 'justify-center' : '',
                isActive
                  ? 'bg-primary-500/10 text-primary-500'
                  : 'text-neutral-400 hover:text-secondary-200 hover:bg-neutral-800'
              )}
              title={collapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Online Users */}
      {!collapsed && <OnlineUsers />}

      {/* User Section */}
      <div className="border-t border-neutral-800 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-500/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.username} width={36} height={36} className="object-cover" />
              ) : (
                <User className="w-4 h-4 text-primary-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-secondary-200 truncate">{user?.username}</p>
              <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogout}
            className="w-full flex justify-center p-2 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  );
}