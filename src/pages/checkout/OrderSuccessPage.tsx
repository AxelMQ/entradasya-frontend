import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ordersApi from '../../api/orders.api';
import ticketsApi from '../../api/tickets.api';
import { OrderDetail, Ticket } from '../../types';
import {
  CheckCircle,
  Download,
  Mail,
  Ticket as TicketIcon,
  Compass,
  ArrowRight,
  AlertCircle,
  Calendar,
  MapPin,
} from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { orderId, id } = useParams<{ orderId?: string; id?: string }>();
  const activeOrderId = orderId || id;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeOrderId) return;
    const loadOrderData = async () => {
      setIsLoading(true);
      try {
        const orderData = await ordersApi.getOrderById(activeOrderId);
        setOrder(orderData);

        // Fetch tickets issued for this order
        try {
          const ticketsData = await ticketsApi.getTicketsByOrder(activeOrderId);
          setTickets(ticketsData);
        } catch (tErr) {
          console.warn('Could not fetch tickets by order directly:', tErr);
          if (orderData.tickets) {
            setTickets(orderData.tickets);
          }
        }
      } catch (err) {
        console.error('Error loading order success data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    loadOrderData();
  }, [activeOrderId]);

  const handleDownloadPdf = async (ticket: Ticket) => {
    try {
      setDownloadingId(ticket.id);
      await ticketsApi.downloadTicketBlob(ticket.id, `boleto_${ticket.ticket_code}.pdf`);
    } catch (err) {
      console.error('Download failed, using direct link fallback:', err);
      window.open(ticketsApi.getTicketDownloadUrl(ticket.id), '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Confirmando emisión de boletos y recibo...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Festive Success Banner */}
        <div className="bg-card border border-emerald-500/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/30">
            <CheckCircle className="w-10 h-10" />
          </div>

          <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
            ¡Tu compra ha sido confirmada con éxito!
          </h1>
          <p className="text-base text-muted-foreground max-w-lg mx-auto mb-6">
            Tus entradas están emitidas y listas para su presentación en puerta.
          </p>

          {/* Mailpit Notice Callout */}
          <div className="inline-flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-surface-elevated/80 border border-card-border text-xs text-slate-300">
            <Mail className="w-4 h-4 text-brand-light flex-shrink-0" />
            <span>
              Se ha enviado un correo con tus boletos a tu bandeja{' '}
              <strong className="text-white">(puedes revisarlo en Mailpit: http://localhost:8025)</strong>.
            </span>
          </div>
        </div>

        {/* Order Details & Tickets Card */}
        <div className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between pb-4 border-b border-card-border gap-2">
            <div>
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">Código de Orden</span>
              <p className="font-mono text-sm font-bold text-brand-light">{activeOrderId}</p>
            </div>
            {order && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground">Total Pagado:</span>
                <p className="text-lg font-extrabold text-white">BOB {Number(order.total_amount).toFixed(2)}</p>
              </div>
            )}
          </div>

          {order && (
            <div className="p-4 bg-background/50 rounded-xl border border-card-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">{order.event_title}</h4>
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-brand-light" />
                    <span>Sector {order.sector_name}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-brand-light" />
                    <span>{new Date(order.created_at).toLocaleDateString('es-ES')}</span>
                  </span>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700/50 self-start sm:self-center">
                {order.status || 'PAGADA'}
              </span>
            </div>
          )}

          {/* Individual Issued Tickets */}
          <div className="space-y-4 pt-2">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <TicketIcon className="w-4 h-4 text-brand-light" />
              <span>Boletos Digitales Generados</span>
            </h3>

            {tickets.length > 0 ? (
              <div className="space-y-3">
                {tickets.map((t, idx) => (
                  <div
                    key={t.id || idx}
                    className="p-4 rounded-xl bg-surface-elevated/40 border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand/40 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-brand/10 border border-brand/30 flex items-center justify-center text-brand-light font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <span className="block text-xs text-muted-foreground">Código de boleto</span>
                        <span className="font-mono text-sm font-bold text-white tracking-wider">
                          {t.ticket_code}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownloadPdf(t)}
                      disabled={downloadingId === t.id}
                      className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all"
                    >
                      {downloadingId === t.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      <span>Descargar Boleto PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-background/50 rounded-xl text-center text-xs text-muted-foreground">
                <p>Tus entradas fueron emitidas exitosamente en la base de datos.</p>
                <p className="mt-1">Puedes verlas y descargarlas con QR en la sección Mis Entradas.</p>
              </div>
            )}
          </div>

          {/* Navigation Action Buttons */}
          <div className="pt-6 border-t border-card-border flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              to="/my-tickets"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl shadow-xl shadow-brand/20 transition-all"
            >
              <TicketIcon className="w-4 h-4" />
              <span>Ir a Mis Entradas</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-card hover:bg-surface-elevated border border-card-border text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Compass className="w-4 h-4" />
              <span>Volver a la Cartelera</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
