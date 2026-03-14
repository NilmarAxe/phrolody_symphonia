import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CacheService } from '@/common/cache/cache.service';
import { Playlist } from '@prisma/client';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddTrackDto } from './dto/add-track.dto';

@Injectable()
export class PlaylistsService {
  private readonly logger = new Logger(PlaylistsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Create a new playlist
   */
  async create(createPlaylistDto: CreatePlaylistDto, userId: string): Promise<Playlist> {
    const playlist = await this.prisma.playlist.create({
      data: {
        ...createPlaylistDto,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        tracks: {
          include: {
            track: {
              include: {
                genre: true,
                period: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    this.logger.log(`Playlist created: ${playlist.name} by user ${userId}`);

    return playlist;
  }

  /**
   * Find all playlists with pagination
   */
  async findAll(page: number = 1, limit: number = 20, isPublic?: boolean) {
    const skip = (page - 1) * limit;

    const where = isPublic !== undefined ? { isPublic } : {};

    const [playlists, total] = await Promise.all([
      this.prisma.playlist.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          tracks: {
            include: {
              track: {
                include: {
                  genre: true,
                  period: true,
                },
              },
            },
            orderBy: { position: 'asc' },
          },
        },
      }),
      this.prisma.playlist.count({ where }),
    ]);

    return {
      data: playlists,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find playlist by ID
   */
  async findById(id: string): Promise<Playlist | null> {
    const cacheKey = this.cacheService.generatePlaylistKey(id);

    // Try cache first
    const cached = await this.cacheService.get<Playlist>(cacheKey);
    if (cached) {
      return cached;
    }

    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        tracks: {
          include: {
            track: {
              include: {
                genre: true,
                period: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (playlist) {
      // Cache for 30 minutes
      await this.cacheService.set(cacheKey, playlist, 1800);
    }

    return playlist;
  }

  /**
   * Find user's playlists
   */
  async findByUser(userId: string) {
    return this.prisma.playlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        tracks: {
          include: {
            track: {
              include: {
                genre: true,
                period: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
  }

  /**
   * Update playlist
   */
  async update(
    id: string,
    updatePlaylistDto: UpdatePlaylistDto,
    userId: string,
  ): Promise<Playlist> {
    const playlist = await this.findById(id);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check if user is owner
    if (playlist.userId !== userId) {
      throw new ForbiddenException('You can only update your own playlists');
    }

    const updatedPlaylist = await this.prisma.playlist.update({
      where: { id },
      data: updatePlaylistDto,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        tracks: {
          include: {
            track: {
              include: {
                genre: true,
                period: true,
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    // Invalidate cache
    await this.cacheService.invalidatePlaylistCache(id);

    this.logger.log(`Playlist updated: ${updatedPlaylist.name}`);

    return updatedPlaylist;
  }

  /**
   * Delete playlist
   */
  async remove(id: string, userId: string): Promise<void> {
    const playlist = await this.findById(id);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check if user is owner
    if (playlist.userId !== userId) {
      throw new ForbiddenException('You can only delete your own playlists');
    }

    await this.prisma.playlist.delete({
      where: { id },
    });

    // Invalidate cache
    await this.cacheService.invalidatePlaylistCache(id);

    this.logger.log(`Playlist deleted: ${playlist.name}`);
  }

  /**
   * Add track to playlist
   */
  async addTrack(playlistId: string, addTrackDto: AddTrackDto, userId: string) {
    const playlist = await this.findById(playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check if user is owner or playlist is collaborative
    if (playlist.userId !== userId && !playlist.isCollaborative) {
      throw new ForbiddenException('You cannot add tracks to this playlist');
    }

    // Check if track exists
    const track = await this.prisma.track.findUnique({
      where: { id: addTrackDto.trackId },
    });

    if (!track) {
      throw new NotFoundException('Track not found');
    }

    // Check if track is already in playlist
    const existing = await this.prisma.playlistTrack.findUnique({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId: addTrackDto.trackId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException('Track is already in this playlist');
    }

    // Get current max position
    const maxPosition = await this.prisma.playlistTrack.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
      select: { position: true },
    });

    const position = addTrackDto.position ?? (maxPosition?.position ?? -1) + 1;

    // Add track to playlist
    await this.prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId: addTrackDto.trackId,
        position,
      },
    });

    // Invalidate cache
    await this.cacheService.invalidatePlaylistCache(playlistId);

    this.logger.log(`Track ${addTrackDto.trackId} added to playlist ${playlistId}`);

    // Return updated playlist
    return this.findById(playlistId);
  }

  /**
   * Remove track from playlist
   */
  async removeTrack(playlistId: string, trackId: string, userId: string) {
    const playlist = await this.findById(playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check if user is owner or playlist is collaborative
    if (playlist.userId !== userId && !playlist.isCollaborative) {
      throw new ForbiddenException('You cannot remove tracks from this playlist');
    }

    // Remove track from playlist
    await this.prisma.playlistTrack.delete({
      where: {
        playlistId_trackId: {
          playlistId,
          trackId,
        },
      },
    });

    // Invalidate cache
    await this.cacheService.invalidatePlaylistCache(playlistId);

    this.logger.log(`Track ${trackId} removed from playlist ${playlistId}`);

    // Return updated playlist
    return this.findById(playlistId);
  }

  /**
   * Reorder tracks in playlist
   */
  async reorderTracks(
    playlistId: string,
    trackOrder: { trackId: string; position: number }[],
    userId: string,
  ) {
    const playlist = await this.findById(playlistId);

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    // Check if user is owner or playlist is collaborative
    if (playlist.userId !== userId && !playlist.isCollaborative) {
      throw new ForbiddenException('You cannot reorder tracks in this playlist');
    }

    // Update positions in transaction
    await this.prisma.$transaction(
      trackOrder.map((item) =>
        this.prisma.playlistTrack.update({
          where: {
            playlistId_trackId: {
              playlistId,
              trackId: item.trackId,
            },
          },
          data: { position: item.position },
        }),
      ),
    );

    // Invalidate cache
    await this.cacheService.invalidatePlaylistCache(playlistId);

    this.logger.log(`Tracks reordered in playlist ${playlistId}`);

    // Return updated playlist
    return this.findById(playlistId);
  }
}