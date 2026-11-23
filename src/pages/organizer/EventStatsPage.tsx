import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventsApi from '../../api/events.api';
import ordersApi from '../../api/orders.api';
import { Event, EventSalesReport } from '../../types';
import {
  TrendingUp,
  DollarSign,
  Ticket,
  Users,
  ChevronLeft,
  Calendar,
  MapPin,
  AlertCircle,
  RefreshCw,
  PieChart,
} from 'lucide-react';

export const EventStatsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [salesReport, setSalesReport] = useState<EventSalesReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const eventData = await eventsApi.getEventById(id);
      setEvent(eventData);

      try {
        const salesData = await ordersApi.getSalesByEvent(id);
        setSalesReport(salesData);
      } catch (salesErr) {
        console.warn('Could not fetch sales report directly from ms-orders:', salesErr);
      }
    } catch (err: any) {
      console.error('Error fetching event statistics:', err);
      setError('No se pudieron cargar las estadísticas del evento.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground animate-pulse">Calculando métricas de ventas y aforo...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-card border border-card-border rounded-2xl text-center">
        <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Evento no encontrado</h2>
        <p className="text-sm text-muted-foreground mb-6">{error || 'No se pudieron recuperar las métricas.'}</p>
        <Link to="/organizer/events" className="px-5 py-2.5 bg-brand text-white text-sm font-semibold rounded-xl">
          Volver a Mis Eventos
        </Link>
      </div>
    );
  }

  // Calculate totals from event sectors or salesReport
  const totalCapacity = event.sectors?.reduce((acc, s) => acc + (s.capacity || 0), 0) || 0;
  const availableSpots = event.sectors?.reduce((acc, s) => acc + (s.available_spots || 0), 0) || 0;
  const computedSold = salesReport?.total_tickets_sold !== undefined ? salesReport.total_tickets_sold : Math.max(0, totalCapacity - availableSpots);
  const computedRevenue = salesReport?.total_revenue !== undefined ? Number(salesReport.total_revenue) : (
    event.sectors?.reduce((acc, s) => {
      const soldSector = Math.max(0, s.capacity - s.available_spots);
      return acc + (soldSector * Number(s.price));
    }, 0) || 0
  );

  const percentOccupancy = totalCapacity > 0 ? Math.round((computedSold / totalCapacity) * 100) : 0;

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Navigation back */}
      <div className="mb-6">
        <Link
          to="/organizer/events"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Volver al Panel del Productor</span>
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-card-border gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-brand-light">
            Dashboard de Rendimiento Financiero
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            {event.title}
          </h1>
          <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-2">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-brand-light" />
              <span>{event.venue}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-brand-light" />
              <span>{new Date(event.event_date).toLocaleString('es-ES')}</span>
            </span>
          </div>
        </div>

        <button
          onClick={fetchStats}
          className="self-start sm:self-auto flex items-center space-x-1.5 px-3.5 py-2 bg-card border border-card-border rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-surface-elevated transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Actualizar Datos</span>
        </button>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Recaudación Total */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Recaudación Total
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-700/50 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">
            BOB {computedRevenue.toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 inline-block">
            Ingresos netos por venta de boletos
          </span>
        </div>

        {/* Boletos Vendidos */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Boletos Vendidos
            </span>
            <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand-light border border-brand/30 flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">
            {computedSold} <span className="text-lg text-muted-foreground font-normal">/ {totalCapacity}</span>
          </p>
          <div className="mt-3">
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, percentOccupancy)}%` }}
              />
            </div>
            <span className="text-[11px] text-brand-light font-bold mt-1 inline-block">
              {percentOccupancy}% del aforo total colocado
            </span>
          </div>
        </div>

        {/* Cupos Restantes */}
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Cupos Disponibles
            </span>
            <div className="w-10 h-10 rounded-xl bg-surface-elevated text-slate-300 border border-card-border flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white">
            {availableSpots}
          </p>
          <span className="text-[11px] text-muted-foreground font-medium mt-1 inline-block">
            Entradas aún disponibles para el público
          </span>
        </div>
      </div>

      {/* Breakdown by Sector Table */}
      <div className="bg-card border border-card-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-card-border pb-4">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-brand-light" />
            <h2 className="text-lg font-bold text-white">Desglose Detallado por Sector</h2>
          </div>
          <span className="text-xs text-muted-foreground">
            {event.sectors?.length || 0} sectores
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-card-border text-muted-foreground uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4">Precio Unitario</th>
                <th className="py-3 px-4 text-center">Capacidad Total</th>
                <th className="py-3 px-4 text-center">Vendidos</th>
                <th className="py-3 px-4 text-center">Disponibles</th>
                <th className="py-3 px-4 text-center">% Ocupación</th>
                <th className="py-3 px-4 text-right">Recaudación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border/60">
              {event.sectors && event.sectors.length > 0 ? (
                event.sectors.map((sector) => {
                  const matchingSales = salesReport?.sectors?.find((s) => s.sector_id === sector.id);
                  const soldCount = matchingSales ? matchingSales.tickets_sold : Math.max(0, sector.capacity - sector.available_spots);
                  const secRevenue = matchingSales ? Number(matchingSales.revenue) : soldCount * Number(sector.price);
                  const secPercent = sector.capacity > 0 ? Math.round((soldCount / sector.capacity) * 100) : 0;

                  return (
                    <tr key={sector.id} className="hover:bg-surface-elevated/30 transition-colors">
                      <td className="py-4 px-4 font-bold text-white">
                        {sector.name}
                      </td>
                      <td className="py-4 px-4 font-mono text-slate-300">
                        BOB {Number(sector.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center text-slate-300">
                        {sector.capacity}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-white">
                        {soldCount}
                      </td>
                      <td className="py-4 px-4 text-center text-muted-foreground">
                        {sector.available_spots}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold ${
                          secPercent >= 90
                            ? 'bg-danger/20 text-danger'
                            : secPercent >= 50
                            ? 'bg-brand/20 text-brand-light'
                            : 'bg-surface-elevated text-slate-300'
                        }`}>
                          {secPercent}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-extrabold text-white font-mono">
                        BOB {secRevenue.toFixed(2)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-muted-foreground italic">
                    No hay sectores configurados para este evento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EventStatsPage;
