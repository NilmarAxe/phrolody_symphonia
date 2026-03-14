import { api } from '@/config/api';
import type { Genre } from '@/types';

class GenresService {
  /**
   * Get all genres
   */
  async getGenres(): Promise<Genre[]> {
    const response = await api.get<Genre[]>('/genres');
    return response.data;
  }

  /**
   * Get all genres with statistics
   */
  async getGenresWithStats(): Promise<Genre[]> {
    const response = await api.get<Genre[]>('/genres/stats');
    return response.data;
  }

  /**
   * Get genre by ID
   */
  async getGenreById(id: string): Promise<Genre> {
    const response = await api.get<Genre>(`/genres/${id}`);
    return response.data;
  }

  /**
   * Get genre with statistics
   */
  async getGenreStats(id: string): Promise<Genre> {
    const response = await api.get<Genre>(`/genres/${id}/stats`);
    return response.data;
  }
}

export const genresService = new GenresService();