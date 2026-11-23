import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import eventsApi from '../../api/events.api';
import { SectorCreate } from '../../types';
import {
  CalendarPlus,
  Plus,
  Trash2,
  ChevronLeft,
  Image as ImageIcon,
  AlertCircle,
  Globe,
  Save,
  CheckCircle,
} from 'lucide-react';

export const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();

  // General event info
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [venue, setVenue] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('2026-12-15T20:00');
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80'
  );

  // Dynamic sectors
  const [sectors, setSectors] = useState<SectorCreate[]>([
    { name: 'General', capacity: 300, price: 80.0 },
    { name: 'VIP', capacity: 100, price: 200.0 },
  ]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAddSector = () => {
    setSectors([
      ...sectors,
      {
        name: `Sector ${String.fromCharCode(65 + sectors.length)}`,
        capacity: 100,
        price: 150.0,
      },
    ]);
  };

  const handleRemoveSector = (index: number) => {
    if (sectors.length <= 1) {
      alert('El evento debe tener al menos un sector configurado.');
      return;
    }
    setSectors(sectors.filter((_, i) => i !== index));
  };

  const handleSectorChange = (
    index: number,
    field: keyof SectorCreate,
    value: string | number
  ) => {
    const updated = [...sectors];
    if (field === 'capacity') {
      updated[index].capacity = Math.max(1, parseInt(String(value), 10) || 1);
    } else if (field === 'price') {
      updated[index].price = Math.max(0, parseFloat(String(value)) || 0);
    } else {
      updated[index].name = String(value);
    }
    setSectors(updated);
  };

  const handleSubmit = async (publishImmediately: boolean) => {
    if (!title.trim() || !venue.trim() || !eventDate) {
      setErrorMessage('Por favor completa todos los campos requeridos (título, fecha y recinto).');
      return;
    }

    if (sectors.length === 0) {
      setErrorMessage('Debes agregar al menos un sector con capacidad y precio.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      // Ensure ISO string with timezone
      const formattedDate = new Date(eventDate).toISOString();

      const created = await eventsApi.createEvent({
        title: title.trim(),
        description: description.trim(),
        venue: venue.trim(),
        event_date: formattedDate,
        image_url: imageUrl.trim(),
        sectors,
      });

      if (publishImmediately) {
        await eventsApi.updateEventStatus(created.id, 'PUBLISHED');
      }

      navigate('/organizer/events');
    } catch (err: any) {
      console.error('Error creating event:', err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Error al crear el evento. Verifica los campos ingresados.';
      setErrorMessage(typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Navigation back */}
      <div className="mb-6">
        <Link
          to="/organizer/events"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Panel de Eventos</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <CalendarPlus className="w-7 h-7 text-emerald-400" />
          <span>Crear Nuevo Espectáculo</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configura los detalles del show y la estructura de precios por sector.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Step 1: General Info Card */}
        <div className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <h2 className="text-lg font-bold text-white border-b border-card-border pb-3">
            Paso 1: Información General del Evento
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Título del Evento *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Concierto de Rock Nacional 2026"
                className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Fecha y Hora del Evento *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Recinto / Dirección Física *
                </label>
                <input
                  type="text"
                  required
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="Ej. Teatro al Aire Libre"
                  className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                URL de Imagen / Afiche Promocional
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {imageUrl && (
                <div className="mt-3 relative w-full h-36 rounded-xl overflow-hidden bg-slate-900 border border-card-border">
                  <img
                    src={imageUrl}
                    alt="Vista previa afiche"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <span className="absolute bottom-2 left-2 text-[10px] font-semibold bg-background/80 px-2 py-0.5 rounded text-slate-300">
                    Vista previa de imagen
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Descripción del Evento
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalla la cartelera de bandas, horarios de ingreso, accesos y recomendaciones..."
                className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>
        </div>

        {/* Step 2: Dynamic Sectors Configuration */}
        <div className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-card-border pb-3">
            <div>
              <h2 className="text-lg font-bold text-white">
                Paso 2: Configuración de Sectores y Aforo
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define las zonas del recinto con su cupo numérico y precio en Bolivianos (BOB)
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSector}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-brand/20 hover:bg-brand/30 border border-brand/40 text-brand-light hover:text-white rounded-xl text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agregar Sector</span>
            </button>
          </div>

          <div className="space-y-3">
            {sectors.map((sector, index) => (
              <div
                key={index}
                className="p-4 bg-background/60 border border-card-border rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
              >
                <div className="sm:col-span-5">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Nombre del Sector
                  </label>
                  <input
                    type="text"
                    required
                    value={sector.name}
                    onChange={(e) => handleSectorChange(index, 'name', e.target.value)}
                    placeholder="Ej. VIP, Platea, General"
                    className="w-full px-3 py-2 bg-surface-elevated border border-card-border rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Aforo / Capacidad
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={sector.capacity}
                    onChange={(e) => handleSectorChange(index, 'capacity', e.target.value)}
                    className="w-full px-3 py-2 bg-surface-elevated border border-card-border rounded-lg text-white text-xs focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-medium text-slate-400 mb-1">
                    Precio Unitario (BOB)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={sector.price}
                    onChange={(e) => handleSectorChange(index, 'price', e.target.value)}
                    className="w-full px-3 py-2 bg-surface-elevated border border-card-border rounded-lg text-white text-xs font-mono focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end sm:justify-center pt-2 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveSector(index)}
                    disabled={sectors.length <= 1}
                    className="p-2 text-muted-foreground hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Eliminar sector"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(false)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-card hover:bg-surface-elevated border border-card-border text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Guardar como Borrador</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-brand hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-500 text-white text-sm font-bold rounded-xl shadow-xl shadow-brand/20 transition-all"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Globe className="w-4 h-4" />
            )}
            <span>Guardar y Publicar en Cartelera</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateEventPage;
