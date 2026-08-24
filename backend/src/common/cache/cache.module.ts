import { Module, Global, Logger } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService } from './cache.service';

@Global()
@Module({
  imports: [
    NestCacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('CacheModule');
        const redisHost = configService.get<string>('REDIS_HOST');
        const cacheTtl = configService.get<number>('CACHE_TTL', 3600);

        if (redisHost) {
          try {
            const { redisStore } = await import('cache-manager-redis-yet');
            const redisPort = configService.get<number>('REDIS_PORT', 6379);
            const redisPassword = configService.get<string>('REDIS_PASSWORD');

            logger.log('Using Redis cache');
            return {
              store: await redisStore({
                socket: {
                  host: redisHost,
                  port: redisPort,
                  tls: true,
                },
                password: redisPassword || undefined,
                ttl: cacheTtl * 1000,
              }),
              ttl: cacheTtl * 1000,
            };
          } catch (error) {
            logger.warn('Redis connection failed, falling back to memory cache');
          }
        }

        logger.log('Using in-memory cache');
        return {
          ttl: cacheTtl * 1000,
        };
      },
      inject: [ConfigService],
    }),
  ],
  providers: [CacheService],
  exports: [CacheService, NestCacheModule],
})
export class CacheModule {}
