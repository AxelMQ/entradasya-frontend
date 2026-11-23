import apiClient from './client';
import {
  CheckinEventStats,
  CheckinHistoryItem,
  CheckinScanRequest,
  CheckinScanResult,
} from '../types';

export const checkinApi = {
  scanTicket: async (data: CheckinScanRequest): Promise<CheckinScanResult> => {
    try {
      const response = await apiClient.post<CheckinScanResult>('/checkin/scan', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data as CheckinScanResult;
      }
      return {
        result: 'REJECTED',
        reason: 'NETWORK_ERROR',
        message: 'Error de conexión con el servicio de validación de puertas.',
      };
    }
  },

  getEventStats: async (eventId: string): Promise<CheckinEventStats> => {
    const response = await apiClient.get<CheckinEventStats>(`/checkin/events/${eventId}/stats`);
    return response.data;
  },

  getEventHistory: async (eventId: string): Promise<CheckinHistoryItem[]> => {
    const response = await apiClient.get<CheckinHistoryItem[]>(`/checkin/events/${eventId}/history`);
    return Array.isArray(response.data) ? response.data : [];
  },
};

export default checkinApi;
