import apiClient from './client';
import { CreateOrderRequest, EventSalesReport, OrderDetail, OrderResponse } from '../types';

export const ordersApi = {
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await apiClient.post<OrderResponse>('/orders', data);
    return response.data;
  },

  getMyOrders: async (): Promise<OrderDetail[]> => {
    const response = await apiClient.get<OrderDetail[]>('/orders/my-orders');
    return Array.isArray(response.data) ? response.data : [];
  },

  getOrderById: async (id: string): Promise<OrderDetail> => {
    const response = await apiClient.get<OrderDetail>(`/orders/${id}`);
    return response.data;
  },

  getSalesByEvent: async (eventId: string): Promise<EventSalesReport> => {
    const response = await apiClient.get<EventSalesReport>(`/orders/by-event/${eventId}`);
    return response.data;
  },
};

export default ordersApi;
