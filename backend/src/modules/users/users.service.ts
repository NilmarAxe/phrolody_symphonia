import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CacheService } from '@/common/cache/cache.service';
import { User, Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const cacheKey = this.cacheService.generateUserKey(id);
    
    // Try cache first
    const cached = await this.cacheService.get<User>(cacheKey);
    if (cached) {
      return cached;
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user) {
      // Cache for 1 hour
      await this.cacheService.set(cacheKey, user, 3600);
    }

    return user;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by username
   */
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }

  /**
   * Get all users with pagination
   */
  async findAll(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          role: true,
          isVerified: true,
          isActive: true,
          createdAt: true,
          lastLoginAt: true,
        },
      }),
      this.prisma.user.count(),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user profile
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { email, username, ...otherData } = updateUserDto;

    // Check if user exists
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check email uniqueness if changed
    if (email && email !== user.email) {
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        throw new ConflictException('Email already in use');
      }
    }

    // Check username uniqueness if changed
    if (username && username !== user.username) {
      const existingUser = await this.findByUsername(username);
      if (existingUser) {
        throw new ConflictException('Username already taken');
      }
    }

    // Update user
    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        email,
        username,
        ...otherData,
      },
    });

    // Invalidate cache
    await this.cacheService.invalidateUserCache(id);

    this.logger.log(`User updated: ${updatedUser.email}`);

    return updatedUser;
  }

  /**
   * Update user password
   */
  async updatePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!user.passwordHash) {
      throw new BadRequestException('Cannot update password for OAuth users');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { isRevoked: true },
    });

    this.logger.log(`Password updated for user: ${user.email}`);
  }

  /**
   * Deactivate user account
   */
  async deactivate(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    // Revoke all refresh tokens
    await this.prisma.refreshToken.updateMany({
      where: { userId: id },
      data: { isRevoked: true },
    });

    // Invalidate cache
    await this.cacheService.invalidateUserCache(id);

    this.logger.log(`User deactivated: ${user.email}`);
  }

  /**
   * Reactivate user account
   */
  async reactivate(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });

    // Invalidate cache
    await this.cacheService.invalidateUserCache(id);

    this.logger.log(`User reactivated: ${user.email}`);
  }

  /**
   * Delete user (soft delete by deactivation)
   */
  async remove(id: string): Promise<void> {
    await this.deactivate(id);
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string) {
    const [
      totalPlaylists,
      totalFavorites,
      totalPlayHistory,
      recentActivity,
    ] = await Promise.all([
      this.prisma.playlist.count({ where: { userId } }),
      this.prisma.favorite.count({ where: { userId } }),
      this.prisma.playHistory.count({ where: { userId } }),
      this.prisma.playHistory.findMany({
        where: { userId },
        take: 10,
        orderBy: { playedAt: 'desc' },
        include: {
          track: {
            select: {
              id: true,
              title: true,
              composer: true,
              coverArt: true,
            },
          },
        },
      }),
    ]);

    return {
      totalPlaylists,
      totalFavorites,
      totalPlayHistory,
      recentActivity,
    };
  }
}