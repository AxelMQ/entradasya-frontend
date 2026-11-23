import React, { useEffect, useRef, useState } from 'react';
import eventsApi from '../../api/events.api';
import checkinApi from '../../api/checkin.api';
import { Event, CheckinScanResult, CheckinHistoryItem } from '../../types';
import { Html5Qrcode } from 'html5-qrcode';
import {
  QrCode,
  Camera,
  CheckCircle,
  XCircle,
  Users,
  Search,
  RefreshCw,
  AlertTriangle,
  History,
  Volume2,
} from 'lucide-react';

export const CheckinScannerPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [totalCheckedIn, setTotalCheckedIn] = useState<number>(0);
  const [recentScans, setRecentScans] = useState<CheckinHistoryItem[]>([]);

  // Camera state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrScannerRef = useRef<Html5Qrcode | null>(null);

  // Manual fallback input
  const [manualCode, setManualCode] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Semáforo Gigante Modal / Overlay y Bloqueo de Escaneo Continuo
  const [verdict, setVerdict] = useState<CheckinScanResult | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const autoCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Referencias mutables para evitar trampas de clausura en el callback de html5-qrcode
  const isScanningLockedRef = useRef<boolean>(false);
  const lastScannedCodeRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);
  const selectedEventIdRef = useRef<string>(selectedEventId);

  // Mantener selectedEventIdRef sincronizado
  useEffect(() => {
    selectedEventIdRef.current = selectedEventId;
  }, [selectedEventId]);

  // Load events for dropdown
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const list = await eventsApi.getEvents();
        setEvents(list);
        if (list.length > 0) {
          setSelectedEventId(list[0].id);
        }
      } catch (err) {
        console.error('Error loading events for checkin:', err);
      }
    };
    loadEvents();
  }, []);

  // When selected event changes, update live stats and history
  const loadEventStatsAndHistory = async (eventId: string) => {
    if (!eventId) return;
    try {
      const stats = await checkinApi.getEventStats(eventId);
      setTotalCheckedIn(stats.total_checked_in || 0);

      const history = await checkinApi.getEventHistory(eventId);
      setRecentScans(history);
    } catch (err) {
      console.warn('Could not load checkin stats or history:', err);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      loadEventStatsAndHistory(selectedEventId);
    }
  }, [selectedEventId]);

  // Audio tone feedback
  const playSound = (type: 'ACCEPTED' | 'REJECTED') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'ACCEPTED') {
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880.0, ctx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220.0, ctx.currentTime); // A3
        osc.frequency.setValueAtTime(164.81, ctx.currentTime + 0.15); // E3
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.45);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.45);
      }
    } catch {
      // AudioContext not allowed or not supported, ignore silently
    }
  };

  // Cerrar overlay y reanudar el escáner con cooldown de protección
  const handleDismissVerdict = () => {
    if (autoCloseTimerRef.current) {
      clearTimeout(autoCloseTimerRef.current);
      autoCloseTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }

    setVerdict(null);
    setCountdown(0);

    // Reanudar cámara si está activa
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        qrScannerRef.current.resume();
      } catch (err) {
        console.warn('Error al reanudar cámara:', err);
      }
    }

    // Cooldown de gracia de 1.2s para evitar re-lectura inmediata del mismo boleto físico
    setTimeout(() => {
      isScanningLockedRef.current = false;
      lastScannedCodeRef.current = '';
    }, 1200);
  };

  // Process ticket scan code
  const handleVerifyCode = async (ticketCode: string) => {
    const cleanCode = ticketCode.trim();
    const currentEventId = selectedEventIdRef.current || selectedEventId;
    if (!cleanCode || !currentEventId) return;

    // Bloquear inmediatamente el escáner para evitar lecturas concurrentes o bucles
    isScanningLockedRef.current = true;
    lastScannedCodeRef.current = cleanCode;
    lastScanTimeRef.current = Date.now();

    // Pausar procesamiento de video de la cámara de inmediato
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        qrScannerRef.current.pause(true);
      } catch (e) {
        console.warn('Error al pausar cámara:', e);
      }
    }

    setIsProcessing(true);
    setCameraError(null);

    try {
      const result = await checkinApi.scanTicket({
        ticket_code: cleanCode,
        event_id: currentEventId,
      });

      setVerdict(result);
      playSound(result.result);

      // Refresh counters and history
      loadEventStatsAndHistory(currentEventId);

      // Limpiar temporizadores anteriores
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

      // Si es aceptado, mantener bloqueo y cuenta regresiva visible de 4 segundos
      if (result.result === 'ACCEPTED') {
        let remaining = 4;
        setCountdown(remaining);
        countdownIntervalRef.current = setInterval(() => {
          remaining -= 1;
          setCountdown(remaining);
          if (remaining <= 0) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            handleDismissVerdict();
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error('Scan error:', err);
      const fallbackResult: CheckinScanResult = {
        result: 'REJECTED',
        reason: 'ERROR_CONEXION',
        message: 'No se pudo validar el boleto con el servidor.',
      };
      setVerdict(fallbackResult);
      playSound('REJECTED');
    } finally {
      setIsProcessing(false);
      setManualCode('');
    }
  };

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode('qr-reader-container');
      }

      await qrScannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          const now = Date.now();
          // Bloqueo estricto contra escaneos continuos o concurrentes
          if (isScanningLockedRef.current) return;
          if (
            decodedText === lastScannedCodeRef.current &&
            now - lastScanTimeRef.current < 4000
          ) {
            return;
          }

          handleVerifyCode(decodedText);
        },
        () => {
          // Frame read ignore
        }
      );
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start failed or permission denied:', err);
      setCameraError('No se pudo acceder a la cámara. Usa el campo manual o verifica permisos.');
      setIsCameraActive(false);
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    isScanningLockedRef.current = false;
    lastScannedCodeRef.current = '';
    if (qrScannerRef.current && qrScannerRef.current.isScanning) {
      try {
        await qrScannerRef.current.stop();
        qrScannerRef.current.clear();
      } catch (err) {
        console.warn('Error stopping camera:', err);
      }
    }
    setIsCameraActive(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoCloseTimerRef.current) clearTimeout(autoCloseTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (qrScannerRef.current && qrScannerRef.current.isScanning) {
        qrScannerRef.current.stop().catch(() => {}).finally(() => {
          qrScannerRef.current?.clear();
        });
      }
    };
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleVerifyCode(manualCode);
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      {/* SEMÁFORO GIGANTE A PANTALLA COMPLETA */}
      {verdict && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer animate-in fade-in zoom-in duration-150 ${
            verdict.result === 'ACCEPTED'
              ? 'bg-emerald-600 text-white'
              : 'bg-red-600 text-white'
          }`}
          onClick={handleDismissVerdict}
        >
          {/* Big Verdict Icon */}
          <div className="mb-4">
            {verdict.result === 'ACCEPTED' ? (
              <CheckCircle className="w-28 h-28 sm:w-36 sm:h-36 mx-auto animate-bounce drop-shadow-lg" />
            ) : (
              <XCircle className="w-28 h-28 sm:w-36 sm:h-36 mx-auto animate-pulse drop-shadow-lg" />
            )}
          </div>

          {/* Verdict Title */}
          <h1 className="text-3xl sm:text-[44px] font-black uppercase tracking-tight leading-tight mb-2 drop-shadow">
            {verdict.result === 'ACCEPTED' ? '¡INGRESO PERMITIDO!' : 'ACCESO DENEGADO'}
          </h1>

          {/* Huge Sector or Rejection Reason */}
          {verdict.result === 'ACCEPTED' ? (
            <div className="my-4 space-y-3 max-w-md w-full">
              <div className="px-6 py-4 rounded-2xl bg-white/20 backdrop-blur-md inline-block border border-white/30 w-full shadow-lg">
                <span className="block text-xs uppercase font-extrabold tracking-widest text-emerald-100 mb-1">
                  Sector de Acceso
                </span>
                <span className="text-4xl sm:text-6xl font-black uppercase tracking-tight block">
                  {verdict.sector_name || 'GENERAL'}
                </span>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-xl p-3 border border-white/10 space-y-1">
                <p className="text-lg sm:text-xl font-bold text-white">
                  {verdict.customer_name || 'Titular de la Entrada'}
                </p>
                <p className="font-mono text-xs opacity-90 tracking-wider">
                  Código: {verdict.ticket_code}
                </p>
              </div>
            </div>
          ) : (
            <div className="my-6 max-w-lg space-y-3 w-full">
              <div className="p-5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-xl">
                <span className="block text-xs uppercase font-bold text-red-200 tracking-wider mb-2">
                  Motivo de Rechazo
                </span>
                <p className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white leading-snug">
                  {verdict.reason === 'ALREADY_USED'
                    ? `ENTRADA YA UTILIZADA ${
                        verdict.first_used_at
                          ? `A LAS ${new Date(verdict.first_used_at).toLocaleTimeString('es-ES')}`
                          : ''
                      } ${verdict.first_porter ? `(${verdict.first_porter})` : ''}`
                    : verdict.reason === 'EVENT_MISMATCH'
                    ? 'ENTRADA PERTENECE A OTRO EVENTO'
                    : verdict.reason === 'INVALID_CODE'
                    ? 'CÓDIGO INEXISTENTE / INVÁLIDO'
                    : verdict.message || 'ENTRADA NO AUTORIZADA'}
                </p>
              </div>
              {verdict.ticket_code && (
                <p className="font-mono text-xs opacity-90">Código escaneado: {verdict.ticket_code}</p>
              )}
            </div>
          )}

          {/* Dismiss CTA */}
          <div className="mt-6 flex flex-col items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleDismissVerdict}
              className="px-8 py-4 bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-base sm:text-lg rounded-2xl shadow-2xl transition-transform active:scale-95 flex items-center space-x-2"
            >
              <span>Escanear Siguiente Entrada</span>
              {verdict.result === 'ACCEPTED' && countdown > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                  {countdown}s
                </span>
              )}
            </button>
            <span className="text-[11px] opacity-75">o toca cualquier parte de la pantalla</span>
          </div>
        </div>
      )}

      {/* Normal Screen Header */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between pb-4 border-b border-card-border">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Portería y Control de Acceso</h1>
              <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
                Modo Escáner Móvil Ultrarrápido
              </span>
            </div>
          </div>

          {/* Audio on indicator */}
          <div className="flex items-center space-x-1 text-xs text-muted-foreground bg-card px-2.5 py-1 rounded-lg border border-card-border">
            <Volume2 className="w-3.5 h-3.5 text-brand-light" />
            <span>Audio ON</span>
          </div>
        </div>

        {/* Event Selector & Live Counter Top Bar */}
        <div className="bg-card border border-card-border rounded-2xl p-4 space-y-3 shadow-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Seleccionar Evento en Puerta:
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2.5 bg-background border border-card-border rounded-xl text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.title} ({ev.venue})
                </option>
              ))}
            </select>
          </div>

          {/* Live attendee counter */}
          <div className="p-3 bg-amber-950/30 border border-amber-600/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>Total Ingresados en Puerta:</span>
            </div>
            <span className="text-2xl font-black text-amber-400 font-mono">
              {totalCheckedIn} personas
            </span>
          </div>
        </div>
      </div>

      {/* QR Camera Reader Box */}
      <div className="bg-card border border-card-border rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 mb-6 text-center">
        <div className="flex items-center justify-between pb-3 border-b border-card-border">
          <span className="text-xs uppercase font-extrabold text-white tracking-wider flex items-center space-x-1.5">
            <Camera className="w-4 h-4 text-brand-light" />
            <span>Lector de Cámara QR</span>
          </span>

          <button
            onClick={isCameraActive ? stopCamera : startCamera}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              isCameraActive
                ? 'bg-danger/20 text-danger border border-danger/40 hover:bg-danger/30'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/20'
            }`}
          >
            {isCameraActive ? 'Detener Cámara' : 'Activar Cámara'}
          </button>
        </div>

        {cameraError && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-warning text-xs flex items-center space-x-2 text-left">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Viewfinder container */}
        <div className="relative w-full aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-black border-2 border-slate-700 flex flex-col items-center justify-center">
          <div id="qr-reader-container" className="w-full h-full" />

          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 space-y-3">
              <QrCode className="w-16 h-16 text-slate-700 animate-pulse" />
              <p className="text-xs text-muted-foreground text-center">
                Presiona "Activar Cámara" para enfocar los códigos QR de los boletos.
              </p>
              <button
                onClick={startCamera}
                className="px-4 py-2 bg-brand text-white text-xs font-bold rounded-xl shadow-lg"
              >
                Encender Cámara
              </button>
            </div>
          )}

          {/* Animated laser line when camera active */}
          {isCameraActive && (
            <div className="pointer-events-none absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-scan-laser" />
          )}
        </div>
      </div>

      {/* Manual Fallback Field */}
      <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xl space-y-3 mb-6">
        <span className="text-xs font-bold text-white uppercase tracking-wider block">
          Entrada Manual de Respaldo
        </span>
        <p className="text-xs text-muted-foreground">
          Si la pantalla del celular está rota o el código QR está deteriorado, escribe el código alfanumérico:
        </p>

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value.toUpperCase())}
            placeholder="Ej. EY-ROCK-8X4N2Q"
            className="flex-1 px-4 py-2.5 bg-background border border-card-border rounded-xl text-white font-mono text-xs uppercase focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <button
            type="submit"
            disabled={!manualCode.trim() || isProcessing}
            className="px-4 py-2.5 bg-brand hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center space-x-1"
          >
            {isProcessing ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Verificar</span>
          </button>
        </form>
      </div>

      {/* Recent Scans History */}
      <div className="bg-card border border-card-border rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-card-border">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
            <History className="w-3.5 h-3.5 text-brand-light" />
            <span>Últimos Escaneos en Puerta</span>
          </span>
          <button
            onClick={() => selectedEventId && loadEventStatsAndHistory(selectedEventId)}
            className="text-[11px] text-muted-foreground hover:text-white flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Recargar</span>
          </button>
        </div>

        {recentScans.length > 0 ? (
          <div className="space-y-2">
            {recentScans.slice(0, 5).map((scan) => (
              <div
                key={scan.id}
                className="p-2.5 bg-background/50 rounded-xl border border-card-border flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-white">{scan.ticket_code}</span>
                    <span className="text-muted-foreground">
                      {scan.customer_name || 'Asistente'}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(scan.checked_in_at).toLocaleTimeString('es-ES')} - Sector:{' '}
                    {scan.sector_name || 'General'}
                  </span>
                </div>

                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    scan.status === 'ACCEPTED'
                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-700/50'
                      : 'bg-danger/20 text-danger border border-danger/40'
                  }`}
                >
                  {scan.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic text-center py-3">
            Aún no hay escaneos registrados para este espectáculo.
          </p>
        )}
      </div>
    </div>
  );
};

export default CheckinScannerPage;
