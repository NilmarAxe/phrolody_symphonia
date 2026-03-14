'use client';

import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { usePlayerStore } from '@/store/player.store';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';
import { Player } from '../player/Player';

interface MainLayoutProps {
  children: ReactNode;
  showPlayer?: boolean;
  showFooter?: boolean;
}

// Pages that use the sidebar layout (authenticated app)
const APP_ROUTES = [
  '/browse',
  '/playlists',
  '/favorites',
  '/library',
  '/settings',
  '/profile',
  '/tracks',
  '/upload',
  '/admin',
];

export function MainLayout({
  children,
  showPlayer = true,
  showFooter = true,
}: MainLayoutProps) {
  const { loadUser, isAuthenticated } = useAuthStore();
  const { currentTrack } = usePlayerStore();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    loadUser();
    setHydrated(true);
  }, [loadUser]);

  // Check if current route should use sidebar layout
  const useAppLayout = hydrated && isAuthenticated && APP_ROUTES.some(route => pathname.startsWith(route));

  if (useAppLayout) {
    return (
      <div className="flex h-screen bg-neutral-950 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {showPlayer && currentTrack && (
            <div className="flex-shrink-0">
              <Player />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default layout (home, login, register)
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {children}
      </main>

      {showFooter && <Footer />}

      {showPlayer && currentTrack && <Player />}
    </div>
  );
}