import React, { useState } from 'react';
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { Container, Badge, Button } from '../ui';
import {
  Briefcase,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  FileText,
  UserCheck,
  Shield,
  Menu,
  X,
  ExternalLink,
  Info,
  AlertTriangle,
  Mail,
  Scale
} from 'lucide-react';
import { useAuth } from '../routing/AuthContextPlaceholder';

export function PublicLayout() {
  const { isAuthenticated, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About' },
    { to: '/faq', label: 'FAQ' },
    { to: '/disclaimer', label: 'Disclaimer' },
    { to: '/contact', label: 'Contact' },
  ];

  const legalLinks = [
    { to: '/about', label: 'About Us' },
    { to: '/faq', label: 'FAQ' },
    { to: '/disclaimer', label: 'Disclaimer' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms of Service' },
    { to: '/license', label: 'License & Attribution' },
    { to: '/contact', label: 'Contact & Inquiries' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Global Transparency Notice Bar */}
      <div className="bg-slate-950/90 border-b border-slate-800/80 px-4 py-1.5 text-center text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-1 font-medium text-slate-300">
            <Info className="w-3 h-3 text-emerald-400 shrink-0" />
            Independent Job Discovery Service:
          </span>
          <span>We aggregate authentic remote AI roles; applications are completed directly on external source platforms.</span>
          <Link to="/disclaimer" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 ml-1">
            Read Disclaimers
          </Link>
        </div>
      </div>

      {/* Public Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 px-4 sm:px-6 py-3 backdrop-blur-md sticky top-0 z-40">
        <Container size="xl" className="flex items-center justify-between">
          {/* Logo & Brand */}
          <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-3 group">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-sm group-hover:bg-emerald-500/20 transition-colors">
              <Briefcase className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold tracking-tight text-slate-100 group-hover:text-emerald-300 transition-colors">
                  WFH AI Jobs
                </span>
                <Badge variant="category" size="xs">
                  Directory
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Remote AI training, annotation &amp; evaluation opportunities
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/50'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Right Action buttons & Mobile Hamburger */}
          <div className="flex items-center gap-2">
            <Link to="/contact" className="hidden sm:inline-flex">
              <Button variant="ghost" size="xs" leftIcon={<Mail className="w-3.5 h-3.5" />}>
                Help &amp; Contact
              </Button>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link to="/app">
                  <Button variant="primary" size="xs" rightIcon={<ArrowRight className="w-3 h-3" />}>
                    App Portal
                  </Button>
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="hidden sm:inline-flex">
                    <Button variant="outline" size="xs">
                      Admin
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="secondary" size="xs">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="xs">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile menu trigger */}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 focus:outline-none ml-1"
              aria-label={mobileMenuOpen ? 'Close Menu' : 'Open Menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </Container>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 px-2 border-t border-slate-800 mt-2 space-y-1 bg-slate-950/95 rounded-lg shadow-xl">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  `block px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-emerald-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-slate-100'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <div className="pt-2 border-t border-slate-800/60 grid grid-cols-2 gap-2 px-2">
              <Link to="/privacy" onClick={closeMobileMenu} className="text-[11px] text-slate-400 hover:text-slate-200 py-1">
                Privacy Policy
              </Link>
              <Link to="/terms" onClick={closeMobileMenu} className="text-[11px] text-slate-400 hover:text-slate-200 py-1">
                Terms of Service
              </Link>
              <Link to="/license" onClick={closeMobileMenu} className="text-[11px] text-slate-400 hover:text-slate-200 py-1">
                License &amp; Credits
              </Link>
              <Link to="/disclaimer" onClick={closeMobileMenu} className="text-[11px] text-slate-400 hover:text-slate-200 py-1">
                Full Disclaimer
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 md:py-10">
        <Container size="xl">
          <Outlet />
        </Container>
      </main>

      {/* Public Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 sm:px-6 text-slate-400">
        <Container size="xl" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
            {/* Column 1: Brand & Purpose */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  AI
                </div>
                <span className="font-semibold text-slate-200 text-sm">WFH AI Jobs Aggregator</span>
                <Badge variant="category" size="xs">Discovery Service</Badge>
              </div>
              <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
                An independent public directory aggregating remote work-from-home opportunities in artificial intelligence training, RLHF model evaluation, data annotation, search relevance, and multimodal data verification.
              </p>
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800/90 text-[11px] text-slate-400 leading-relaxed">
                <strong className="text-slate-300 block mb-0.5">Statutory &amp; Operational Notice:</strong>
                WFH AI Jobs Aggregator is a search and discovery index. We are not an employer, recruitment agency, or staffing firm. All applications and hiring assessments take place directly on third-party source websites.
              </div>
            </div>

            {/* Column 2: Information & Guides */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Explore &amp; Learn</h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link to="/" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Home / Overview
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    About the Platform
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Contact &amp; Source Inquiries
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Legal & Disclaimers */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">Legal &amp; Policies</h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <Link to="/disclaimer" className="text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1">
                    <span>Platform Disclaimer</span>
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/license" className="text-slate-400 hover:text-emerald-400 transition-colors">
                    License &amp; Attributions
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom attribution and copyright bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {legalLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="hover:text-slate-300 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div>
              &copy; {new Date().getFullYear()} WFH AI Jobs Aggregator. All rights reserved.
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
}

