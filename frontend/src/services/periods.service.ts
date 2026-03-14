import { api } from '@/config/api';
import type { Period } from '@/types';

class PeriodsService {
  /**
   * Get all periods
   */
  async getPeriods(): Promise<Period[]> {
    const response = await api.get<Period[]>('/periods');
    return response.data;
  }

  /**
   * Get all periods with statistics
   */
  async getPeriodsWithStats(): Promise<Period[]> {
    const response = await api.get<Period[]>('/periods/stats');
    return response.data;
  }

  /**
   * Get period by ID
   */
  async getPeriodById(id: string): Promise<Period> {
    const response = await api.get<Period>(`/periods/${id}`);
    return response.data;
  }

  /**
   * Get period with statistics
   */
  async getPeriodStats(id: string): Promise<Period> {
    const response = await api.get<Period>(`/periods/${id}/stats`);
    return response.data;
  }
}

export const periodsService = new PeriodsService();