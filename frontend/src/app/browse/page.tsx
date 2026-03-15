'use client';

import Link from 'next/link';
import { useState, useEffect, Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { tracksService } from '@/services/tracks.service';
import { genresService } from '@/services/genres.service';
import { periodsService } from '@/services/periods.service';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Play, Music, Filter, } from 'lucide-react';
import { usePlayerStore } from '@/store/player.store';
import { motion } from 'framer-motion';
import Image from 'next/image';
import type { SearchFilters } from '@/types';

function BrowsePageInner() {
  const searchParams = useSearchParams();
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<SearchFilters>({
    search: searchParams.get('search') || '',
    genreId: searchParams.get('genreId') || '',
    periodId: searchParams.get('periodId') || '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const [showFilters, setShowFilters] = useState(false);

  const { playTrack, setQueue } = usePlayerStore();

  // Fetch tracks
  const { data: tracksData, isLoading } = useQuery({
    queryKey: ['tracks', page, filters],
    queryFn: () => tracksService.getTracks(page, 20, filters),
  });

  // Fetch genres
  const { data: genres } = useQuery({
    queryKey: ['genres'],
    queryFn: () => genresService.getGenres(),
  });

  // Fetch periods
  const { data: periods } = useQuery({
    queryKey: ['periods'],
    queryFn: () => periodsService.getPeriods(),
  });

  // Update filters from URL params
  useEffect(() => {
    const search = searchParams.get('search') || '';
    const genreId = searchParams.get('genreId') || '';
    const periodId = searchParams.get('periodId') || '';

    setFilters((prev) => ({
      ...prev,
      search,
      genreId,
      periodId,
    }));
  }, [searchParams]);

  const handlePlayTrack = (index: number) => {
    if (tracksData?.data) {
      setQueue(tracksData.data);
      playTrack(tracksData.data[index]);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      genreId: '',
      periodId: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    setPage(1);
  };

  const hasActiveFilters = filters.search || filters.genreId || filters.periodId;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-neutral-950 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-display font-bold text-secondary-200 mb-2">
            Browse Music
          </h1>
          <p className="text-neutral-500">
            Explore our collection of classical masterpieces
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}
          >
            <div className="sticky top-24">
              <Card>
                <CardContent className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-display font-semibold text-secondary-200">
                      Filters
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-xs text-primary-500 hover:text-primary-400"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-200 mb-2">
                      Search
                    </label>
                    <input
                      type="text"
                      placeholder="Composer, title..."
                      value={filters.search || ''}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Genre */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-200 mb-2">
                      Genre
                    </label>
                    <select
                      value={filters.genreId || ''}
                      onChange={(e) => handleFilterChange('genreId', e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Genres</option>
                      {genres?.map((genre) => (
                        <option key={genre.id} value={genre.id}>
                          {genre.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Period */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-200 mb-2">
                      Period
                    </label>
                    <select
                      value={filters.periodId || ''}
                      onChange={(e) => handleFilterChange('periodId', e.target.value)}
                      className="input-field"
                    >
                      <option value="">All Periods</option>
                      {periods?.map((period) => (
                        <option key={period.id} value={period.id}>
                          {period.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sort By */}
                  <div>
                    <label className="block text-sm font-medium text-secondary-200 mb-2">
                      Sort By
                    </label>
                    <select
                      value={filters.sortBy || 'createdAt'}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                      className="input-field"
                    >
                      <option value="createdAt">Recently Added</option>
                      <option value="playCount">Most Popular</option>
                      <option value="title">Title (A-Z)</option>
                      <option value="composer">Composer (A-Z)</option>
                      <option value="year">Year</option>
                      <option value="duration">Duration</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Mobile Filter Toggle */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>

            {/* Results */}
            {isLoading ? (
              <LoadingSpinner className="py-12" />
            ) : tracksData && tracksData.data.length > 0 ? (
              <>
                {/* Results Count */}
                <div className="mb-6 text-sm text-neutral-500">
                  Showing {tracksData.data.length} of {tracksData.meta.total} tracks
                </div>

                {/* Tracks Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {tracksData.data.map((track, index) => (
                    <motion.div
                      key={track.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                    >
                     <Link href={`/tracks/${track.id}`}>
                      <Card className="group hover:border-primary-500 transition-all duration-300 cursor-pointer">
                        <CardContent className="p-0">
                          {/* Cover Art */}
                          <div className="relative aspect-square overflow-hidden rounded-t-xl">
                            {track.coverArt ? (
                              <Image
                                src={track.coverArt}
                                alt={track.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
                                <Music className="w-16 h-16 text-white/50" />
                              </div>
                            )}

                            {/* Play Button Overlay */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <button
                                onClick={(e) => {e.preventDefault(); handlePlayTrack(index); }}
                                className="player-control-primary"
                                aria-label={`Play ${track.title}`}
                              >
                                <Play className="w-6 h-6 fill-white" />
                              </button>
                            </div>
                          </div>

                          {/* Track Info */}
                          <div className="p-4">
                            <h3 className="font-semibold text-secondary-200 line-clamp-1 group-hover:text-primary-500 transition-colors">
                              {track.title}
                            </h3>
                            <p className="text-sm text-neutral-500 mt-1 line-clamp-1">
                              {track.composer}
                            </p>
                            <div className="flex items-center justify-between mt-3 text-xs text-neutral-600">
                              <span>
                                {Math.floor(track.duration / 60)}:
                                {(track.duration % 60).toString().padStart(2, '0')}
                              </span>
                              {track.genre && <span>{track.genre.name}</span>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Pagination */}
                {tracksData.meta.totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-neutral-500">
                      Page {page} of {tracksData.meta.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(tracksData.meta.totalPages, p + 1))}
                      disabled={page === tracksData.meta.totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                <h3 className="text-xl font-display font-semibold text-secondary-200 mb-2">
                  No tracks found
                </h3>
                <p className="text-neutral-500">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <BrowsePageInner />
    </Suspense>
  );
}