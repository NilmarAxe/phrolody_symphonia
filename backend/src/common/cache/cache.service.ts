import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value) {
        this.logger.debug(`Cache hit for key: ${key}`);
      } else {
        this.logger.debug(`Cache miss for key: ${key}`);
      }
      return value;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return undefined;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set for key: ${key} (TTL: ${ttl || 'default'})`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const stores = (this.cacheManager as any).stores;
      if (Array.isArray(stores)) {
        for (const store of stores) {
          if (store && typeof store.keys === 'function') {
            const keys = await store.keys(pattern);
            await Promise.all(keys.map((key: string) => this.cacheManager.del(key)));
            this.logger.debug(`Cache deleted for pattern: ${pattern} (${keys.length} keys)`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error deleting cache pattern ${pattern}:`, error);
    }
  }

  async reset(): Promise<void> {
    try {
      const stores = (this.cacheManager as any).stores;
      if (Array.isArray(stores)) {
        for (const store of stores) {
          if (store && typeof store.clear === 'function') {
            await store.clear();
          }
        }
      }
      this.logger.log('Cache reset successfully');
    } catch (error) {
      this.logger.error('Error resetting cache:', error);
    }
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttl?: number): Promise<T> {
    try {
      return await this.cacheManager.wrap(key, fn, ttl);
    } catch (error) {
      this.logger.error(`Error in cache wrap for key ${key}:`, error);
      return await fn();
    }
  }

  generateTrackKey(trackId: string): string {
    return `track:${trackId}`;
  }

  generatePlaylistKey(playlistId: string): string {
    return `playlist:${playlistId}`;
  }

  generateUserKey(userId: string): string {
    return `user:${userId}`;
  }

  generateSearchKey(query: string, filters?: Record<string, any>): string {
    const filterStr = filters ? JSON.stringify(filters) : '';
    return `search:${query}:${filterStr}`;
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.delPattern(`user:${userId}*`);
    await this.delPattern(`playlist:*:user:${userId}`);
  }

  async invalidateTrackCache(trackId: string): Promise<void> {
    await this.del(this.generateTrackKey(trackId));
    await this.delPattern(`playlist:*:track:${trackId}`);
  }

  async invalidatePlaylistCache(playlistId: string): Promise<void> {
    await this.del(this.generatePlaylistKey(playlistId));
  }
}