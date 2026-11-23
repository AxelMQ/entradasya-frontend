export type UserRole = 'cliente' | 'organizador' | 'portero';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface Sector {
  id: string;
  event_id?: string;
  name: string;
  capacity: number;
  available_spots: number;
  price: number;
}

export interface SectorCreate {
  name: string;
  capacity: number;
  price: number;
}

export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED';

export interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  event_date: string;
  image_url: string;
  status: EventStatus;
  organizer_id?: string;
  sectors: Sector[];
  min_price?: number;
  total_capacity?: number;
  total_available?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventCreateRequest {
  title: string;
  description: string;
  venue: string;
  event_date: string;
  image_url: string;
  sectors: SectorCreate[];
}

export interface EventUpdateRequest {
  title?: string;
  description?: string;
  venue?: string;
  event_date?: string;
  image_url?: string;
  sectors?: SectorCreate[];
}

export interface CardPaymentDetails {
  card_number: string;
  card_holder: string;
  expiry_date: string;
  cvv: string;
}

export interface CreateOrderRequest {
  event_id: string;
  sector_id: string;
  quantity: number;
  payment: CardPaymentDetails;
}

export interface TicketSummary {
  id: string;
  ticket_code: string;
  download_url: string;
}

export interface OrderResponse {
  order_id: string;
  status: string;
  total_amount: number;
  message?: string;
  tickets?: TicketSummary[];
}

export interface OrderDetail {
  order_id: string;
  customer_id: string;
  customer_name: string;
  customer_email: string;
  event_id: string;
  event_title: string;
  sector_id: string;
  sector_name: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  status: string;
  payment_transaction_id?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
  tickets?: Ticket[];
}

export interface SectorSalesReport {
  sector_id: string;
  sector_name: string;
  tickets_sold: number;
  revenue: number;
}

export interface EventSalesReport {
  event_id: string;
  event_title: string;
  total_orders: number;
  total_tickets_sold: number;
  total_revenue: number;
  sectors: SectorSalesReport[];
}

export interface Ticket {
  id: string;
  order_id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  venue: string;
  sector_name: string;
  customer_id?: string;
  customer_name: string;
  customer_email?: string;
  ticket_code: string;
  pdf_filename?: string;
  status: string;
  download_url: string;
  created_at?: string;
}

export interface CheckinScanRequest {
  ticket_code: string;
  event_id: string;
}

export interface CheckinScanResult {
  result: 'ACCEPTED' | 'REJECTED';
  reason?: string;
  ticket_code?: string;
  customer_name?: string;
  sector_name?: string;
  checked_in_at?: string;
  first_used_at?: string;
  first_porter?: string;
  message: string;
}

export interface CheckinSectorStat {
  sector_name: string;
  checked_in: number;
}

export interface CheckinEventStats {
  event_id: string;
  total_checked_in: number;
  by_sector: CheckinSectorStat[];
  last_checkin_at?: string;
}

export interface CheckinHistoryItem {
  id: string;
  ticket_code: string;
  ticket_id?: string;
  event_id: string;
  sector_name?: string;
  customer_name?: string;
  porter_id?: string;
  porter_name?: string;
  status: 'ACCEPTED' | 'REJECTED';
  rejection_reason?: string;
  checked_in_at: string;
}
