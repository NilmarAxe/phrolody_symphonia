import { api } from '@/config/api';
import type { Track } from '@/types';

interface FavoritesResponse {
  data: Track[];
  total: number;
}

interface FavoriteStatus {
  isFavorite: boolean;
  trackId: string;
}

class FavoritesService {
  /**
   * Get all favorites for current user
   */
  async getFavorites(): Promise<FavoritesResponse> {
    const response = await api.get<FavoritesResponse>('/favorites');
    return response.data;
  }

  /**
   * Add track to favorites
   */
  async addFavorite(trackId: string): Promise<{ message: string; trackId: string }> {
    const response = await api.post(`/favorites/${trackId}`);
    return response.data;
  }

  /**
   * Remove track from favorites
   */
  async removeFavorite(trackId: string): Promise<{ message: string; trackId: string }> {
    const response = await api.delete(`/favorites/${trackId}`);
    return response.data;
  }

  /**
   * Check if track is favorited
   */
  async isFavorite(trackId: string): Promise<boolean> {
    const response = await api.get<FavoriteStatus>(`/favorites/${trackId}/status`);
    return response.data.isFavorite;
  }

  /**
   * Toggle favorite status
   */
  async toggleFavorite(trackId: string, currentStatus: boolean): Promise<boolean> {
    if (currentStatus) {
      await this.removeFavorite(trackId);
      return false;
    } else {
      await this.addFavorite(trackId);
      return true;
    }
  }
}

export const favoritesService = new FavoritesService();