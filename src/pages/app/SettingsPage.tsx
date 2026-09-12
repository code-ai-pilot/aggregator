import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Card,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  FormField,
  Select,
  Checkbox,
  LoadingState,
} from '../../components/ui';
import {
  Settings as SettingsIcon,
  User,
  Sliders,
  Bell,
  Lock,
  ShieldCheck,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Mail,
  DollarSign,
  Clock,
  Eye,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import {
  UserSettings,
  CurrencyCode,
  JobSortPreference,
  RefreshInterval,
  NotificationCadence,
  ProfileVisibility,
} from '../../types';
import {
  fetchUserSettings,
  saveUserSettings,
  createDefaultSettings,
} from '../../lib/settingsService';

const CURRENCIES: { id: CurrencyCode; label: string; symbol: string }[] = [
  { id: 'USD', label: 'US Dollar (USD $)', symbol: '$' },
  { id: 'EUR', label: 'Euro (EUR €)', symbol: '€' },
  { id: 'GBP', label: 'British Pound (GBP £)', symbol: '£' },
  { id: 'CAD', label: 'Canadian Dollar (CAD $)', symbol: 'CA$' },
  { id: 'AUD', label: 'Australian Dollar (AUD $)', symbol: 'A$' },
  { id: 'SGD', label: 'Singapore Dollar (SGD $)', symbol: 'S$' },
  { id: 'INR', label: 'Indian Rupee (INR ₹)', symbol: '₹' },
];

const SORT_OPTIONS: { id: JobSortPreference; label: string }[] = [
  { id: 'NEWEST', label: 'Newest Listed Contracts First' },
  { id: 'HIGHEST_RATE', label: 'Highest Hourly Rate ($/hr)' },
  { id: 'TITLE_AZ', label: 'Job Title (Alphabetical A–Z)' },
  { id: 'LOWEST_RATE', label: 'Lowest Rate First' },
];

const REFRESH_OPTIONS: { id: RefreshInterval; label: string }[] = [
  { id: 'OFF', label: 'Manual Refresh Only' },
  { id: '5_MIN', label: 'Every 5 Minutes' },
  { id: '15_MIN', label: 'Every 15 Minutes (Recommended)' },
  { id: '30_MIN', label: 'Every 30 Minutes' },
];

const CADENCE_OPTIONS: { id: NotificationCadence; label: string; description: string }[] = [
  { id: 'INSTANT', label: 'Instant Alerts', description: 'Immediate notification when high-matching tasks open.' },
  { id: 'DAILY', label: 'Daily Digest', description: 'Single morning summary of new projects matching your criteria.' },
  { id: 'WEEKLY', label: 'Weekly Summary', description: 'Weekly digest of platform activity and rate shifts.' },
  { id: 'OFF', label: 'Do Not Send Email', description: 'Disable all non-essential email notifications.' },
];

const VISIBILITY_OPTIONS: { id: ProfileVisibility; label: string; description: string }[] = [
  {
    id: 'PUBLIC_TO_RECRUITERS',
    label: 'Public to Verified AI Recruiters',
    description: 'Allow verified platforms and labs to find your profile for direct contractor invitations.',
  },
  {
    id: 'ONLY_APPLIED',
    label: 'Only Platforms I Apply To',
    description: 'Your profile remains hidden until you initiate an application to a listing.',
  },
  {
    id: 'COMPLETELY_PRIVATE',
    label: 'Completely Private',
    description: 'Profile is not discoverable and no matchmaking invitations will be received.',
  },
];

const LOCALES = [
  { value: 'en-US', label: 'English (United States - en-US)' },
  { value: 'en-GB', label: 'English (United Kingdom - en-GB)' },
  { value: 'en-CA', label: 'English (Canada - en-CA)' },
  { value: 'en-AU', label: 'English (Australia - en-AU)' },
  { value: 'en-IN', label: 'English (India - en-IN)' },
  { value: 'es-ES', label: 'Spanish (Español - es-ES)' },
  { value: 'fr-FR', label: 'French (Français - fr-FR)' },
  { value: 'de-DE', label: 'German (Deutsch - de-DE)' },
  { value: 'ja-JP', label: 'Japanese (日本語 - ja-JP)' },
];

export function SettingsPage() {
  const { user, rawUser } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [initialSettings, setInitialSettings] = useState<UserSettings | null>(null);

  // Active sub-navigation tab for quick jumping
  const [activeTab, setActiveTab] = useState<'account' | 'jobs' | 'notifications' | 'privacy'>('account');

  // Load user settings on mount or user change
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetched = await fetchUserSettings(user.uid);
        if (isMounted) {
          if (fetched) {
            setSettings(fetched);
            setInitialSettings(fetched);
          } else {
            // Graceful fallback to default settings
            const defaultObj = createDefaultSettings(user.uid, {
              displayName: user.displayName,
              email: user.email,
            });
            setSettings(defaultObj);
            setInitialSettings(defaultObj);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('[SettingsPage] Error fetching settings:', err);
          setError(err instanceof Error ? err.message : 'Unable to load settings.');
          const defaultObj = createDefaultSettings(user.uid, {
            displayName: user.displayName,
            email: user.email,
          });
          setSettings(defaultObj);
          setInitialSettings(defaultObj);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [user?.uid, user?.displayName, user?.email]);

  if (loading) {
    return (
      <div className="py-16">
        <LoadingState message="Loading your preferences and settings..." />
      </div>
    );
  }

  if (!user || !settings) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <Heading level={2} className="text-xl">
          Settings Unavailable
        </Heading>
        <Text variant="muted">
          Please log in to manage your account and application preferences.
        </Text>
      </div>
    );
  }

  // Nested property update helpers
  const updateAccount = (updates: Partial<UserSettings['account']>) => {
    setSettings((prev) =>
      prev ? { ...prev, account: { ...prev.account, ...updates } } : null
    );
    setSuccessMessage(null);
  };

  const updateJobPreferences = (updates: Partial<UserSettings['jobPreferences']>) => {
    setSettings((prev) =>
      prev ? { ...prev, jobPreferences: { ...prev.jobPreferences, ...updates } } : null
    );
    setSuccessMessage(null);
  };

  const updateNotifications = (updates: Partial<UserSettings['notifications']>) => {
    setSettings((prev) =>
      prev ? { ...prev, notifications: { ...prev.notifications, ...updates } } : null
    );
    setSuccessMessage(null);
  };

  const updatePrivacy = (updates: Partial<UserSettings['privacy']>) => {
    setSettings((prev) =>
      prev ? { ...prev, privacy: { ...prev.privacy, ...updates } } : null
    );
    setSuccessMessage(null);
  };

  const handleReset = () => {
    if (initialSettings) {
      setSettings(initialSettings);
      setSuccessMessage(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !settings) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const saved = await saveUserSettings(user.uid, settings);
      setSettings(saved);
      setInitialSettings(saved);
      setSuccessMessage('Settings updated and saved to Firestore successfully.');
    } catch (err: unknown) {
      console.error('[SettingsPage] Error saving settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'jobs', label: 'Job Feed', icon: <Sliders className="w-3.5 h-3.5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-3.5 h-3.5" /> },
    { id: 'privacy', label: 'Privacy & Security', icon: <Lock className="w-3.5 h-3.5" /> },
  ] as const;

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heading level={1} className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              User Settings
            </Heading>
            <Badge variant="category" size="sm">
              Firestore Isolated
            </Badge>
          </div>
          <Text variant="muted" className="text-xs sm:text-sm">
            Configure your account identity, compensation filters, email digest frequencies, and privacy parameters.
          </Text>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>UID: {user.uid.slice(0, 10)}...</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800 rounded-xl overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Feedback Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-rose-200">Settings Update Error</p>
            <p className="text-rose-300/90 leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="flex-1 font-medium">{successMessage}</div>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-400 hover:text-emerald-200 text-xs p-1"
          >
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Account Settings */}
        {(activeTab === 'account' || true) && (
          <div className={activeTab !== 'account' ? 'hidden sm:block' : 'block'}>
            <Card padded className="border-slate-800 bg-slate-950/70">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-emerald-400" />
                    <Heading level={3} className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                      1. Account Settings
                    </Heading>
                  </div>
                  <Badge variant="neutral" size="xs">
                    Authentication Bound
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Public Alias / Display Handle"
                    id="settings-display-name"
                    hint="Displayed on applications and contractor submissions"
                  >
                    <Input
                      id="settings-display-name"
                      type="text"
                      placeholder="e.g. DataProAlex"
                      value={settings.account.displayName}
                      maxLength={80}
                      onChange={(e) => updateAccount({ displayName: e.target.value })}
                      disabled={saving}
                    />
                  </FormField>

                  <FormField
                    label="Communication Email Address"
                    id="settings-contact-email"
                    hint="Preferred address for urgent job invitations (defaults to Auth email)"
                  >
                    <Input
                      id="settings-contact-email"
                      type="email"
                      placeholder={user.email || 'name@example.com'}
                      value={settings.account.contactEmail}
                      maxLength={120}
                      onChange={(e) => updateAccount({ contactEmail: e.target.value })}
                      disabled={saving}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Interface Locale &amp; Regional Formatting"
                    id="settings-locale"
                    hint="Controls currency rendering and date/time conventions"
                  >
                    <Select
                      id="settings-locale"
                      value={settings.account.locale}
                      onChange={(e) => updateAccount({ locale: e.target.value })}
                      options={LOCALES}
                      disabled={saving}
                    />
                  </FormField>

                  <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex flex-col justify-center space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
                      Firebase Auth Account Link
                    </span>
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="truncate max-w-[200px]">{user.email || 'Authenticated User'}</span>
                      <Badge variant={rawUser?.emailVerified ? 'success' : 'neutral'} size="xs">
                        {rawUser?.emailVerified ? 'Verified' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 2: Job Preferences */}
        {(activeTab === 'jobs' || true) && (
          <div className={activeTab !== 'jobs' ? 'hidden sm:block' : 'block'}>
            <Card padded className="border-slate-800 bg-slate-950/70">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-emerald-400" />
                    <Heading level={3} className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                      2. Job Feed &amp; Rate Preferences
                    </Heading>
                  </div>
                  <Badge variant="category" size="xs">
                    Feed Filters
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Minimum Hourly Rate Filter"
                    id="settings-min-rate"
                    hint="Exclude listings that fall below this hourly baseline"
                  >
                    <div className="relative">
                      <Input
                        id="settings-min-rate"
                        type="number"
                        min={0}
                        max={500}
                        step={1}
                        placeholder="15"
                        value={settings.jobPreferences.minHourlyRate}
                        onChange={(e) =>
                          updateJobPreferences({
                            minHourlyRate: Math.max(0, parseInt(e.target.value, 10) || 0),
                          })
                        }
                        disabled={saving}
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
                        $
                      </span>
                    </div>
                  </FormField>

                  <FormField
                    label="Display Currency Preference"
                    id="settings-currency"
                    hint="Display all contract compensations normalized in this currency"
                  >
                    <Select
                      id="settings-currency"
                      value={settings.jobPreferences.currency}
                      onChange={(e) => updateJobPreferences({ currency: e.target.value as CurrencyCode })}
                      options={CURRENCIES.map((c) => ({ value: c.id, label: c.label }))}
                      disabled={saving}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField
                    label="Default Job Feed Sorting"
                    id="settings-default-sort"
                    hint="Default sorting order applied when visiting the job feed"
                  >
                    <Select
                      id="settings-default-sort"
                      value={settings.jobPreferences.defaultSort}
                      onChange={(e) =>
                        updateJobPreferences({ defaultSort: e.target.value as JobSortPreference })
                      }
                      options={SORT_OPTIONS.map((s) => ({ value: s.id, label: s.label }))}
                      disabled={saving}
                    />
                  </FormField>

                  <FormField
                    label="Job Feed Auto-Refresh Interval"
                    id="settings-refresh-interval"
                    hint="Frequency at which new task listings are polled in the background"
                  >
                    <Select
                      id="settings-refresh-interval"
                      value={settings.jobPreferences.autoRefreshInterval}
                      onChange={(e) =>
                        updateJobPreferences({
                          autoRefreshInterval: e.target.value as RefreshInterval,
                        })
                      }
                      options={REFRESH_OPTIONS.map((r) => ({ value: r.id, label: r.label }))}
                      disabled={saving}
                    />
                  </FormField>
                </div>

                {/* Additional UI Toggles */}
                <div className="space-y-3 pt-3 border-t border-slate-900">
                  <Checkbox
                    id="settings-compact-view"
                    label="Enable Compact Listing Cards"
                    description="Reduces visual padding and hides non-essential metadata for higher information density."
                    checked={settings.jobPreferences.compactView}
                    onChange={(checked) => updateJobPreferences({ compactView: checked })}
                    disabled={saving}
                  />

                  <Checkbox
                    id="settings-confirm-redirects"
                    label="Confirm External Platform Redirects"
                    description="Displays an intermediary safety prompt before navigating to external contractor portals."
                    checked={settings.jobPreferences.confirmExternalRedirects}
                    onChange={(checked) => updateJobPreferences({ confirmExternalRedirects: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 3: Notification Settings */}
        {(activeTab === 'notifications' || true) && (
          <div className={activeTab !== 'notifications' ? 'hidden sm:block' : 'block'}>
            <Card padded className="border-slate-800 bg-slate-950/70">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-400" />
                    <Heading level={3} className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                      3. Email &amp; Alert Notifications
                    </Heading>
                  </div>
                  <Badge variant="category" size="xs">
                    Frequency: {settings.notifications.emailCadence}
                  </Badge>
                </div>

                {/* Cadence Selector Cards */}
                <div className="space-y-2">
                  <FormField label="Email Digest Cadence" id="notification-cadence-group">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {CADENCE_OPTIONS.map((cad) => {
                        const isSelected = settings.notifications.emailCadence === cad.id;
                        return (
                          <div
                            key={cad.id}
                            onClick={() => updateNotifications({ emailCadence: cad.id })}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 text-slate-100 ring-1 ring-emerald-500'
                                : 'bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{cad.label}</span>
                              <div
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-emerald-500 bg-emerald-500'
                                    : 'border-slate-700 bg-slate-950'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {cad.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </FormField>
                </div>

                {/* Individual Trigger Switches */}
                <div className="space-y-3 pt-4 border-t border-slate-900">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Individual Alert Triggers
                  </span>

                  <Checkbox
                    id="notify-match"
                    label="Matching Role Alerts"
                    description="Receive an email when new high-match contracts fitting your skills are posted."
                    checked={settings.notifications.notifyOnMatchingRoles}
                    onChange={(checked) => updateNotifications({ notifyOnMatchingRoles: checked })}
                    disabled={saving}
                  />

                  <Checkbox
                    id="notify-rates"
                    label="Rate Spike Alerts"
                    description="Notify when a contract exceeds $50+/hr in your selected categories."
                    checked={settings.notifications.notifyOnRateSpikes}
                    onChange={(checked) => updateNotifications({ notifyOnRateSpikes: checked })}
                    disabled={saving}
                  />

                  <Checkbox
                    id="notify-deadlines"
                    label="Application Deadline Reminders"
                    description="Alerts before high-demand task batches close for contractor intake."
                    checked={settings.notifications.notifyOnApplicationDeadlines}
                    onChange={(checked) => updateNotifications({ notifyOnApplicationDeadlines: checked })}
                    disabled={saving}
                  />

                  <Checkbox
                    id="notify-updates"
                    label="Platform &amp; System Announcements"
                    description="Receive periodic updates on new supported AI contractor platforms and feature rollouts."
                    checked={settings.notifications.notifySystemAnnouncements}
                    onChange={(checked) => updateNotifications({ notifySystemAnnouncements: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* SECTION 4: Privacy Settings */}
        {(activeTab === 'privacy' || true) && (
          <div className={activeTab !== 'privacy' ? 'hidden sm:block' : 'block'}>
            <Card padded className="border-slate-800 bg-slate-950/70">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <Heading level={3} className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                      4. Privacy &amp; Data Telemetry
                    </Heading>
                  </div>
                  <Badge variant="neutral" size="xs">
                    Zero-Trust Access
                  </Badge>
                </div>

                {/* Visibility Selector */}
                <div className="space-y-3">
                  <FormField label="Contractor Profile Discovery &amp; Visibility" id="privacy-visibility-group">
                    <div className="space-y-2.5">
                      {VISIBILITY_OPTIONS.map((vis) => {
                        const isSelected = settings.privacy.visibility === vis.id;
                        return (
                          <div
                            key={vis.id}
                            onClick={() => updatePrivacy({ visibility: vis.id })}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                              isSelected
                                ? 'bg-emerald-500/10 border-emerald-500 text-slate-100 ring-1 ring-emerald-500/50'
                                : 'bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold">{vis.label}</span>
                              <div
                                className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                                  isSelected
                                    ? 'border-emerald-500 bg-emerald-500'
                                    : 'border-slate-700 bg-slate-950'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                              </div>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {vis.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </FormField>
                </div>

                {/* Telemetry and Analytics Checkboxes */}
                <div className="space-y-3 pt-4 border-t border-slate-900">
                  <span className="text-xs font-semibold text-slate-300 block">
                    Telemetry &amp; Community Contributions
                  </span>

                  <Checkbox
                    id="privacy-telemetry"
                    label="Search Query &amp; Click Telemetry"
                    description="Store recent search filter preferences locally to provide personalized quick-filters."
                    checked={settings.privacy.recordSearchTelemetry}
                    onChange={(checked) => updatePrivacy({ recordSearchTelemetry: checked })}
                    disabled={saving}
                  />

                  <Checkbox
                    id="privacy-salary-stats"
                    label="Contribute to Anonymous Pay Benchmarks"
                    description="Aggregates anonymous rate data from your verified projects to compute fair market averages."
                    checked={settings.privacy.shareAnonymousSalaryStats}
                    onChange={(checked) => updatePrivacy({ shareAnonymousSalaryStats: checked })}
                    disabled={saving}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Footer Bar */}
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Settings are saved directly to your authenticated UID document in Firestore.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleReset}
              disabled={saving}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reset
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={saving}
              disabled={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
