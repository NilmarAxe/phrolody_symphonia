import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CacheService } from '@/common/cache/cache.service';
import { Track, Prisma } from '@prisma/client';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { SearchTracksDto } from './dto/search-tracks.dto';

@Injectable()
export class TracksService {
  private readonly logger = new Logger(TracksService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new track
   */
  async create(createTrackDto: CreateTrackDto, uploadedById: string): Promise<Track> {
    const track = await this.prisma.track.create({
      data: {
        ...createTrackDto,
        uploadedById,
      },
      include: {
        genre: true,
        period: true,
        uploadedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    this.logger.log(`Track created: ${track.title} by ${track.composer}`);

    return track;
  }

  /**
   * Find all tracks with pagination and filters
   */
  async findAll(page: number = 1, limit: number = 20, filters?: SearchTracksDto) {
    const skip = (page - 1) * limit;

    const where: Prisma.TrackWhereInput = {
      isPublic: true,
    };

    // Apply filters
    if (filters?.composer) {
      where.composer = { contains: filters.composer, mode: 'insensitive' };
    }
    if (filters?.genreId) {
      where.genreId = filters.genreId;
    }
    if (filters?.periodId) {
      where.periodId = filters.periodId;
    }
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { composer: { contains: filters.search, mode: 'insensitive' } },
        { performer: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [tracks, total] = await Promise.all([
      this.prisma.track.findMany({
        skip,
        take: limit,
        where,
        orderBy: filters?.sortBy
          ? { [filters.sortBy]: filters.sortOrder || 'desc' }
          : { createdAt: 'desc' },
        include: {
          genre: true,
          period: true,
          uploadedBy: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      this.prisma.track.count({ where }),
    ]);

    return {
      data: tracks,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find track by ID
   */
  async findById(id: string): Promise<Track | null> {
    const cacheKey = this.cacheService.generateTrackKey(id);

    // Try cache first
    const cached = await this.cacheService.get<Track>(cacheKey);
    if (cached) {
      return cached;
    }

    const track = await this.prisma.track.findUnique({
      where: { id },
      include: {
        genre: true,
        period: true,
        uploadedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (track) {
      // Cache for 1 hour
      await this.cacheService.set(cacheKey, track, 3600);
    }

    return track;
  }

  /**
   * Update track
   */
  async update(id: string, updateTrackDto: UpdateTrackDto, userId: string): Promise<Track> {
    const track = await this.findById(id);

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    // Check if user is owner or admin
    if (track.uploadedById !== userId) {
      throw new BadRequestException('You can only update your own tracks');
    }

    const updatedTrack = await this.prisma.track.update({
      where: { id },
      data: updateTrackDto,
      include: {
        genre: true,
        period: true,
        uploadedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    // Invalidate cache
    await this.cacheService.invalidateTrackCache(id);

    this.logger.log(`Track updated: ${updatedTrack.title}`);

    return updatedTrack;
  }

  /**
   * Delete track
   */
  async remove(id: string, userId: string): Promise<void> {
    const track = await this.findById(id);

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    // Check if user is owner or admin
    if (track.uploadedById !== userId) {
      throw new BadRequestException('You can only delete your own tracks');
    }

    await this.prisma.track.delete({
      where: { id },
    });

    // Invalidate cache
    await this.cacheService.invalidateTrackCache(id);

    this.logger.log(`Track deleted: ${track.title}`);
  }

  /**
   * Increment play count
   */
  async incrementPlayCount(id: string): Promise<void> {
    await this.prisma.track.update({
      where: { id },
      data: {
        playCount: {
          increment: 1,
        },
      },
    });

    // Invalidate cache
    await this.cacheService.invalidateTrackCache(id);
  }

  /**
   * Record play history
   */
  async recordPlay(trackId: string, userId: string, duration: number, completed: boolean) {
    await this.prisma.playHistory.create({
      data: {
        trackId,
        userId,
        duration,
        completed,
      },
    });

    // Increment play count if completed
    if (completed) {
      await this.incrementPlayCount(trackId);
    }
  }

  /**
   * Get popular tracks
   */
  async getPopular(limit: number = 10) {
    return this.prisma.track.findMany({
      take: limit,
      where: { isPublic: true },
      orderBy: { playCount: 'desc' },
      include: {
        genre: true,
        period: true,
        uploadedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Get recent tracks
   */
  async getRecent(limit: number = 10) {
    return this.prisma.track.findMany({
      take: limit,
      where: { isPublic: true },
      orderBy: { createdAt: 'desc' },
      include: {
        genre: true,
        period: true,
        uploadedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Get tracks by composer
   */
  async getByComposer(composer: string, limit: number = 20) {
    return this.prisma.track.findMany({
      take: limit,
      where: {
        composer: { contains: composer, mode: 'insensitive' },
        isPublic: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        genre: true,
        period: true,
        uploadedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  /**
   * Get recommended tracks for user (basic implementation)
   */
  async getRecommendations(userId: string, limit: number = 10) {
    // Get user's favorite genres and periods from play history
    const playHistory = await this.prisma.playHistory.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            genre: true,
            period: true,
          },
        },
      },
      take: 50,
      orderBy: { playedAt: 'desc' },
    });

    // Extract favorite genres and periods
    const genreIds = playHistory
      .map((ph) => ph.track.genreId)
      .filter((id): id is string => id !== null);
    const periodIds = playHistory
      .map((ph) => ph.track.periodId)
      .filter((id): id is string => id !== null);

    // Get tracks from favorite genres/periods
    return this.prisma.track.findMany({
      take: limit,
      where: {
        isPublic: true,
        OR: [
          { genreId: { in: genreIds } },
          { periodId: { in: periodIds } },
        ],
      },
      orderBy: { playCount: 'desc' },
      include: {
        genre: true,
        period: true,
        uploadedBy: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}