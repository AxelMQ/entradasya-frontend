import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Verificando credenciales...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-card border border-danger/30 rounded-2xl text-center shadow-2xl">
        <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Acceso Restringido</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Tu cuenta con rol <span className="font-semibold text-brand-light uppercase">{user.role}</span> no cuenta con permisos para acceder a este panel.
        </p>
        <Link
          to="/"
          className="inline-block px-5 py-2.5 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-xl transition-colors"
        >
          Volver a la Cartelera
        </Link>
      </div>
    );
  }

  return children ? <>{children}</> : null;
};

export default RoleGuard;
