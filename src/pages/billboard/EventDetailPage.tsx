import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import eventsApi from '../../api/events.api';
import { useAuth } from '../../context/AuthContext';
import { Event, Sector } from '../../types';
import {
  Calendar,
  MapPin,
  ShieldCheck,
  Ticket,
  ChevronLeft,
  Plus,
  Minus,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await eventsApi.getEventById(id);
        setEvent(data);
        // Default select first sector with available spots
        if (data.sectors && data.sectors.length > 0) {
          const available = data.sectors.find((s) => s.available_spots > 0) || data.sectors[0];
          setSelectedSector(available);
        }
      } catch (err: any) {
        console.error('Error fetching event details:', err);
        setError('No se pudo encontrar el evento solicitado.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleSectorSelect = (sector: Sector) => {
    if (sector.available_spots <= 0) return;
    setSelectedSector(sector);
    setQuantity(1);
  };

  const handleQuantityChange = (delta: number) => {
    if (!selectedSector) return;
    const maxAllowed = Math.min(6, selectedSector.available_spots);
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= maxAllowed) {
      setQuantity(newQty);
    }
  };

  const handleProceedToCheckout = () => {
    if (!event || !selectedSector) return;
    if (!isAuthenticated) {
      // Save state and redirect to login
      navigate('/login', {
        state: {
          from: `/checkout/${event.id}?sectorId=${selectedSector.id}&qty=${quantity}`,
        },
      });
      return;
    }
    navigate(`/checkout/${event.id}?sectorId=${selectedSector.id}&qty=${quantity}`);
  };

  const formatFullDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Cargando información del evento...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-card border border-card-border rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Evento no disponible</h2>
        <p className="text-sm text-muted-foreground mb-6">{error || 'El evento no existe o ha sido despublicado.'}</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl hover:bg-brand-hover transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver a la Cartelera</span>
        </Link>
      </div>
    );
  }

  const subtotal = selectedSector ? Number(selectedSector.price) * quantity : 0;
  const isSelectedSoldOut = !selectedSector || selectedSector.available_spots <= 0;

  return (
    <div className="min-h-screen pb-20">
      {/* Back button link */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver a Cartelera</span>
        </Link>
      </div>

      {/* Panoramic Header Banner */}
      <div className="relative w-full h-72 sm:h-96 overflow-hidden bg-slate-950 border-y border-card-border">
        <img
          src={
            event.image_url ||
            'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1600&q=80'
          }
          alt={event.title}
          className="w-full h-full object-cover filter blur-[2px] scale-105 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
        
        {/* Banner Content overlay */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 absolute inset-0 flex flex-col justify-end pb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand/20 border border-brand/40 text-brand-light flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{event.status || 'PUBLICADO'}</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-card/80 border border-card-border text-slate-300 flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-brand-light" />
              <span>{event.venue}</span>
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-card/80 border border-card-border text-slate-300 flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-brand-light" />
              <span>{formatFullDate(event.event_date)}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-4xl">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Event Details & Specs */}
          <div className="lg:col-span-7 space-y-8">
            {/* Description */}
            <div className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <Ticket className="w-5 h-5 text-brand-light" />
                <span>Acerca del Espectáculo</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {event.description ||
                  'Disfruta de una velada única con la mejor puesta en escena, sonido de alta definición y control de acceso digital sin demoras.'}
              </p>
            </div>

            {/* Security and Digital Guarantee Callout */}
            <div className="bg-brand-dark/20 border border-brand/30 rounded-2xl p-6 flex items-start space-x-4">
              <div className="w-10 h-10 rounded-xl bg-brand/20 text-brand-light flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Garantía Digital EntradasYa</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Compra 100% digital y segura. Tus entradas se emiten al instante en formato PDF oficial con código QR único de uso exclusivo para tu acceso en puerta.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Ticket & Sector Selector */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 bg-card border border-card-border rounded-2xl p-6 shadow-2xl space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Selecciona tu Sector</h3>
                <p className="text-xs text-muted-foreground">Precios transparentes y cupos actualizados en vivo</p>
              </div>

              {/* Sectors List */}
              <div className="space-y-3">
                {event.sectors && event.sectors.length > 0 ? (
                  event.sectors.map((sector) => {
                    const isSoldOut = sector.available_spots <= 0;
                    const isSelected = selectedSector?.id === sector.id;
                    const isLowStock = sector.available_spots > 0 && sector.available_spots <= 15;

                    return (
                      <div
                        key={sector.id}
                        onClick={() => handleSectorSelect(sector)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSoldOut
                            ? 'opacity-50 border-danger/20 bg-background/50 cursor-not-allowed'
                            : isSelected
                            ? 'border-brand bg-brand/10 ring-1 ring-brand shadow-lg'
                            : 'border-card-border bg-surface-elevated/40 hover:border-slate-700 hover:bg-surface-elevated'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-white">{sector.name}</span>
                            {isSoldOut ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-danger/20 text-danger border border-danger/30">
                                Agotado
                              </span>
                            ) : isLowStock ? (
                              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-warning/20 text-warning border border-warning/30">
                                ¡Últimos {sector.available_spots} cupos!
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">
                                ({sector.available_spots} disponibles)
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">Acceso numerado/general</span>
                        </div>

                        <div className="text-right">
                          <span className="block text-base font-extrabold text-white">
                            BOB {Number(sector.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground italic">No hay sectores configurados para este evento.</p>
                )}
              </div>

              {/* Quantity Selector (Strict Max 6) */}
              {selectedSector && !isSelectedSoldOut && (
                <div className="pt-4 border-t border-card-border space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-semibold text-white">Cantidad de entradas</span>
                      <p className="text-[11px] text-muted-foreground">Máximo 6 entradas por compra</p>
                    </div>

                    <div className="flex items-center space-x-3 bg-surface-elevated border border-card-border rounded-xl p-1">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-bold text-white">{quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= Math.min(6, selectedSector.available_spots)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white hover:bg-card disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal Calculation */}
                  <div className="p-3 bg-background/60 rounded-xl border border-card-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Subtotal ({quantity} {quantity === 1 ? 'entrada' : 'entradas'} x BOB{' '}
                      {Number(selectedSector.price).toFixed(2)})
                    </span>
                    <span className="text-lg font-extrabold text-white">BOB {subtotal.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* CTA Continue to checkout */}
              <button
                onClick={handleProceedToCheckout}
                disabled={isSelectedSoldOut}
                className="w-full py-3.5 px-4 bg-brand hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-xl shadow-brand/20 transition-all flex items-center justify-center space-x-2"
              >
                <span>{isSelectedSoldOut ? 'Sector Agotado' : 'Continuar a Pagar'}</span>
                {!isSelectedSoldOut && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
