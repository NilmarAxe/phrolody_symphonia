import { Suspense } from 'react';
import { Hero } from '@/components/features/home/Hero';
import { PopularTracks } from '@/components/features/home/PopularTracks';
import { RecentTracks } from '@/components/features/home/RecentTracks';
import { RecommendedTracks } from '@/components/features/home/RecommendedTracks';
import { GenreSection } from '@/components/features/home/GenreSection';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Hero />

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Recommended Tracks (only for logged in users) */}
        <section>
          <Suspense fallback={<LoadingSpinner />}>
            <RecommendedTracks />
          </Suspense>
        </section>

        {/* Popular Tracks */}
        <section>
          <Suspense fallback={<LoadingSpinner />}>
            <PopularTracks />
          </Suspense>
        </section>

        {/* Recent Tracks */}
        <section>
          <Suspense fallback={<LoadingSpinner />}>
            <RecentTracks />
          </Suspense>
        </section>

        {/* Genres */}
        <section>
          <Suspense fallback={<LoadingSpinner />}>
            <GenreSection />
          </Suspense>
        </section>
      </div>
    </main>
  );
}