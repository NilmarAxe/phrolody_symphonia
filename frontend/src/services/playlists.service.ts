import { api } from '@/config/api';
import type { Playlist, PaginatedResponse, CreatePlaylistData } from '@/types';

class PlaylistsService {
  /**
   * Get all playlists with pagination
   */
  async getPlaylists(
    page: number = 1,
    limit: number = 20,
    isPublic?: boolean
  ): Promise<PaginatedResponse<Playlist>> {
    const params: any = { page, limit };
    if (isPublic !== undefined) {
      params.isPublic = isPublic;
    }

    const response = await api.get<PaginatedResponse<Playlist>>('/playlists', { params });
    return response.data;
  }

  /**
   * Get current user's playlists
   */
  async getMyPlaylists(): Promise<Playlist[]> {
    const response = await api.get<Playlist[]>('/playlists/me');
    return response.data;
  }

  /**
   * Get playlist by ID
   */
  async getPlaylistById(id: string): Promise<Playlist> {
    const response = await api.get<Playlist>(`/playlists/${id}`);
    return response.data;
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(data: CreatePlaylistData): Promise<Playlist> {
    const response = await api.post<Playlist>('/playlists', data);
    return response.data;
  }

  /**
   * Update playlist
   */
  async updatePlaylist(id: string, data: Partial<CreatePlaylistData>): Promise<Playlist> {
    const response = await api.patch<Playlist>(`/playlists/${id}`, data);
    return response.data;
  }

  /**
   * Delete playlist
   */
  async deletePlaylist(id: string): Promise<void> {
    await api.delete(`/playlists/${id}`);
  }

  /**
   * Add track to playlist
   */
  async addTrack(playlistId: string, trackId: string, position?: number): Promise<Playlist> {
    const response = await api.post<Playlist>(`/playlists/${playlistId}/tracks`, {
      trackId,
      position,
    });
    return response.data;
  }

  /**
   * Remove track from playlist
   */
  async removeTrack(playlistId: string, trackId: string): Promise<Playlist> {
    const response = await api.delete<Playlist>(`/playlists/${playlistId}/tracks/${trackId}`);
    return response.data;
  }

  /**
   * Reorder tracks in playlist
   */
  async reorderTracks(
    playlistId: string,
    trackOrder: { trackId: string; position: number }[]
  ): Promise<Playlist> {
    const response = await api.patch<Playlist>(`/playlists/${playlistId}/reorder`, {
      trackOrder,
    });
    return response.data;
  }
}

export const playlistsService = new PlaylistsService();