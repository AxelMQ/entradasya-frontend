import apiClient from './client';
import { Ticket } from '../types';

export const ticketsApi = {
  getTicketDownloadUrl: (ticketId: string): string => {
    const base = apiClient.defaults.baseURL || '/api/v1';
    return `${base}/tickets/${ticketId}/download`;
  },

  getTicketsByOrder: async (orderId: string): Promise<Ticket[]> => {
    const response = await apiClient.get<Ticket[]>(`/tickets/order/${orderId}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  downloadTicketBlob: async (ticketId: string, filename?: string): Promise<void> => {
    const response = await apiClient.get(`/tickets/${ticketId}/download`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || `ticket-${ticketId}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },
};

export default ticketsApi;
