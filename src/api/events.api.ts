import apiClient from './client';
import { Event, EventCreateRequest, EventUpdateRequest } from '../types';

export const eventsApi = {
  getEvents: async (params?: { search?: string; page?: number; limit?: number }): Promise<Event[]> => {
    const response = await apiClient.get<any>('/events', { params });
    // Handle both direct array or paginated object { events: [...] }
    if (Array.isArray(response.data)) {
      return response.data;
    }
    if (response.data && Array.isArray(response.data.events)) {
      return response.data.events;
    }
    return [];
  },

  getEventById: async (id: string): Promise<Event> => {
    const response = await apiClient.get<Event>(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: EventCreateRequest): Promise<Event> => {
    const response = await apiClient.post<Event>('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: EventUpdateRequest): Promise<Event> => {
    const response = await apiClient.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  updateEventStatus: async (id: string, status: 'PUBLISHED' | 'CANCELLED'): Promise<Event> => {
    const response = await apiClient.patch<Event>(`/events/${id}/status`, { status });
    return response.data;
  },

  getOrganizerEvents: async (): Promise<Event[]> => {
    try {
      const response = await apiClient.get<Event[]>('/organizer/events');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      // Fallback in case route is mounted at /events/organizer/me
      const fallback = await apiClient.get<Event[]>('/events/organizer/me');
      return Array.isArray(fallback.data) ? fallback.data : [];
    }
  },
};

export default eventsApi;
