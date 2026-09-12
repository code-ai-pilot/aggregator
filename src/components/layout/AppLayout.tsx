import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { Container, Badge, Button } from '../ui';
import {
  Briefcase,
  Bookmark,
  User,
  Settings,
  LayoutDashboard,
  LogOut,
  Shield,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { useAuth } from '../routing/AuthContextPlaceholder';

export function AppLayout() {
  const { user, signOutUser } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOutUser();
    navigate('/login');
  };


  const appNavLinks = [
    { to: '/app', label: 'Overview', icon: <LayoutDashboard className="w-3.5 h-3.5" />, end: true },
    { to: '/app/jobs', label: 'Job Feed', icon: <Briefcase className="w-3.5 h-3.5" /> },
    { to: '/app/saved', label: 'Saved Jobs', icon: <Bookmark className="w-3.5 h-3.5" /> },
    { to: '/app/profile', label: 'Profile', icon: <User className="w-3.5 h-3.5" /> },
    { to: '/app/settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans antialiased">
      {/* App Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/90 px-4 sm:px-6 py-3 backdrop-blur-md sticky top-0 z-40">
        <Container size="xl" className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/app" className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                AI
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-slate-100">
                  WFH AI Jobs
                </span>
                <Badge variant="success" size="xs">
                  Authenticated App
                </Badge>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-800" aria-label="App Navigation">
              {appNavLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-3 py-1.5 text-xs font-medium rounded-md flex items-center gap-1.5 transition-colors ${
                      isActive
                        ? 'bg-slate-800 text-emerald-400 font-semibold'
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

            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-medium text-slate-200 leading-tight">
                  {user?.displayName || 'Job Seeker'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {user?.email || 'user@example.com'}
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

      {/* Mobile Nav Bar */}
      <div className="md:hidden border-b border-slate-800 bg-slate-950 px-4 py-2 overflow-x-auto flex items-center gap-1">
        {appNavLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `px-2.5 py-1 text-xs font-medium rounded-md flex items-center gap-1 whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 font-semibold'
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

      {/* App Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-4 px-4 sm:px-6 text-xs text-slate-500">
        <Container size="xl" className="flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>WFH AI Jobs Portal &bull; Authenticated Route Boundary Active</span>
          <div className="flex items-center gap-3">
            <Link to="/app/jobs" className="hover:text-slate-300">Jobs</Link>
            <Link to="/app/saved" className="hover:text-slate-300">Saved</Link>
            <Link to="/app/profile" className="hover:text-slate-300">Profile</Link>
            <Link to="/app/settings" className="hover:text-slate-300">Settings</Link>
          </div>
        </Container>
      </footer>
    </div>
  );
}
