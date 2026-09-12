import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContextPlaceholder';
import { Badge } from '../ui';
import { Shield, ShieldAlert, User, LogOut, Compass } from 'lucide-react';

export function RouteSimulatorBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, user, setSimulatedAuth, setSimulatedAdmin, resetSimulatedState, signOutUser } = useAuth();


  const allRoutes = [
    { label: 'PUBLIC: / (Home)', path: '/' },
    { label: 'PUBLIC: /login', path: '/login' },
    { label: 'PUBLIC: /signup', path: '/signup' },
    { label: 'PUBLIC: /forgot-password', path: '/forgot-password' },
    { label: 'PUBLIC: /faq', path: '/faq' },
    { label: 'PUBLIC: /about', path: '/about' },
    { label: 'PUBLIC: /privacy', path: '/privacy' },
    { label: 'PUBLIC: /terms', path: '/terms' },
    { label: 'PUBLIC: /license', path: '/license' },
    { label: 'PUBLIC: /disclaimer', path: '/disclaimer' },
    { label: 'PUBLIC: /contact', path: '/contact' },
    { label: 'APP [AUTH]: /app', path: '/app' },
    { label: 'APP [AUTH]: /app/jobs', path: '/app/jobs' },
    { label: 'APP [AUTH]: /app/jobs/sample-123', path: '/app/jobs/sample-123' },
    { label: 'APP [AUTH]: /app/saved', path: '/app/saved' },
    { label: 'APP [AUTH]: /app/profile', path: '/app/profile' },
    { label: 'APP [AUTH]: /app/settings', path: '/app/settings' },
    { label: 'ADMIN: /admin', path: '/admin' },
    { label: 'ADMIN: /admin/jobs', path: '/admin/jobs' },
    { label: 'ADMIN: /admin/sources', path: '/admin/sources' },
    { label: 'ADMIN: /admin/ingestion', path: '/admin/ingestion' },
    { label: 'ADMIN: /admin/reports', path: '/admin/reports' },
    { label: 'ADMIN: /admin/users', path: '/admin/users' },
  ];

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 px-3 py-1.5 text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 z-50">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-slate-400 font-mono">
          <Compass className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Route:</span>
          <span className="text-slate-100 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
            {location.pathname}
          </span>
        </div>

        {/* Quick Route Selector */}
        <select
          value={location.pathname}
          onChange={(e) => navigate(e.target.value)}
          className="bg-slate-900 border border-slate-700 text-slate-200 text-[11px] rounded px-2 py-0.5 focus:outline-none focus:border-emerald-500 cursor-pointer"
          aria-label="Route Navigator"
        >
          {allRoutes.map((r) => (
            <option key={r.path} value={r.path}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {/* Auth status indicator */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-500 uppercase font-semibold">Auth State:</span>
          {isAdmin ? (
            <Badge variant="purple" size="xs" icon={<Shield className="w-3 h-3" />}>
              Admin Role (Simulated)
            </Badge>
          ) : isAuthenticated ? (
            <Badge variant="success" size="xs" icon={<User className="w-3 h-3" />}>
              Authenticated User (Simulated)
            </Badge>
          ) : (
            <Badge variant="neutral" size="xs" icon={<ShieldAlert className="w-3 h-3" />}>
              Unauthenticated (Guest)
            </Badge>
          )}
        </div>

        {/* State Toggle Buttons for Testing Protected & Admin Boundaries */}
        <div className="flex items-center gap-1">
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => setSimulatedAuth(true)}
              className="px-2 py-0.5 text-[11px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded transition-colors cursor-pointer"
            >
              Sign In
            </button>
          )}
          {!isAdmin && (
            <button
              type="button"
              onClick={() => setSimulatedAdmin(true)}
              className="px-2 py-0.5 text-[11px] bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 border border-violet-500/30 rounded transition-colors cursor-pointer"
            >
              Admin Role
            </button>
          )}
          {(isAuthenticated || isAdmin) && (
            <button
              type="button"
              onClick={() => {
                signOutUser();
              }}
              className="px-2 py-0.5 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded flex items-center gap-1 transition-colors cursor-pointer"
            >
              <LogOut className="w-2.5 h-2.5" />
              Reset to Guest
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
