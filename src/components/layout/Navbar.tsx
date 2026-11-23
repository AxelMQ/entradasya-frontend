import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Ticket,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Compass,
  QrCode,
  CalendarPlus,
  ShoppingBag,
  Sliders,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  const roleBadgeColor = {
    cliente: 'bg-indigo-950 text-indigo-300 border-indigo-700/50',
    organizador: 'bg-emerald-950 text-emerald-300 border-emerald-700/50',
    portero: 'bg-amber-950 text-amber-300 border-amber-700/50',
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-card-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link
            to="/"
            className="flex items-center space-x-2.5 group focus:outline-none"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand to-indigo-500 flex items-center justify-center shadow-lg shadow-brand/20 group-hover:scale-105 transition-transform">
              <Ticket className="w-5 h-5 text-white transform -rotate-12" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-brand-light transition-colors">
                Entradas<span className="text-brand-light">Ya</span>
              </span>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider -mt-1">
                Ticketing & Access
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                isActive('/')
                  ? 'bg-card text-white border border-card-border'
                  : 'text-muted-foreground hover:text-white hover:bg-card/50'
              }`}
            >
              <Compass className="w-4 h-4 text-brand-light" />
              <span>Cartelera</span>
            </Link>

            {/* Client Links */}
            {isAuthenticated && user?.role === 'cliente' && (
              <>
                <Link
                  to="/my-tickets"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/my-tickets')
                      ? 'bg-card text-white border border-card-border'
                      : 'text-muted-foreground hover:text-white hover:bg-card/50'
                  }`}
                >
                  <Ticket className="w-4 h-4 text-brand-light" />
                  <span>Mis Entradas</span>
                </Link>
                <Link
                  to="/my-orders"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/my-orders')
                      ? 'bg-card text-white border border-card-border'
                      : 'text-muted-foreground hover:text-white hover:bg-card/50'
                  }`}
                >
                  <ShoppingBag className="w-4 h-4 text-brand-light" />
                  <span>Mis Compras</span>
                </Link>
              </>
            )}

            {/* Organizer Links */}
            {isAuthenticated && user?.role === 'organizador' && (
              <>
                <Link
                  to="/organizer/events"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/organizer/events')
                      ? 'bg-card text-white border border-card-border'
                      : 'text-muted-foreground hover:text-white hover:bg-card/50'
                  }`}
                >
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <span>Mis Eventos</span>
                </Link>
                <Link
                  to="/organizer/events/new"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                    isActive('/organizer/events/new')
                      ? 'bg-card text-white border border-card-border'
                      : 'text-muted-foreground hover:text-white hover:bg-card/50'
                  }`}
                >
                  <CalendarPlus className="w-4 h-4 text-emerald-400" />
                  <span>Crear Evento</span>
                </Link>
              </>
            )}

            {/* Porter Links */}
            {isAuthenticated && user?.role === 'portero' && (
              <Link
                to="/checkin"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                  isActive('/checkin')
                    ? 'bg-amber-950/60 text-amber-300 border border-amber-600/50'
                    : 'text-amber-400 hover:text-amber-200 hover:bg-amber-950/30'
                }`}
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Control de Puerta</span>
              </Link>
            )}
          </div>

          {/* User Profile / Auth Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated && user ? (
              <div className="flex items-center space-x-3 pl-3 border-l border-card-border">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-foreground leading-tight">
                    {user.name}
                  </span>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      roleBadgeColor[user.role] || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  title="Cerrar sesión"
                  className="p-2 text-muted-foreground hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-card rounded-xl transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand-hover rounded-xl shadow-lg shadow-brand/20 transition-all hover:scale-[1.02]"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-card focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-card border-b border-card-border px-4 pt-2 pb-5 space-y-2">
          {isAuthenticated && user && (
            <div className="pb-3 border-b border-card-border flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-full bg-surface-elevated flex items-center justify-center text-brand-light">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{user.name}</p>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${
                      roleBadgeColor[user.role]
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-danger font-medium flex items-center space-x-1 p-2 bg-danger/10 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Salir</span>
              </button>
            </div>
          )}

          <div className="space-y-1 pt-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-surface-elevated"
            >
              Cartelera
            </Link>

            {isAuthenticated && user?.role === 'cliente' && (
              <>
                <Link
                  to="/my-tickets"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-surface-elevated"
                >
                  Mis Entradas
                </Link>
                <Link
                  to="/my-orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-surface-elevated"
                >
                  Mis Compras
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'organizador' && (
              <>
                <Link
                  to="/organizer/events"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-surface-elevated"
                >
                  Mis Eventos
                </Link>
                <Link
                  to="/organizer/events/new"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-surface-elevated"
                >
                  + Crear Nuevo Evento
                </Link>
              </>
            )}

            {isAuthenticated && user?.role === 'portero' && (
              <Link
                to="/checkin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40"
              >
                Control de Puerta (Check-in)
              </Link>
            )}

            {!isAuthenticated && (
              <div className="pt-3 border-t border-card-border flex flex-col space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-medium text-slate-200 bg-surface-elevated rounded-xl"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 text-sm font-semibold text-white bg-brand rounded-xl"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
