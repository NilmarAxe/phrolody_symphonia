'use client';

import { useQuery } from '@tanstack/react-query';
import { genresService } from '@/services/genres.service';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Music2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export function GenreSection() {
  const { data: genres, isLoading } = useQuery({
    queryKey: ['genres', 'stats'],
    queryFn: () => genresService.getGenresWithStats(),
  });

  const router = useRouter();

  if (isLoading) {
    return <LoadingSpinner className="py-12" />;
  }

  if (!genres || genres.length === 0) {
    return null;
  }

  const handleGenreClick = (genreId: string) => {
    router.push(`/browse?genreId=${genreId}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-secondary-200">
            Explore by Genre
          </h2>
          <p className="text-neutral-500 mt-1">Discover classical music by style</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {genres.map((genre, index) => (
          <motion.div
            key={genre.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Card
              className="group hover:border-primary-500 transition-all duration-300 cursor-pointer hover:shadow-glow-primary"
              onClick={() => handleGenreClick(genre.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center mb-4 group-hover:shadow-glow-primary transition-shadow">
                      <Music2 className="w-6 h-6 text-white" />
                    </div>

                    {/* Genre Name */}
                    <h3 className="text-lg font-display font-semibold text-secondary-200 group-hover:text-primary-500 transition-colors mb-1">
                      {genre.name}
                    </h3>

                    {/* Description */}
                    {genre.description && (
                      <p className="text-sm text-neutral-500 line-clamp-2 mb-3">
                        {genre.description}
                      </p>
                    )}

                    {/* Track Count */}
                    <div className="flex items-center text-xs text-neutral-600">
                      <span>{genre.trackCount || 0} tracks</span>
                    </div>
                  </div>

                  {/* Arrow Icon */}
                  <ChevronRight className="w-5 h-5 text-neutral-600 group-hover:text-primary-500 transition-colors opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}