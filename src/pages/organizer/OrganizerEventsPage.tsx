import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import eventsApi from '../../api/events.api';
import { Event } from '../../types';
import {
  CalendarPlus,
  Sliders,
  Calendar,
  MapPin,
  TrendingUp,
  Edit,
  Globe,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react';

export const OrganizerEventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrganizerEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventsApi.getOrganizerEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('Error fetching organizer events:', err);
      setError('No se pudieron cargar tus eventos. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerEvents();
  }, []);

  const handlePublish = async (event: Event) => {
    try {
      setUpdatingId(event.id);
      await eventsApi.updateEventStatus(event.id, 'PUBLISHED');
      await fetchOrganizerEvents();
    } catch (err: any) {
      console.error('Error publishing event:', err);
      alert('Error al publicar el evento: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCancel = async (event: Event) => {
    if (!window.confirm(`¿Estás seguro de cancelar el evento "${event.title}"?`)) return;
    try {
      setUpdatingId(event.id);
      await eventsApi.updateEventStatus(event.id, 'CANCELLED');
      await fetchOrganizerEvents();
    } catch (err: any) {
      console.error('Error cancelling event:', err);
      alert('Error al cancelar el evento.');
    } finally {
      setUpdatingId(null);
    }
  };

  const calculateCapacityStats = (event: Event) => {
    if (!event.sectors || event.sectors.length === 0) {
      return { total: 0, available: 0, sold: 0 };
    }
    const total = event.sectors.reduce((acc, s) => acc + (s.capacity || 0), 0);
    const available = event.sectors.reduce((acc, s) => acc + (s.available_spots || 0), 0);
    const sold = Math.max(0, total - available);
    return { total, available, sold };
  };

  const getStatusBadge = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'PUBLISHED') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-700/50">
          <Globe className="w-3 h-3" />
          <span>Publicado</span>
        </span>
      );
    }
    if (s === 'CANCELLED') {
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-danger/20 text-danger border border-danger/40">
          <XCircle className="w-3 h-3" />
          <span>Cancelado</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
        <span>Borrador</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-card-border gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Sliders className="w-7 h-7 text-emerald-400" />
            <span>Panel del Productor: Mis Eventos</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona tus espectáculos, publica en cartelera y monitorea ventas en tiempo real.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOrganizerEvents}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-card border border-card-border rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
          <Link
            to="/organizer/events/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-xs font-bold rounded-xl shadow-lg shadow-brand/20 transition-all hover:scale-[1.02]"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>+ Crear Nuevo Evento</span>
          </Link>
        </div>
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
            <div key={i} className="h-32 bg-card border border-card-border rounded-2xl animate-pulse" />
          ))}
        </div>
      )}

      {!isLoading && events.length === 0 && (
        <div className="max-w-md mx-auto my-16 p-8 bg-card border border-card-border rounded-2xl text-center shadow-xl">
          <div className="w-16 h-16 bg-surface-elevated text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CalendarPlus className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Aún no has creado eventos</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Empieza configurando tu primer show, asignando sectores y aforos para abrir la venta.
          </p>
          <Link
            to="/organizer/events/new"
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-semibold rounded-xl shadow-lg shadow-brand/20 transition-all"
          >
            <CalendarPlus className="w-4 h-4" />
            <span>Crear mi primer evento</span>
          </Link>
        </div>
      )}

      {/* Events Table / Card List */}
      {!isLoading && events.length > 0 && (
        <div className="space-y-4">
          {events.map((event) => {
            const { total, sold, available } = calculateCapacityStats(event);
            const percentSold = total > 0 ? Math.round((sold / total) * 100) : 0;
            const isUpdating = updatingId === event.id;

            return (
              <div
                key={event.id}
                className="bg-card border border-card-border rounded-2xl p-6 shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-700 transition-colors"
              >
                {/* Event Thumb & Info */}
                <div className="flex items-start space-x-4 flex-1">
                  <img
                    src={
                      event.image_url ||
                      'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'
                    }
                    alt={event.title}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                  />
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {getStatusBadge(event.status)}
                      <span className="text-xs text-muted-foreground">
                        {event.sectors?.length || 0} sectores configurados
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
                      {event.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-0.5">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-brand-light" />
                        <span>{event.venue}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-brand-light" />
                        <span>{new Date(event.event_date).toLocaleDateString('es-ES')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Capacity & Progress */}
                <div className="lg:w-48 space-y-1.5 bg-background/50 p-3 rounded-xl border border-card-border">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Aforo vendido</span>
                    <span className="font-bold text-white">
                      {sold} / {total} ({percentSold}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, percentSold)}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-muted-foreground block text-right">
                    {available} disponibles
                  </span>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-card-border">
                  {event.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(event)}
                      disabled={isUpdating}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center space-x-1.5"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Publicar</span>
                    </button>
                  )}

                  {event.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleCancel(event)}
                      disabled={isUpdating}
                      className="px-3 py-2 bg-danger/20 hover:bg-danger/30 text-danger text-xs font-medium rounded-xl border border-danger/30 transition-colors flex items-center space-x-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Cancelar</span>
                    </button>
                  )}

                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    className="p-2 bg-surface-elevated hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-card-border transition-colors"
                    title="Editar evento"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/organizer/events/${event.id}/stats`}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-brand/20 hover:bg-brand/30 border border-brand/40 text-brand-light hover:text-white text-xs font-bold rounded-xl transition-all"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Estadísticas</span>
                  </Link>

                  <Link
                    to={`/events/${event.id}`}
                    target="_blank"
                    className="p-2 bg-card hover:bg-surface-elevated text-slate-400 hover:text-white rounded-xl border border-card-border transition-colors"
                    title="Ver vista pública"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrganizerEventsPage;
