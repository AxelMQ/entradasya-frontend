import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import eventsApi from '../../api/events.api';
import ordersApi from '../../api/orders.api';
import { useAuth } from '../../context/AuthContext';
import { Event, Sector } from '../../types';
import {
  Lock,
  CreditCard,
  Calendar,
  MapPin,
  ShieldCheck,
  AlertCircle,
  ChevronLeft,
  Info,
  CheckCircle2,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const sectorIdParam = searchParams.get('sectorId');
  const qtyParam = searchParams.get('qty');

  const [event, setEvent] = useState<Event | null>(null);
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);
  const [quantity, setQuantity] = useState<number>(qtyParam ? Math.min(6, Math.max(1, parseInt(qtyParam, 10))) : 1);
  const [isLoadingEvent, setIsLoadingEvent] = useState<boolean>(true);

  // Credit Card Form State
  const [cardNumber, setCardNumber] = useState<string>('4532 8901 2345 6789');
  const [cardHolder, setCardHolder] = useState<string>(user?.name ? user.name.toUpperCase() : 'JUAN PEREZ');
  const [expiryDate, setExpiryDate] = useState<string>('12/28');
  const [cvv, setCvv] = useState<string>('892');

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!eventId) return;
    const fetchEventData = async () => {
      setIsLoadingEvent(true);
      try {
        const data = await eventsApi.getEventById(eventId);
        setEvent(data);
        if (data.sectors && data.sectors.length > 0) {
          const match = sectorIdParam ? data.sectors.find((s) => s.id === sectorIdParam) : null;
          setSelectedSector(match || data.sectors[0]);
        }
      } catch (err: any) {
        console.error('Error fetching checkout event:', err);
        setErrorMessage('No se pudo cargar el evento para procesar el pago.');
      } finally {
        setIsLoadingEvent(false);
      }
    };
    fetchEventData();
  }, [eventId, sectorIdParam]);

  // Card number input formatter (XXXX XXXX XXXX XXXX)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Expiry date formatter (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setExpiryDate(raw);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvv(raw);
  };

  const handleQuickFillReject = () => {
    setCardNumber('4532 0000 0000 0000');
  };

  const handleQuickFillSuccess = () => {
    setCardNumber('4532 8901 2345 6789');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event || !selectedSector) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    const cleanCardNumber = cardNumber.replace(/\s+/g, '');
    if (cleanCardNumber.length < 13) {
      setErrorMessage('Por favor ingresa un número de tarjeta válido.');
      setIsSubmitting(false);
      return;
    }

    try {
      setStatusMessage('Validando cupos disponibles...');
      await new Promise((resolve) => setTimeout(resolve, 350));

      setStatusMessage('Procesando cobro en pasarela segura...');
      const orderPayload = {
        event_id: event.id,
        sector_id: selectedSector.id,
        quantity,
        payment: {
          card_number: cleanCardNumber,
          card_holder: cardHolder.trim() || 'CLIENTE ENTRADASYA',
          expiry_date: expiryDate.trim() || '12/28',
          cvv: cvv.trim() || '123',
        },
      };

      const result = await ordersApi.createOrder(orderPayload);

      setStatusMessage('¡Pago aprobado! Generando entradas oficiales en PDF...');
      await new Promise((resolve) => setTimeout(resolve, 400));

      // Redirect to confirmation
      navigate(`/orders/confirmation/${result.order_id}`);
    } catch (err: any) {
      console.error('Payment checkout failed:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.response?.data?.rejection_reason ||
        'El pago no pudo completarse. Si usó la tarjeta 0000, recuerde que simula un rechazo por fondos insuficientes.';
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
      setStatusMessage('');
    }
  };

  if (isLoadingEvent) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Iniciando pasarela de pago seguro...</p>
      </div>
    );
  }

  if (!event || !selectedSector) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-card border border-card-border rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Error en la orden</h2>
        <p className="text-sm text-muted-foreground mb-6">No se encontraron los datos del evento o sector seleccionado.</p>
        <Link to="/" className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl">
          Volver a la Cartelera
        </Link>
      </div>
    );
  }

  const totalAmount = Number(selectedSector.price) * quantity;

  return (
    <div className="min-h-screen pb-20 pt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Volver a detalles del evento</span>
          </Link>
        </div>

        <div className="text-center sm:text-left mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start space-x-2">
            <Lock className="w-6 h-6 text-brand-light" />
            <span>Checkout Seguro</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Revisa tu resumen y completa el pago para recibir tus entradas inmediatamente.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-8 p-4 bg-danger/10 border border-danger/40 rounded-xl text-danger text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold">Error en la transacción:</span>
              <p className="text-xs text-danger/90">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Credit Card & Form */}
          <div className="lg:col-span-7 space-y-6">
            {/* Visual Interactive Credit Card */}
            <div className="relative mx-auto max-w-sm sm:max-w-md w-full h-52 sm:h-56 rounded-2xl p-6 bg-gradient-to-tr from-indigo-900 via-indigo-700 to-brand text-white shadow-2xl overflow-hidden border border-indigo-400/30 flex flex-col justify-between">
              <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest uppercase opacity-80">Tarjeta de Crédito / Débito</span>
                <CreditCard className="w-7 h-7 opacity-90" />
              </div>

              {/* Card Number display */}
              <div className="my-auto">
                <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-shadow">
                  {cardNumber || '•••• •••• •••• ••••'}
                </span>
              </div>

              {/* Card Holder & Expiry */}
              <div className="flex items-center justify-between text-xs tracking-wider">
                <div>
                  <span className="block text-[10px] uppercase opacity-70">Titular</span>
                  <span className="font-semibold uppercase tracking-wide truncate max-w-[200px] block">
                    {cardHolder || 'NOMBRE TITULAR'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[10px] uppercase opacity-70">Expira</span>
                  <span className="font-mono font-semibold">{expiryDate || 'MM/AA'}</span>
                </div>
              </div>
            </div>

            {/* Educational Testing Callout */}
            <div className="p-4 rounded-xl bg-brand/10 border border-brand/30 flex items-start space-x-3">
              <Info className="w-5 h-5 text-brand-light flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-xs">
                <p className="text-slate-200">
                  <strong className="text-brand-light">💡 Modo de Pruebas:</strong> Para simular un pago{' '}
                  <span className="text-emerald-400 font-bold">APROBADO</span> use cualquier tarjeta. Para simular un{' '}
                  <span className="text-danger font-bold">RECHAZO</span> por fondos insuficientes use una tarjeta terminada en{' '}
                  <span className="font-mono bg-background/60 px-1 py-0.5 rounded text-white">0000</span>.
                </p>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={handleQuickFillSuccess}
                    className="px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 rounded text-[11px] text-emerald-300 font-medium transition-colors"
                  >
                    Simular Tarjeta Válida
                  </button>
                  <button
                    type="button"
                    onClick={handleQuickFillReject}
                    className="px-2.5 py-1 bg-danger/20 hover:bg-danger/30 border border-danger/40 rounded text-[11px] text-danger font-medium transition-colors"
                  >
                    Simular Tarjeta ...0000 (Rechazo)
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <form onSubmit={handleSubmitPayment} className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-white mb-2">Datos de Facturación</h3>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Número de Tarjeta</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4532 0000 1234 5678"
                    className="w-full pl-4 pr-10 py-2.5 bg-background border border-card-border rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                  <CreditCard className="w-5 h-5 text-muted-foreground absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Nombre en la Tarjeta</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  placeholder="JUAN PEREZ"
                  className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm placeholder-slate-600 uppercase focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Vencimiento (MM/AA)</label>
                  <input
                    type="text"
                    required
                    value={expiryDate}
                    onChange={handleExpiryChange}
                    placeholder="12/28"
                    className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Código CVV</label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={handleCvvChange}
                    placeholder="123"
                    className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white font-mono text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-brand hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-extrabold text-base rounded-xl shadow-xl shadow-brand/20 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{statusMessage || 'Procesando pago seguro...'}</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Pagar BOB {totalAmount.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="text-lg font-bold text-white pb-3 border-b border-card-border">Resumen de la Orden</h3>

              {/* Event card item */}
              <div className="flex space-x-3">
                <img
                  src={
                    event.image_url ||
                    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80'
                  }
                  alt={event.title}
                  className="w-20 h-20 rounded-xl object-cover bg-slate-800 flex-shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white line-clamp-2">{event.title}</h4>
                  <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5 text-brand-light flex-shrink-0" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5 text-brand-light flex-shrink-0" />
                    <span>{new Date(event.event_date).toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="pt-4 border-t border-card-border space-y-2.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Sector seleccionado</span>
                  <span className="font-semibold text-white">{selectedSector.name}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Precio unitario</span>
                  <span className="font-semibold text-white">BOB {Number(selectedSector.price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Cantidad de entradas</span>
                  <span className="font-semibold text-white">{quantity}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Comisión por emisión</span>
                  <span className="font-semibold text-emerald-400">BOB 0.00 (Gratis)</span>
                </div>

                <div className="pt-3 border-t border-card-border flex justify-between items-baseline">
                  <span className="text-base font-bold text-white">Total a Pagar</span>
                  <span className="text-2xl font-extrabold text-brand-light">
                    BOB {totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Guarantees */}
              <div className="pt-4 border-t border-card-border/60 space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center space-x-2 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>Reserva atómica garantizada por 10 minutos.</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-brand-light flex-shrink-0" />
                  <span>Generación instantánea de boletos con código QR único.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
