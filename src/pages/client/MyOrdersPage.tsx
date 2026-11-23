import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ordersApi from '../../api/orders.api';
import { OrderDetail } from '../../types';
import {
  ShoppingBag,
  Ticket,
  Calendar,
  AlertCircle,
  Clock,
  Compass,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export const MyOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError('No se pudo cargar tu historial de compras.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string, reason?: string) => {
    const norm = status.toUpperCase();
    if (norm === 'PAGADA' || norm === 'PAID') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700/50">
          Pagada
        </span>
      );
    }
    if (norm === 'RECHAZADA' || norm === 'REJECTED') {
      return (
        <div className="flex flex-col items-start">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-danger/20 text-danger border border-danger/40">
            Rechazada
          </span>
          {reason && (
            <span className="text-[10px] text-danger/80 mt-1 max-w-[150px] truncate" title={reason}>
              {reason}
            </span>
          )}
        </div>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-warning/20 text-warning border border-warning/40">
        Pendiente
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-card-border gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <ShoppingBag className="w-7 h-7 text-brand-light" />
            <span>Mis Compras (Historial de Órdenes)</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Consulta el estado de tus transacciones, montos pagados y comprobantes.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          className="self-start sm:self-auto flex items-center space-x-1.5 px-3.5 py-2 bg-card border border-card-border rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-card border border-card-border rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && orders.length === 0 && (
        <div className="max-w-md mx-auto my-16 p-8 bg-card border border-card-border rounded-2xl text-center shadow-xl">
          <div className="w-16 h-16 bg-surface-elevated text-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No tienes compras registradas</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Aún no has adquirido entradas para ningún evento. ¡Visita la cartelera de espectáculos!
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand/20 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Explorar Cartelera</span>
          </Link>
        </div>
      )}

      {/* Orders List / Cards */}
      {!isLoading && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => {
            const isPaid = order.status.toUpperCase() === 'PAGADA' || order.status.toUpperCase() === 'PAID';

            return (
              <div
                key={order.order_id}
                className="bg-card border border-card-border rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-700 transition-colors"
              >
                {/* Event & Order info */}
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-xs text-muted-foreground">
                      Orden #{order.order_id.slice(0, 8)}...
                    </span>
                    <span className="flex items-center space-x-1 text-xs text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatDate(order.created_at)}</span>
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {order.event_title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
                    <span className="px-2 py-0.5 rounded bg-surface-elevated text-slate-300 font-medium">
                      Sector: {order.sector_name}
                    </span>
                    <span>Cantidad: <strong className="text-white">{order.quantity}</strong> {order.quantity === 1 ? 'entrada' : 'entradas'}</span>
                    <span>Precio Unitario: BOB {Number(order.unit_price).toFixed(2)}</span>
                  </div>
                </div>

                {/* Amount, status and action */}
                <div className="flex items-center justify-between md:justify-end md:space-x-8 pt-3 md:pt-0 border-t md:border-t-0 border-card-border">
                  <div className="text-left md:text-right">
                    <span className="block text-xs text-muted-foreground">Monto Total</span>
                    <span className="text-xl font-extrabold text-white">
                      BOB {Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>

                  <div>
                    {getStatusBadge(order.status, order.rejection_reason)}
                  </div>

                  {isPaid && (
                    <div>
                      <Link
                        to={`/orders/confirmation/${order.order_id}`}
                        className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-md shadow-brand/20 transition-all"
                      >
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Ver Boletos</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
