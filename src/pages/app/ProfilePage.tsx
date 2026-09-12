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
  Stack,
  LoadingState,
} from '../../components/ui';
import {
  User,
  ShieldCheck,
  Mail,
  Globe,
  Clock,
  Briefcase,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Save,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  UserProfile,
  JobCategory,
  JOB_CATEGORIES,
  EXPERIENCE_LEVELS,
  ExperienceLevel,
  WORK_TYPES,
  WorkType,
  AVAILABILITY_OPTIONS,
  AvailabilityStatus,
} from '../../types';
import {
  fetchUserProfile,
  saveUserProfile,
  createDefaultProfile,
} from '../../lib/profileService';

const SUGGESTED_LANGUAGES = [
  'English',
  'Spanish',
  'French',
  'German',
  'Hindi',
  'Mandarin',
  'Japanese',
  'Portuguese',
  'Arabic',
];

const SUGGESTED_SKILLS = [
  'Prompt Evaluation',
  'RLHF Feedback',
  'Data Labeling',
  'Image Annotation',
  'Search Quality Rating',
  'Hallucination Auditing',
  'Content Moderation',
  'Audio Transcription',
  'Fact Checking',
  'Python',
];

const COMMON_TIMEZONES = [
  'UTC',
  'America/New_York (EST/EDT)',
  'America/Chicago (CST/CDT)',
  'America/Denver (MST/MDT)',
  'America/Los_Angeles (PST/PDT)',
  'Europe/London (GMT/BST)',
  'Europe/Paris (CET/CEST)',
  'Asia/Kolkata (IST)',
  'Asia/Singapore (SGT)',
  'Asia/Tokyo (JST)',
  'Australia/Sydney (AEST/AEDT)',
];

