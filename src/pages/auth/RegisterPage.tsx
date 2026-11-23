import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Ticket, Lock, Mail, User, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password requirements calculation
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasNumber;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err: any) {
      console.error('Registration error:', err);
      const serverMsg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Error al crear la cuenta. Verifica que el correo no esté ya registrado.';
      setErrorMessage(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-card border border-card-border p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center space-x-2 group">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 text-white transform -rotate-12" />
            </div>
            <span className="text-2xl font-black text-white">
              Entradas<span className="text-brand-light">Ya</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-white tracking-tight pt-2">Crear Cuenta de Cliente</h2>
          <p className="text-xs text-muted-foreground">
            Regístrate en segundos para asegurar tus entradas a los mejores eventos en vivo.
          </p>
        </div>

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
              Nombre Completo *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan Pérez"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <User className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Correo Electrónico *
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Mail className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Contraseña *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-card-border rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-brand"
              />
              <Lock className="w-4 h-4 text-muted-foreground absolute left-3.5 top-3 pointer-events-none" />
            </div>

            {/* Password strength checklist */}
            <div className="mt-2 space-y-1 text-[11px] text-muted-foreground bg-background/50 p-2.5 rounded-lg border border-card-border">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-600'}`}
                />
                <span className={hasMinLength ? 'text-slate-200' : ''}>Al menos 8 caracteres</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${hasUpperCase ? 'text-emerald-400' : 'text-slate-600'}`}
                />
                <span className={hasUpperCase ? 'text-slate-200' : ''}>Al menos una letra mayúscula</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <CheckCircle2
                  className={`w-3.5 h-3.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-600'}`}
                />
                <span className={hasNumber ? 'text-slate-200' : ''}>Al menos un número</span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !isPasswordValid}
            className="w-full py-3 px-4 bg-brand hover:bg-brand-hover disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center space-x-2 pt-2.5"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Crear Cuenta Gratis</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center text-xs text-muted-foreground pt-2 border-t border-card-border">
          <span>¿Ya tienes una cuenta registrada? </span>
          <Link to="/login" className="text-brand-light hover:underline font-bold">
            Inicia sesión aquí
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
