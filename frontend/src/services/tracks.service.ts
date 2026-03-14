import { api } from '@/config/api';
import type { Track, PaginatedResponse, SearchFilters } from '@/types';

class TracksService {
  /**
   * Get all tracks with pagination and filters
   */
  async getTracks(
    page: number = 1,
    limit: number = 20,
    filters?: SearchFilters
  ): Promise<PaginatedResponse<Track>> {
    const params: Record<string, any> = { page, limit };

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params[key] = value;
        }
      });
    }

    const response = await api.get<PaginatedResponse<Track>>('/tracks', { params });
    return response.data;
  }

  /**
   * Get track by ID
   */
  async getTrackById(id: string): Promise<Track> {
    const response = await api.get<Track>(`/tracks/${id}`);
    return response.data;
  }

  /**
   * Get popular tracks
   */
  async getPopularTracks(limit: number = 10): Promise<Track[]> {
    const response = await api.get<Track[]>('/tracks/popular', {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get recent tracks
   */
  async getRecentTracks(limit: number = 10): Promise<Track[]> {
    const response = await api.get<Track[]>('/tracks/recent', {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get recommended tracks
   */
  async getRecommendations(limit: number = 10): Promise<Track[]> {
    const response = await api.get<Track[]>('/tracks/recommendations', {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Get tracks by composer
   */
  async getTracksByComposer(composer: string, limit: number = 20): Promise<Track[]> {
    const response = await api.get<Track[]>(`/tracks/composer/${composer}`, {
      params: { limit },
    });
    return response.data;
  }

  /**
   * Create a new track
   */
  async createTrack(data: Partial<Track>): Promise<Track> {
    const response = await api.post<Track>('/tracks', data);
    return response.data;
  }

  /**
   * Update track
   */
  async updateTrack(id: string, data: Partial<Track>): Promise<Track> {
    const response = await api.patch<Track>(`/tracks/${id}`, data);
    return response.data;
  }

  /**
   * Delete track
   */
  async deleteTrack(id: string): Promise<void> {
    await api.delete(`/tracks/${id}`);
  }

  /**
   * Record track play
   */
  async recordPlay(trackId: string, duration: number, completed: boolean): Promise<void> {
    await api.post(`/tracks/${trackId}/play`, { duration, completed });
  }

  /**
   * Search tracks
   */
  async searchTracks(query: string, filters?: Omit<SearchFilters, 'search'>): Promise<Track[]> {
    const params: Record<string, any> = { search: query };

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          params[key] = value;
        }
      });
    }

    const response = await api.get<PaginatedResponse<Track>>('/tracks', { params });
    return response.data.data;
  }
}

export const tracksService = new TracksService();