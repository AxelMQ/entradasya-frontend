import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Ticket, Lock, Mail, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState<string>('cliente@entradasya.com');
  const [password, setPassword] = useState<string>('Client1234!');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isExpired = searchParams.get('expired') === 'true';

  const redirectByRole = (role: string, targetPath?: string) => {
    if (targetPath && targetPath !== '/login') {
      navigate(targetPath, { replace: true });
      return;
    }
    if (role === 'organizador') {
      navigate('/organizer/events', { replace: true });
    } else if (role === 'portero') {
      navigate('/checkin', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const loggedUser = await login({ email: email.trim(), password });
      const targetFrom = (location.state as any)?.from?.pathname || (location.state as any)?.from;
      redirectByRole(loggedUser.role, targetFrom);
    } catch (err: any) {
      console.error('Login error:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Correo electrónico o contraseña incorrectos.';
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-card border border-card-border p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/10 rounded-full blur-2xl pointer-events-none" />

        {/* Logo and title */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 text-white transform -rotate-12" />
            </div>
            <span className="text-2xl font-black text-white">
              Entradas<span className="text-brand-light">Ya</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight pt-2">Iniciar Sesión</h2>
          <p className="text-xs text-muted-foreground">
            Accede a tu cuenta para comprar entradas, ver boletos o gestionar accesos.
          </p>
        </div>

        {isExpired && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-xl text-warning text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Tu sesión ha expirado. Por favor ingresa nuevamente.</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs flex items-center space-x-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-brand hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center space-x-2 pt-2.5"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Ingresar al Sistema</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Demo Buttons */}
        <div className="pt-4 border-t border-card-border space-y-2">
          <span className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
            Cuentas Demo para Evaluación Rápida:
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleFillDemo('cliente@entradasya.com', 'Client1234!')}
              className="py-1.5 px-2 bg-indigo-950/60 hover:bg-indigo-900 border border-indigo-700/50 rounded-lg text-indigo-300 font-medium text-center transition-colors"
            >
              Cliente
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('organizador@entradasya.com', 'Org1234!')}
              className="py-1.5 px-2 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 rounded-lg text-emerald-300 font-medium text-center transition-colors"
            >
              Organizador
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo('portero@entradasya.com', 'Port1234!')}
              className="py-1.5 px-2 bg-amber-950/60 hover:bg-amber-900 border border-amber-700/50 rounded-lg text-amber-300 font-medium text-center transition-colors"
            >
              Portero
            </button>
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center text-xs text-muted-foreground pt-1">
          <span>¿No tienes una cuenta aún? </span>
          <Link to="/register" className="text-brand-light hover:underline font-bold">
            Regístrate aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
