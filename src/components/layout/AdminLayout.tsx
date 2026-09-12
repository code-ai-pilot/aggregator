import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { Container, Badge, Button } from '../ui';
import {
  Shield,
  Briefcase,
  Database,
  Activity,
  AlertTriangle,
  Users,
  LogOut,
  ArrowLeft,
  LayoutDashboard,
} from 'lucide-react';
import { useAuth } from '../routing/AuthContextPlaceholder';

export function AdminLayout() {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/login');
  };


  const adminNavLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" />, end: true },
    { to: '/admin/jobs', label: 'Manage Jobs', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { to: '/admin/sources', label: 'Job Sources', icon: <Database className="w-3.5 h-3.5" /> },
    { to: '/admin/ingestion', label: 'Ingestion Pipeline', icon: <Activity className="w-3.5 h-3.5" /> },
    { to: '/admin/reports', label: 'Reports & Flagged', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { to: '/admin/users', label: 'Users & Roles', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans antialiased">
      {/* Admin Header */}
      <header className="border-b border-violet-900/40 bg-slate-950/95 px-4 sm:px-6 py-3 backdrop-blur-md sticky top-0 z-40">
        <Container size="xl" className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/admin" className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-slate-100">
                  WFH AI Admin Console
                </span>
                <Badge variant="purple" size="xs">
                  Admin Authorization Active
                </Badge>
              </div>
            </Link>

            {/* Admin Nav links */}
            <nav className="hidden lg:flex items-center space-x-1 pl-4 border-l border-slate-800" aria-label="Admin Navigation">
              {adminNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-violet-950/60 text-violet-300 font-semibold border border-violet-800/60'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                    }`
                  }
                >
                  {link.icon}
                  <span>{link.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <Link to="/" className="text-xs text-slate-400 hover:text-slate-200 hidden sm:inline-flex items-center gap-1 px-2.5 py-1">
              <ArrowLeft className="w-3 h-3" />
              Public Site
            </Link>
            <Link to="/app" className="text-xs text-emerald-400 hover:text-emerald-300 hidden sm:inline-flex items-center gap-1 px-2.5 py-1">
              App Portal
            </Link>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-medium text-violet-200 leading-tight">
                  {user?.displayName || 'Administrator'}
                </div>
                <div className="text-[10px] text-violet-400/80">
                  {user?.email || 'admin@wfh-ai-jobs.internal'}
                </div>
              </div>

              <Button
                variant="outline"
                size="xs"
                onClick={handleSignOut}
                leftIcon={<LogOut className="w-3 h-3 text-rose-400" />}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Container>
      </header>

      {/* Mobile / Tablet Admin Nav Bar */}
      <div className="lg:hidden border-b border-slate-800 bg-slate-950 px-4 py-2 overflow-x-auto flex items-center gap-1">
        {adminNavLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 whitespace-nowrap ${
                isActive
                  ? 'bg-violet-950/60 text-violet-300 font-semibold border border-violet-800/60'
                  : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 py-8">
        <Container size="xl">
          <Outlet />
        </Container>
      </main>

      {/* Admin Footer */}
      <footer className="border-t border-violet-900/30 bg-slate-950/90 py-4 px-4 sm:px-6 text-xs text-slate-500">
        <Container size="xl" className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WFH AI Admin Console &bull; Authorization Gate: ADMIN_ROLE_REQUIRED</span>
          <div className="flex items-center gap-3">
            <Link to="/admin/jobs" className="hover:text-slate-300">Jobs</Link>
            <Link to="/admin/sources" className="hover:text-slate-300">Sources</Link>
            <Link to="/admin/ingestion" className="hover:text-slate-300">Ingestion</Link>
            <Link to="/admin/reports" className="hover:text-slate-300">Reports</Link>
            <Link to="/admin/users" className="hover:text-slate-300">Users</Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
