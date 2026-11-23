import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import eventsApi from '../../api/events.api';
import { Event } from '../../types';
import {
  Edit,
  ChevronLeft,
  Save,
  AlertCircle,
  Calendar,
  MapPin,
} from 'lucide-react';

export const EditEventPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [venue, setVenue] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const loadEvent = async () => {
      setIsLoading(true);
      try {
        const data = await eventsApi.getEventById(id);
        setTitle(data.title);
        setDescription(data.description || '');
        setVenue(data.venue);
        setImageUrl(data.image_url || '');

        if (data.event_date) {
          const d = new Date(data.event_date);
          const pad = (n: number) => String(n).padStart(2, '0');
          const localIso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
          setEventDate(localIso);
        }
      } catch (err: any) {
        console.error('Error fetching event for edit:', err);
        setErrorMessage('No se pudo cargar el evento para edición.');
      } finally {
        setIsLoading(false);
      }
    };
    loadEvent();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const formattedDate = new Date(eventDate).toISOString();
      await eventsApi.updateEvent(id, {
        title: title.trim(),
        description: description.trim(),
        venue: venue.trim(),
        event_date: formattedDate,
        image_url: imageUrl.trim(),
      });

      navigate('/organizer/events');
    } catch (err: any) {
      console.error('Error updating event:', err);
      setErrorMessage(err.response?.data?.message || 'Error al actualizar el evento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Cargando datos del evento...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Navigation back */}
      <div className="mb-6">
        <Link
          to="/organizer/events"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver a Mis Eventos</span>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <Edit className="w-7 h-7 text-emerald-400" />
          <span>Editar Información del Evento</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Actualiza los datos informativos, afiche o recinto del evento.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-8 p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
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
                Recinto / Dirección *
              </label>
              <input
                type="text"
                required
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              URL de Imagen / Afiche
            </label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Descripción del Evento
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-card-border flex justify-end space-x-3">
          <Link
            to="/organizer/events"
            className="px-5 py-2.5 bg-surface-elevated hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEventPage;
