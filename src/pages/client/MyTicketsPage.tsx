import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ordersApi from '../../api/orders.api';
import ticketsApi from '../../api/tickets.api';
import { useAuth } from '../../context/AuthContext';
import { Ticket as TicketType } from '../../types';
import {
  Ticket as TicketIcon,
  Download,
  Calendar,
  MapPin,
  User,
  QrCode,
  Smartphone,
  Compass,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export const MyTicketsPage: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const fetchUserTickets = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // 1. Fetch user's orders
      const orders = await ordersApi.getMyOrders();
      const paidOrders = orders.filter((o) => o.status === 'PAGADA' || o.status === 'PAID');

      // 2. Fetch tickets for each paid order
      const allTickets: TicketType[] = [];
      for (const order of paidOrders) {
        try {
          const orderTickets = await ticketsApi.getTicketsByOrder(order.order_id);
          allTickets.push(...orderTickets);
        } catch (tErr) {
          console.warn(`Could not load tickets for order ${order.order_id}:`, tErr);
          if (order.tickets && order.tickets.length > 0) {
            allTickets.push(...order.tickets);
          }
        }
      }

      setTickets(allTickets);
    } catch (err: any) {
      console.error('Error loading my tickets:', err);
      setError('No se pudieron cargar tus entradas. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, []);

  const handleDownload = async (ticket: TicketType) => {
    try {
      setDownloadingId(ticket.id);
      await ticketsApi.downloadTicketBlob(ticket.id, `boleto_${ticket.ticket_code}.pdf`);
    } catch (err) {
      console.error('Download error:', err);
      window.open(ticketsApi.getTicketDownloadUrl(ticket.id), '_blank');
    } finally {
      setDownloadingId(null);
    }
  };

  // Generate SVG QR placeholder based on ticket_code
  const renderQrPreview = (code: string) => {
    // Generate clean visual QR pattern using standard SVG
    return (
      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white p-2 rounded-xl flex items-center justify-center shadow-md">
        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`}
          alt={`QR ${code}`}
          className="w-full h-full object-contain"
          onError={(e) => {
            // Fallback if external image API is offline
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-card-border gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <TicketIcon className="w-7 h-7 text-brand-light" />
            <span>Mis Entradas (Billetera Digital)</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tus boletos oficiales emitidos con código QR listos para escanear en puerta.
          </p>
        </div>

        <button
          onClick={fetchUserTickets}
          className="self-start sm:self-auto flex items-center space-x-1.5 px-3.5 py-2 bg-card border border-card-border rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Helpful Mobile Entry Notice */}
      <div className="mb-8 p-4 bg-emerald-950/40 border border-emerald-700/40 rounded-2xl flex items-start space-x-3 text-xs text-emerald-200">
        <Smartphone className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-white">Instrucción para el día del evento:</span>
          <p className="mt-0.5 text-emerald-300/90 leading-relaxed">
            Muestra este código QR directamente desde la pantalla de tu celular en la puerta de acceso al recinto o presenta el boleto PDF impreso.
          </p>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 mb-8 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-44 bg-card border border-card-border rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && tickets.length === 0 && (
        <div className="max-w-md mx-auto my-16 p-8 bg-card border border-card-border rounded-2xl text-center shadow-xl">
          <div className="w-16 h-16 bg-surface-elevated text-brand-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <TicketIcon className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No tienes entradas activas</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Aún no has adquirido entradas para próximos espectáculos. ¡Explora nuestra cartelera!
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand/20 transition-all"
          >
            <Compass className="w-4 h-4" />
            <span>Ver Cartelera de Eventos</span>
          </Link>
        </div>
      )}

      {/* Ticket Stubs List */}
      {!isLoading && tickets.length > 0 && (
        <div className="space-y-6">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="relative bg-card border border-card-border rounded-2xl shadow-xl overflow-hidden hover:border-brand/40 transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row">
                {/* Left Side: Ticket Body */}
                <div className="p-6 sm:p-7 flex-1 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-brand/20 border border-brand/40 text-brand-light">
                      Sector {ticket.sector_name}
                    </span>
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                      {ticket.status || 'VÁLIDO'}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    {ticket.event_title}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-brand-light flex-shrink-0" />
                      <span>{new Date(ticket.event_date).toLocaleString('es-ES')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-brand-light flex-shrink-0" />
                      <span className="truncate">{ticket.venue}</span>
                    </div>
                    <div className="flex items-center space-x-2 sm:col-span-2">
                      <User className="w-4 h-4 text-brand-light flex-shrink-0" />
                      <span>Titular: <strong className="text-white">{ticket.customer_name || user?.name}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Perforated Stub Divider (Dotted tear line) */}
                <div className="relative flex md:flex-col items-center justify-center py-2 md:py-0 md:px-2">
                  <div className="hidden md:block w-px h-full border-r-2 border-dashed border-card-border" />
                  <div className="block md:hidden w-full h-px border-b-2 border-dashed border-card-border" />
                </div>

                {/* Right Side: QR Code & PDF CTA */}
                <div className="p-6 bg-surface-elevated/40 flex flex-col items-center justify-center space-y-3 min-w-[200px] border-t md:border-t-0 md:border-l border-card-border/60">
                  {renderQrPreview(ticket.ticket_code)}

                  <div className="text-center">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                      Código Boleto
                    </span>
                    <span className="font-mono text-sm font-bold text-white tracking-wider">
                      {ticket.ticket_code}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDownload(ticket)}
                    disabled={downloadingId === ticket.id}
                    className="w-full inline-flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-brand/20 transition-colors"
                  >
                    {downloadingId === ticket.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    <span>Descargar PDF Oficial</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;