export function ProfilePage() {
  const { user, rawUser, isFirebaseConfigured } = useAuth();

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialProfile, setInitialProfile] = useState<UserProfile | null>(null);

  // Language & Skill tag inputs
  const [newLanguageInput, setNewLanguageInput] = useState('');
  const [newSkillInput, setNewSkillInput] = useState('');

  // Fetch initial profile on mount or user change
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
        const fetched = await fetchUserProfile(user.uid);
        if (isMounted) {
          if (fetched) {
            setProfile(fetched);
            setInitialProfile(fetched);
          } else {
            // Clean initial profile fallback if none exists yet
            const defaultObj = createDefaultProfile(user.uid, {
              displayName: user.displayName,
              email: user.email,
            });
            setProfile(defaultObj);
            setInitialProfile(defaultObj);
          }
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('[ProfilePage] Error loading profile:', err);
          setError(err instanceof Error ? err.message : 'Unable to load profile data.');
          // Fallback to initial default
          const defaultObj = createDefaultProfile(user.uid, {
            displayName: user.displayName,
            email: user.email,
          });
          setProfile(defaultObj);
          setInitialProfile(defaultObj);
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
        <LoadingState message="Loading your contractor profile..." />
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-6 h-6" />
        </div>
        <Heading level={2} className="text-xl">
          Profile Not Accessible
        </Heading>
        <Text variant="muted">
          Please authenticate to view and manage your contractor profile.
        </Text>
      </div>
    );
  }

  // Calculate completeness score (informational only)
  const calculateCompleteness = () => {
    let score = 0;
    if (profile.firstName.trim()) score += 15;
    if (profile.lastName.trim()) score += 10;
    if (profile.country.trim()) score += 15;
    if (profile.timezone.trim()) score += 10;
    if (profile.languages.length > 0) score += 10;
    if (profile.skills.length > 0) score += 15;
    if (profile.preferredCategories.length > 0) score += 15;
    if (profile.availability) score += 10;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();

  // Field change handler
  const handleFieldChange = <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => {
    setProfile((prev) => (prev ? { ...prev, [key]: value } : null));
    setSuccessMessage(null);
  };

  // Language management
  const handleAddLanguage = (langToAdd?: string) => {
    const lang = (langToAdd || newLanguageInput).trim();
    if (!lang) return;
    if (!profile.languages.some((l) => l.toLowerCase() === lang.toLowerCase())) {
      handleFieldChange('languages', [...profile.languages, lang]);
    }
    if (!langToAdd) setNewLanguageInput('');
  };

  const handleRemoveLanguage = (langToRemove: string) => {
    handleFieldChange(
      'languages',
      profile.languages.filter((l) => l !== langToRemove)
    );
  };

  // Skill management
  const handleAddSkill = (skillToAdd?: string) => {
    const skill = (skillToAdd || newSkillInput).trim();
    if (!skill) return;
    if (!profile.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      handleFieldChange('skills', [...profile.skills, skill]);
    }
    if (!skillToAdd) setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    handleFieldChange(
      'skills',
      profile.skills.filter((s) => s !== skillToRemove)
    );
  };

  // Toggle category
  const handleToggleCategory = (catId: JobCategory) => {
    const exists = profile.preferredCategories.includes(catId);
    const updated = exists
      ? profile.preferredCategories.filter((c) => c !== catId)
      : [...profile.preferredCategories, catId];
    handleFieldChange('preferredCategories', updated);
  };

  // Toggle work type
  const handleToggleWorkType = (wtId: WorkType) => {
    const exists = profile.preferredWorkTypes.includes(wtId);
    const updated = exists
      ? profile.preferredWorkTypes.filter((w) => w !== wtId)
      : [...profile.preferredWorkTypes, wtId];
    handleFieldChange('preferredWorkTypes', updated);
  };

  // Reset changes
  const handleResetChanges = () => {
    if (initialProfile) {
      setProfile(initialProfile);
      setSuccessMessage(null);
      setError(null);
    }
  };

  // Save profile
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.uid || !profile) return;

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const saved = await saveUserProfile(user.uid, profile);
      setProfile(saved);
      setInitialProfile(saved);
      setSuccessMessage('Profile saved successfully.');
    } catch (err: unknown) {
      console.error('[ProfilePage] Failed to save profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Heading level={1} className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
              Contractor Profile
            </Heading>
            <Badge variant="category" size="sm">
              Firestore Sync
            </Badge>
          </div>
          <Text variant="muted" className="text-xs sm:text-sm">
            Manage your personal credentials, domain expertise, target contract categories, and availability.
          </Text>
        </div>

        {/* Completeness Pill */}
        <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-2 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Profile Strength</span>
              <span className="text-emerald-400 font-bold ml-2">{completeness}%</span>
            </div>
            <div className="w-28 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${completeness}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-semibold text-rose-200">Unable to Save Profile</p>
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

      <form onSubmit={handleSave} className="space-y-8">
        {/* Section 1: Authentication & Identity Overview (Read-Only Separation) */}
        <Card padded className="border-slate-800 bg-slate-950/70">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <Heading level={3} className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  Authentication Identity (Firebase Auth)
                </Heading>
              </div>
              <Badge variant="neutral" size="xs">
                Private &bull; Strictly Isolated
              </Badge>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xl shrink-0">
                {profile.firstName
                  ? profile.firstName.charAt(0).toUpperCase()
                  : user.displayName
                  ? user.displayName.charAt(0).toUpperCase()
                  : 'U'}
              </div>

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-base font-semibold text-slate-100">
                    {profile.firstName || profile.lastName
                      ? `${profile.firstName} ${profile.lastName}`.trim()
                      : user.displayName || 'Job Seeker'}
                  </span>
                  <Badge variant="category" size="xs">
                    {user.role === 'admin' ? 'Administrator' : 'Contractor'}
                  </Badge>
                  {rawUser?.emailVerified && (
                    <Badge variant="success" size="xs">
                      Verified Email
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    {user.email || 'No email attached'}
                  </span>
                  <span className="text-slate-600">&bull;</span>
                  <span className="font-mono text-[11px] text-slate-500">
                    UID: {user.uid}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Personal & Location Details */}
        <Card padded className="border-slate-800 bg-slate-950/70">
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-3">
              <Heading level={3} className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Personal &amp; Regional Details
              </Heading>
              <Text variant="muted" className="text-xs mt-0.5">
                These details allow contract aggregators to verify geographic eligibility for remote AI projects.
              </Text>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="First Name" id="profile-first-name" hint="Optional, used for application filings">
                <Input
                  id="profile-first-name"
                  type="text"
                  placeholder="e.g. Alex"
                  value={profile.firstName}
                  maxLength={60}
                  onChange={(e) => handleFieldChange('firstName', e.target.value)}
                  disabled={saving}
                />
              </FormField>

              <FormField label="Last Name" id="profile-last-name">
                <Input
                  id="profile-last-name"
                  type="text"
                  placeholder="e.g. Morgan"
                  value={profile.lastName}
                  maxLength={60}
                  onChange={(e) => handleFieldChange('lastName', e.target.value)}
                  disabled={saving}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField
                label="Country of Residence"
                id="profile-country"
                hint="Used to filter region-specific contracts"
              >
                <Input
                  id="profile-country"
                  type="text"
                  placeholder="e.g. United States, India, Germany, Canada"
                  value={profile.country}
                  maxLength={80}
                  onChange={(e) => handleFieldChange('country', e.target.value)}
                  disabled={saving}
                />
              </FormField>

              <FormField
                label="Primary Timezone"
                id="profile-timezone"
                hint="Assists in scheduling evaluation shifts"
              >
                <Input
                  id="profile-timezone"
                  type="text"
                  placeholder="e.g. UTC, America/New_York, Asia/Kolkata"
                  value={profile.timezone}
                  maxLength={80}
                  onChange={(e) => handleFieldChange('timezone', e.target.value)}
                  disabled={saving}
                />
              </FormField>
            </div>

            {/* Quick Timezone Selectors */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Quick Timezone Presets:</span>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_TIMEZONES.slice(0, 6).map((tz) => {
                  const tzName = tz.split(' ')[0];
                  return (
                    <button
                      key={tz}
                      type="button"
                      onClick={() => handleFieldChange('timezone', tzName)}
                      className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                        profile.timezone === tzName
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                      }`}
                    >
                      {tzName}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 3: Languages & Domain Skills */}
        <Card padded className="border-slate-800 bg-slate-950/70">
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-3">
              <Heading level={3} className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Languages &amp; Domain Expertise
              </Heading>
              <Text variant="muted" className="text-xs mt-0.5">
                Linguistic capabilities and AI evaluation skills heavily influence match scoring for tasks.
              </Text>
            </div>

            {/* Languages Tag Area */}
            <div className="space-y-3">
              <FormField
                label="Languages Spoken &amp; Written"
                id="profile-languages-input"
                hint="Add languages you can evaluate or transcribe fluently"
              >
                <div className="flex items-center gap-2">
                  <Input
                    id="profile-languages-input"
                    type="text"
                    placeholder="Type language (e.g. Japanese, French) and press Enter"
                    value={newLanguageInput}
                    onChange={(e) => setNewLanguageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLanguage();
                      }
                    }}
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => handleAddLanguage()}
                    disabled={!newLanguageInput.trim() || saving}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </FormField>

              {/* Active Languages Chips */}
              <div className="flex flex-wrap gap-2 min-h-[32px] p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                {profile.languages.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No languages selected yet.</span>
                ) : (
                  profile.languages.map((lang) => (
                    <span
                      key={lang}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                    >
                      <span>{lang}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveLanguage(lang)}
                        className="text-emerald-400 hover:text-emerald-100 p-0.5 transition-colors"
                        aria-label={`Remove ${lang}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Quick Language Suggestions */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-slate-500">Suggested Languages:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_LANGUAGES.map((lang) => {
                    const isAdded = profile.languages.some((l) => l.toLowerCase() === lang.toLowerCase());
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => handleAddLanguage(lang)}
                        disabled={isAdded}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isAdded
                            ? 'bg-emerald-950/40 text-emerald-500 border-emerald-900/50 opacity-40 cursor-default'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        + {lang}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Technical & AI Evaluation Skills */}
            <div className="space-y-3 pt-4 border-t border-slate-900">
              <FormField
                label="AI &amp; Data Evaluation Skills"
                id="profile-skills-input"
                hint="Specific task competencies (e.g. RLHF, Bounding Boxes, Named Entity Recognition)"
              >
                <div className="flex items-center gap-2">
                  <Input
                    id="profile-skills-input"
                    type="text"
                    placeholder="Type skill and press Enter"
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill();
                      }
                    }}
                    disabled={saving}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={() => handleAddSkill()}
                    disabled={!newSkillInput.trim() || saving}
                    leftIcon={<Plus className="w-4 h-4" />}
                  >
                    Add
                  </Button>
                </div>
              </FormField>

              {/* Active Skills Chips */}
              <div className="flex flex-wrap gap-2 min-h-[32px] p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                {profile.skills.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No skills added yet.</span>
                ) : (
                  profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/15 text-cyan-300 border border-cyan-500/30"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-cyan-400 hover:text-cyan-100 p-0.5 transition-colors"
                        aria-label={`Remove ${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))
                )}
              </div>

              {/* Quick Skill Suggestions */}
              <div className="space-y-1 pt-1">
                <span className="text-[11px] text-slate-500">Suggested Competencies:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SUGGESTED_SKILLS.map((skill) => {
                    const isAdded = profile.skills.some((s) => s.toLowerCase() === skill.toLowerCase());
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => handleAddSkill(skill)}
                        disabled={isAdded}
                        className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                          isAdded
                            ? 'bg-cyan-950/40 text-cyan-500 border-cyan-900/50 opacity-40 cursor-default'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        + {skill}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: Experience Level & Contractor Availability */}
        <Card padded className="border-slate-800 bg-slate-950/70">
          <div className="space-y-6">
            <div className="border-b border-slate-800/80 pb-3">
              <Heading level={3} className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                Experience &amp; Availability
              </Heading>
              <Text variant="muted" className="text-xs mt-0.5">
                Set your overall seniority in data evaluation and current availability window.
              </Text>
            </div>

            {/* Experience Level Selector */}
            <div className="space-y-3">
              <FormField label="Experience Level in AI / Data Contracting" id="experience-level-group">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXPERIENCE_LEVELS.map((level) => {
                    const isSelected = profile.experienceLevel === level.id;
                    return (
                      <div
                        key={level.id}
                        onClick={() => handleFieldChange('experienceLevel', level.id)}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                          isSelected
                            ? 'bg-emerald-500/10 border-emerald-500 text-slate-100 ring-1 ring-emerald-500'
                            : 'bg-slate-900/50 hover:bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{level.label}</span>
                          {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {level.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </FormField>
            </div>

            {/* Availability Option */}
            <div className="space-y-3 pt-4 border-t border-slate-900">
              <FormField label="Availability Window" id="profile-availability" hint="When you can begin active projects">
                <Select
                  id="profile-availability"
                  value={profile.availability}
                  onChange={(e) => handleFieldChange('availability', e.target.value as AvailabilityStatus)}
                  options={AVAILABILITY_OPTIONS.map((opt) => ({
                    value: opt.id,
                    label: opt.label,
                  }))}
                  disabled={saving}
                />
              </FormField>
            </div>

            {/* Preferred Work Types */}
            <div className="space-y-3 pt-4 border-t border-slate-900">
              <FormField
                label="Preferred Contractor Engagement Types"
                id="work-types-group"
                hint="Select all work models you are open to"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {WORK_TYPES.map((wt) => {
                    const isChecked = profile.preferredWorkTypes.includes(wt.id);
                    return (
                      <div
                        key={wt.id}
                        onClick={() => handleToggleWorkType(wt.id)}
                        className={`p-3 rounded-xl border text-xs font-medium transition-all cursor-pointer select-none flex items-center justify-between ${
                          isChecked
                            ? 'bg-emerald-500/10 border-emerald-500/80 text-emerald-300'
                            : 'bg-slate-900/40 hover:bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <span>{wt.label}</span>
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border ${
                            isChecked
                              ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                              : 'border-slate-700 bg-slate-950'
                          }`}
                        >
                          {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </FormField>
            </div>
          </div>
        </Card>

        {/* Section 5: Target AI Job Categories */}
        <Card padded className="border-slate-800 bg-slate-950/70">
          <div className="space-y-5">
            <div className="border-b border-slate-800/80 pb-3">
              <div className="flex items-center justify-between">
                <Heading level={3} className="text-sm font-semibold text-slate-200 uppercase tracking-wider font-mono">
                  Preferred AI Categories ({profile.preferredCategories.length} selected)
                </Heading>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleFieldChange(
                        'preferredCategories',
                        JOB_CATEGORIES.map((c) => c.id)
                      )
                    }
                    className="text-[11px] text-emerald-400 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-600">&bull;</span>
                  <button
                    type="button"
                    onClick={() => handleFieldChange('preferredCategories', [])}
                    className="text-[11px] text-slate-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>
              <Text variant="muted" className="text-xs mt-0.5">
                Choose the task domains you wish to prioritize for incoming remote contracts.
              </Text>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {JOB_CATEGORIES.map((cat) => {
                const isSelected = profile.preferredCategories.includes(cat.id);
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleToggleCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer select-none space-y-1 ${
                      isSelected
                        ? 'bg-emerald-500/10 border-emerald-500/70 text-slate-100 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/40 hover:bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-200">{cat.label}</span>
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                            : 'border-slate-700 bg-slate-950'
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Section 6: Action Footer Bar */}
        <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Profile edits are saved directly to your authenticated UID document in Firestore.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleResetChanges}
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
              Save Profile Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
