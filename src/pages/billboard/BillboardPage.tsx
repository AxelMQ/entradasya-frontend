import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import eventsApi from '../../api/events.api';
import { Event } from '../../types';
import { Search, MapPin, Calendar, ArrowRight, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

export const BillboardPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const loadEvents = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventsApi.getEvents();
      setEvents(data);
    } catch (err: any) {
      console.error('Error loading billboard events:', err);
      setError('No se pudo cargar la cartelera de eventos. Por favor, intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = events.filter((event) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      event.title.toLowerCase().includes(term) ||
      event.venue.toLowerCase().includes(term) ||
      (event.description && event.description.toLowerCase().includes(term))
    );
  });

  const formatBadgeDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate();
      const month = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
      return { day, month };
    } catch {
      return { day: '01', month: 'ENE' };
    }
  };

  const formatEventDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'short',
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

  const getMinPrice = (event: Event): number => {
    if (event.min_price !== undefined && event.min_price !== null) {
      return Number(event.min_price);
    }
    if (event.sectors && event.sectors.length > 0) {
      return Math.min(...event.sectors.map((s) => Number(s.price)));
    }
    return 0;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-dark/30 via-background to-background py-16 sm:py-24 border-b border-card-border/50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-brand/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand/10 border border-brand/30 text-brand-light text-xs font-semibold mb-6 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cartelera Oficial EntradasYa 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-4">
            Los mejores eventos en vivo,<br />
            <span className="bg-gradient-to-r from-brand-light via-indigo-300 to-white bg-clip-text text-transparent">
              a un clic de distancia.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground mb-8">
            Compra entradas 100% digitales para conciertos, festivales y partidos. Acceso instantáneo con código QR y cero comisiones ocultas.
          </p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por artista, evento o recinto..."
                className="w-full pl-12 pr-4 py-3.5 bg-card/90 backdrop-blur-md border border-card-border rounded-2xl text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent shadow-xl transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 text-xs font-semibold text-muted-foreground hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Próximos Espectáculos</h2>
            <p className="text-sm text-muted-foreground">Explora eventos disponibles y asegura tu lugar</p>
          </div>
          <button
            onClick={loadEvents}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-card border border-card-border hover:text-white hover:bg-surface-elevated transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 mb-8 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-card border border-card-border rounded-2xl overflow-hidden animate-pulse flex flex-col h-96"
              >
                <div className="h-48 bg-slate-800" />
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-5 bg-slate-800 rounded w-3/4" />
                    <div className="h-4 bg-slate-800 rounded w-1/2" />
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                  </div>
                  <div className="h-10 bg-slate-800 rounded-xl mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filteredEvents.length === 0 && (
          <div className="max-w-md mx-auto my-16 p-8 bg-card border border-card-border rounded-2xl text-center">
            <div className="w-16 h-16 bg-surface-elevated text-muted-foreground rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-brand-light" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No se encontraron eventos</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {searchTerm
                ? `No hay espectáculos que coincidan con "${searchTerm}".`
                : 'En este momento no hay eventos programados en cartelera.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="px-4 py-2 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-hover transition-colors"
              >
                Ver todos los eventos
              </button>
            )}
          </div>
        )}

        {/* Event Cards Grid */}
        {!isLoading && filteredEvents.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const { day, month } = formatBadgeDate(event.event_date);
              const minPrice = getMinPrice(event);

              return (
                <div
                  key={event.id}
                  className="group bg-card border border-card-border hover:border-brand/50 rounded-2xl overflow-hidden flex flex-col shadow-lg hover:shadow-brand/10 transition-all duration-300 hover:scale-[1.02]"
                >
                  {/* Poster Image with floating date */}
                  <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-900">
                    <img
                      src={
                        event.image_url ||
                        'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80'
                      }
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent opacity-80" />

                    {/* Floating Date Badge */}
                    <div className="absolute top-3 left-3 bg-background/90 backdrop-blur-md border border-card-border px-2.5 py-1.5 rounded-xl text-center shadow-lg">
                      <span className="block text-base font-extrabold text-white leading-none">{day}</span>
                      <span className="block text-[10px] font-bold text-brand-light uppercase tracking-wider">{month}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-light transition-colors line-clamp-2 mb-2">
                        {event.title}
                      </h3>

                      <div className="space-y-1.5 text-xs text-muted-foreground mb-4">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-brand-light flex-shrink-0" />
                          <span className="truncate">{event.venue}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3.5 h-3.5 text-brand-light flex-shrink-0" />
                          <span>{formatEventDate(event.event_date)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Footer with Price and CTA */}
                    <div className="pt-4 border-t border-card-border/80 flex items-center justify-between mt-auto">
                      <div>
                        <span className="block text-[11px] text-muted-foreground font-medium">Desde</span>
                        <span className="text-base font-extrabold text-white">
                          BOB {minPrice.toFixed(2)}
                        </span>
                      </div>

                      <Link
                        to={`/events/${event.id}`}
                        className="inline-flex items-center space-x-1.5 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-xs font-semibold rounded-xl shadow-md shadow-brand/20 transition-all group-hover:bg-brand-hover"
                      >
                        <span>Ver Entradas</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default BillboardPage;
