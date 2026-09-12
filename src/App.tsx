import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/routing/AuthContextPlaceholder';
import { SavedJobsProvider } from './context/SavedJobsContext';
import { RouteSimulatorBar } from './components/routing/RouteSimulatorBar';
import { ProtectedRoute } from './components/routing/ProtectedRoute';
import { AdminRoute } from './components/routing/AdminRoute';

// Layouts
import { PublicLayout } from './components/layout/PublicLayout';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { LoginPage } from './pages/public/LoginPage';
import { SignupPage } from './pages/public/SignupPage';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage';
import { FaqPage } from './pages/public/FaqPage';
import { AboutPage } from './pages/public/AboutPage';
import { PrivacyPage } from './pages/public/PrivacyPage';
import { TermsPage } from './pages/public/TermsPage';
import { LicensePage } from './pages/public/LicensePage';
import { DisclaimerPage } from './pages/public/DisclaimerPage';
import { ContactPage } from './pages/public/ContactPage';

// Authenticated Pages
import { AppDashboardPage } from './pages/app/AppDashboardPage';
import { JobListingsPage } from './pages/app/JobListingsPage';
import { JobDetailsPage } from './pages/app/JobDetailsPage';
import { SavedJobsPage } from './pages/app/SavedJobsPage';
import { ProfilePage } from './pages/app/ProfilePage';
import { SettingsPage } from './pages/app/SettingsPage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminJobsPage } from './pages/admin/AdminJobsPage';
import { AdminSourcesPage } from './pages/admin/AdminSourcesPage';
import { AdminIngestionPage } from './pages/admin/AdminIngestionPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SavedJobsProvider>
          <div className="flex flex-col min-h-screen bg-slate-900 text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-300">
            {/* Top route verification and simulation status bar */}
            <RouteSimulatorBar />

            {/* Application Route Registry */}
            <Routes>
              {/* 1. PUBLIC ROUTES */}
              <Route element={<PublicLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/faq" element={<FaqPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/license" element={<LicensePage />} />
                <Route path="/disclaimer" element={<DisclaimerPage />} />
                <Route path="/contact" element={<ContactPage />} />
              </Route>

              {/* 2. AUTHENTICATED ROUTES (Protected Boundary) */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/app" element={<AppDashboardPage />} />
                <Route path="/app/jobs" element={<JobListingsPage />} />
                <Route path="/app/jobs/:id" element={<JobDetailsPage />} />
                <Route path="/app/saved" element={<SavedJobsPage />} />
                <Route path="/app/profile" element={<ProfilePage />} />
                <Route path="/app/settings" element={<SettingsPage />} />
              </Route>

              {/* 3. ADMIN ROUTES (Admin Authorization Boundary) */}
              <Route
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/jobs" element={<AdminJobsPage />} />
                <Route path="/admin/sources" element={<AdminSourcesPage />} />
                <Route path="/admin/ingestion" element={<AdminIngestionPage />} />
                <Route path="/admin/reports" element={<AdminReportsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
              </Route>

              {/* 4. CATCH-ALL REDIRECT */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </SavedJobsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
