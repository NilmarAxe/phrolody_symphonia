import { api } from '@/config/api';
import type { User, UserStats } from '@/types';

class UsersService {
  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  }

  /**
   * Get current user statistics
   */
  async getMyStats(): Promise<UserStats> {
    const response = await api.get<UserStats>('/users/me/stats');
    return response.data;
  }

  /**
   * Update current user profile
   */
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.patch<User>('/users/me', data);
    return response.data;
  }

  /**
   * Update password
   */
  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.patch('/users/me/password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Deactivate account
   */
  async deactivateAccount(): Promise<void> {
    await api.delete('/users/me');
  }

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  }

  /**
   * Get user statistics by ID
   */
  async getUserStats(id: string): Promise<UserStats> {
    const response = await api.get<UserStats>(`/users/${id}/stats`);
    return response.data;
  }
}

export const usersService = new UsersService();