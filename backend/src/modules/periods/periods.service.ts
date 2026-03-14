import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CacheService } from '@/common/cache/cache.service';
import { Period } from '@prisma/client';

@Injectable()
export class PeriodsService {
  private readonly logger = new Logger(PeriodsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: CacheService,
  ) {}

  /**
   * Find all periods
   */
  async findAll(): Promise<Period[]> {
    const cacheKey = 'periods:all';

    // Try cache first
    const cached = await this.cacheService.get<Period[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const periods = await this.prisma.period.findMany({
      orderBy: { startYear: 'asc' },
    });

    // Cache for 24 hours (periods rarely change)
    await this.cacheService.set(cacheKey, periods, 86400);

    return periods;
  }

  /**
   * Find period by ID
   */
  async findById(id: string): Promise<Period | null> {
    return this.prisma.period.findUnique({
      where: { id },
    });
  }

  /**
   * Find period by name
   */
  async findByName(name: string): Promise<Period | null> {
    return this.prisma.period.findUnique({
      where: { name },
    });
  }

  /**
   * Get period with track count
   */
  async getPeriodWithStats(id: string) {
    const [period, trackCount] = await Promise.all([
      this.findById(id),
      this.prisma.track.count({
        where: { periodId: id },
      }),
    ]);

    if (!period) {
      return null;
    }

    return {
      ...period,
      trackCount,
    };
  }

  /**
   * Get all periods with track counts
   */
  async getAllWithStats() {
    const periods = await this.findAll();

    const periodsWithStats = await Promise.all(
      periods.map(async (period) => {
        const trackCount = await this.prisma.track.count({
          where: { periodId: period.id },
        });

        return {
          ...period,
          trackCount,
        };
      }),
    );

    return periodsWithStats;
  }
}