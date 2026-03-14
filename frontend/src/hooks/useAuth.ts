import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

interface UseAuthOptions {
  redirectTo?: string;
  redirectIfFound?: boolean;
}

export function useAuth(options: UseAuthOptions = {}) {
  const { redirectTo = '/auth/login', redirectIfFound = false } = options;
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isLoading) return;

    if (!redirectIfFound && !isAuthenticated) {
      router.push(redirectTo);
    }

    if (redirectIfFound && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, hydrated, redirectTo, redirectIfFound, router]);

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || !hydrated,
  };
}

export function useRequireAuth() {
  return useAuth({ redirectTo: '/auth/login', redirectIfFound: false });
}

export function useRedirectIfAuthenticated(redirectTo: string = '/browse') {
  return useAuth({ redirectTo, redirectIfFound: true });
}