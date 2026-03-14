import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CacheService } from '@/common/cache/cache.service';
import { Genre } from '@prisma/client';

@Injectable()
export class GenresService {
  private readonly logger = new Logger(GenresService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Find all genres
   */
  async findAll(): Promise<Genre[]> {
    const cacheKey = 'genres:all';

    // Try cache first
    const cached = await this.cacheService.get<Genre[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const genres = await this.prisma.genre.findMany({
      orderBy: { name: 'asc' },
    });

    // Cache for 24 hours (genres rarely change)
    await this.cacheService.set(cacheKey, genres, 86400);

    return genres;
  }

  /**
   * Find genre by ID
   */
  async findById(id: string): Promise<Genre | null> {
    return this.prisma.genre.findUnique({
      where: { id },
    });
  }

  /**
   * Find genre by name
   */
  async findByName(name: string): Promise<Genre | null> {
    return this.prisma.genre.findUnique({
      where: { name },
    });
  }

  /**
   * Get genre with track count
   */
  async getGenreWithStats(id: string) {
    const [genre, trackCount] = await Promise.all([
      this.findById(id),
      this.prisma.track.count({
        where: { genreId: id },
      }),
    ]);

    if (!genre) {
      return null;
    }

    return {
      ...genre,
      trackCount,
    };
  }

  /**
   * Get all genres with track counts
   */
  async getAllWithStats() {
    const genres = await this.findAll();

    const genresWithStats = await Promise.all(
      genres.map(async (genre) => {
        const trackCount = await this.prisma.track.count({
          where: { genreId: genre.id },
        });

        return {
          ...genre,
          trackCount,
        };
      }),
    );

    return genresWithStats;
  }
}