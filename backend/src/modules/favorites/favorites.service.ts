import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        track: {
          include: {
            genre: true,
            period: true,
            uploadedBy: {
              select: { id: true, username: true, firstName: true, lastName: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: favorites.map((f) => f.track),
      total: favorites.length,
    };
  }

  async addFavorite(userId: string, trackId: string) {
    // Check track exists
    const track = await this.prisma.track.findUnique({ where: { id: trackId } });
    if (!track) {
      throw new NotFoundException('Track not found');
    }

    // Check if already favorited
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    if (existing) {
      throw new ConflictException('Track already in favorites');
    }

    await this.prisma.favorite.create({
      data: { userId, trackId },
    });

    this.logger.log(`User ${userId} favorited track ${trackId}`);
    return { message: 'Track added to favorites', trackId };
  }

  async removeFavorite(userId: string, trackId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    if (!existing) {
      throw new NotFoundException('Favorite not found');
    }

    await this.prisma.favorite.delete({
      where: { userId_trackId: { userId, trackId } },
    });

    this.logger.log(`User ${userId} removed track ${trackId} from favorites`);
    return { message: 'Track removed from favorites', trackId };
  }

  async isFavorite(userId: string, trackId: string): Promise<boolean> {
    const favorite = await this.prisma.favorite.findUnique({
      where: { userId_trackId: { userId, trackId } },
    });
    return !!favorite;
  }

  async getFavoritesCount(userId: string): Promise<number> {
    return this.prisma.favorite.count({ where: { userId } });
  }
}