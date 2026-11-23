import React from 'react';
import { Ticket, ShieldCheck, Zap, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-card/60 border-t border-card-border mt-auto pt-10 pb-8 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                <Ticket className="w-4 h-4 text-white transform -rotate-12" />
              </div>
              <span className="text-lg font-extrabold text-white">
                Entradas<span className="text-brand-light">Ya</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm">
              Plataforma digital para la compra transparente, emisión instantánea y control de acceso seguro para los mejores conciertos, festivales y eventos en vivo.
            </p>
            <div className="flex items-center space-x-4 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center space-x-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DevSecOps Compliant</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-brand-light" />
                <span>Alta Disponibilidad</span>
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">Plataforma</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Cartelera de Eventos</Link>
              </li>
              <li>
                <Link to="/my-tickets" className="hover:text-white transition-colors">Mis Entradas</Link>
              </li>
              <li>
                <Link to="/my-orders" className="hover:text-white transition-colors">Historial de Compras</Link>
              </li>
              <li>
                <Link to="/checkin" className="hover:text-white transition-colors">Portería y Check-in</Link>
              </li>
            </ul>
          </div>

          {/* Test credentials helper */}
          <div>
            <h4 className="text-xs uppercase font-bold text-slate-300 tracking-wider mb-3">Accesos Demo</h4>
            <div className="space-y-1.5 text-xs text-muted-foreground bg-background/50 p-3 rounded-xl border border-card-border">
              <p><span className="text-brand-light font-medium">Cliente:</span> cliente@entradasya.com</p>
              <p><span className="text-emerald-400 font-medium">Organizador:</span> organizador@entradasya.com</p>
              <p><span className="text-amber-400 font-medium">Portero:</span> portero@entradasya.com</p>
              <p className="text-[10px] text-slate-500 pt-1">Pass: Client1234! / Org1234! / Port1234!</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-card-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground space-y-2 sm:space-y-0">
          <p>© {new Date().getFullYear()} EntradasYa. Todos los derechos reservados.</p>
          <p className="flex items-center space-x-1">
            <span>Construido con</span>
            <Heart className="w-3.5 h-3.5 text-danger inline" />
            <span>para experiencias en vivo</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
