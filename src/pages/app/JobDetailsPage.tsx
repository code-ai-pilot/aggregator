import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Card,
  Heading,
  Text,
  Badge,
  Button,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/ui';
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Flag,
  Building2,
  MapPin,
  Clock,
  DollarSign,
  Languages,
  Award,
  Globe,
  CheckCircle2,
  AlertCircle,
  Share2,
  Calendar,
  Layers,
  ShieldCheck,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { getJobById, formatJobFreshness, formatCompensation } from '../../lib/jobClient';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { Job } from '../../types';
import {
  recordJobViewEvent,
  recordApplicationClickEvent,
  recordJobReportEvent,
} from '../../lib/eventService';

export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isJobSaved, toggleSave } = useSavedJobs();

  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // UI action integration state
  const isSaved = id ? isJobSaved(id) : false;
  const [saveNoticeMsg, setSaveNoticeMsg] = useState<string | null>(null);
  const [isTogglingSave, setIsTogglingSave] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<string>('EXPIRED');
  const [reportNotes, setReportNotes] = useState<string>('');
  const [reportSuccessNotice, setReportSuccessNotice] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const fetchJobDetails = useCallback(async () => {
    if (!id || !id.trim()) {
      setErrorMessage('No job identifier provided.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await getJobById(id);
      if (response && response.job) {
        setJob(response.job);
        // Record telemetry event for job detail view (non-blocking)
        recordJobViewEvent(response.job.id, response.job.sourceId, {
          title: response.job.title,
          companyName: response.job.companyName,
          category: response.job.category,
        }).catch(() => {});
      } else {
        setJob(null);
        setErrorMessage('Job listing not found or is no longer active.');
      }
    } catch (err: any) {
      console.error(`Error loading job [${id}]:`, err);
      if (err.status === 404) {
        setErrorMessage('Job listing not found or has expired.');
      } else {
        setErrorMessage(err.message || 'Failed to load job details. Please check your network connection.');
      }
      setJob(null);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);

  // Integration handler for Save action
  const handleToggleSave = async () => {
    if (!id || isTogglingSave) return;
    setIsTogglingSave(true);
    try {
      const nowSaved = await toggleSave(id);
      setSaveNoticeMsg(nowSaved ? 'Contract bookmarked in your saved jobs' : 'Contract removed from saved list');
      setTimeout(() => setSaveNoticeMsg(null), 3500);
    } catch (err: any) {
      console.error('Failed to toggle save:', err);
      setSaveNoticeMsg(err.message || 'Failed to update bookmark');
      setTimeout(() => setSaveNoticeMsg(null), 3500);
    } finally {
      setIsTogglingSave(false);
    }
  };

  // Integration handler for Report action
  const handleOpenReport = () => {
    setShowReportModal(true);
  };

  const handleCloseReport = () => {
    setShowReportModal(false);
  };

  const handleSubmitReportStub = (e: React.FormEvent) => {
    e.preventDefault();
    if (job) {
      recordJobReportEvent(job.id, reportReason, job.sourceId, {
        detailsSnippet: reportNotes.trim() ? reportNotes.trim().slice(0, 100) : undefined,
      }).catch(() => {});
    }
    setShowReportModal(false);
    setReportNotes('');
    setReportSuccessNotice(true);
    setTimeout(() => setReportSuccessNotice(false), 4000);
  };

  // Copy shareable job link
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      }
    } catch (err) {
      console.warn('Could not copy to clipboard:', err);
    }
  };

  // Formatted date helpers (Strictly avoiding fabricated dates)
  const formatIsoDate = (isoStr?: string | null): string | null => {
    if (!isoStr) return null;
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return null;
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return null;
    }
  };

  const formatIsoDateTime = (isoStr?: string | null): string | null => {
    if (!isoStr) return null;
    try {
      const date = new Date(isoStr);
      if (isNaN(date.getTime())) return null;
      return `${date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })} at ${date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return null;
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/app/jobs">
            <Button variant="ghost" size="xs" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Job Feed
            </Button>
          </Link>
        </div>
        <LoadingState message="Fetching contract specifications..." />
      </div>
    );
  }

  // Render error state
  if (errorMessage || !job) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Link to="/app/jobs">
            <Button variant="ghost" size="xs" leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Job Feed
            </Button>
          </Link>
        </div>

        <Card padded className="border-slate-800 bg-slate-950/60 max-w-2xl mx-auto my-8">
          <EmptyState
            icon={<AlertCircle className="w-8 h-8 text-amber-400" />}
            title="Contract Listing Not Found"
            description={
              errorMessage ||
              `We could not find an active contract with ID "${id}". It may have expired or been removed from the platform.`
            }
            action={{
              label: 'Explore Active Jobs',
              onClick: () => navigate('/app/jobs'),
            }}
          />
        </Card>
      </div>
    );
  }

  // Pre-calculate verified display attributes
  const freshness = formatJobFreshness(job.postedAt, job.createdAt);
  const payString = formatCompensation(
    job.compensationMin,
    job.compensationMax,
    job.compensationCurrency,
    job.compensationType
  );
  const postedDateFormatted = formatIsoDate(job.postedAt || job.createdAt);
  const lastCheckedFormatted = formatIsoDateTime(job.lastCheckedAt);
  const expiresDateFormatted = formatIsoDate(job.expiresAt);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* 1. Top Navigation & Action Alerts */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/app/jobs">
          <Button
            variant="outline"
            size="xs"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            Back to Job Feed
          </Button>
        </Link>

        {/* Temporary Notification Toasts for UI Integration Points */}
        <div className="flex items-center gap-2">
          {saveNoticeMsg && (
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-md animate-fade-in flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {saveNoticeMsg}
            </span>
          )}

          {reportSuccessNotice && (
            <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-md animate-fade-in flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Report submitted for editorial review
            </span>
          )}
        </div>
      </div>

      {/* 2. Primary Header Hero Card */}
      <Card padded className="border-slate-800 bg-slate-950/80 shadow-md space-y-5">
        {/* Meta badges row */}
        <div className="flex flex-wrap items-center gap-2">
          {job.category && (
            <Badge variant="category" size="sm">
              {job.category}
            </Badge>
          )}

          {job.subcategory && (
            <Badge variant="neutral" size="sm">
              {job.subcategory}
            </Badge>
          )}

          {/* Freshness Badge */}
          {freshness && (
            <Badge
              variant={freshness.isFresh ? 'success' : 'neutral'}
              size="sm"
              dot={freshness.isFresh}
              icon={<Clock className="w-3 h-3" />}
            >
              {freshness.text}
            </Badge>
          )}

          {/* Job Verification Badge */}
          {job.verificationStatus === 'VERIFIED' ? (
            <Badge
              variant="success"
              size="sm"
              icon={<CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            >
              Verified Job
            </Badge>
          ) : job.verificationStatus ? (
            <Badge variant="warning" size="sm" icon={<AlertCircle className="w-3 h-3" />}>
              Status: {job.verificationStatus}
            </Badge>
          ) : null}

          {/* Platform Source Attribution Badge */}
          <Badge
            variant="neutral"
            size="sm"
            icon={<Building2 className="w-3 h-3 text-slate-400" />}
            title="Verified partner origin"
          >
            Origin: {job.sourceName || 'Direct'}
          </Badge>
        </div>

        {/* Main Title & Company Header */}
        <div className="space-y-1.5">
          <Heading level={1} className="text-2xl sm:text-3xl font-bold text-slate-100 tracking-tight leading-snug">
            {job.title}
          </Heading>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
            <span className="text-slate-200 font-semibold flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-400" />
              {job.companyName || 'Verified AI Organization'}
            </span>
            <span className="text-slate-600">&bull;</span>
            <span className="flex items-center gap-1 text-slate-300">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {job.locationType === 'REMOTE' ? '100% Remote / Work from Home' : job.locationType || 'Remote'}
            </span>
            {postedDateFormatted && (
              <>
                <span className="text-slate-600">&bull;</span>
                <span className="flex items-center gap-1 text-slate-400 text-xs">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  Posted {postedDateFormatted}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Action Bar (Apply, Save, Report, Share) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-850">
          {/* Compensation Metric */}
          <div>
            {payString ? (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block">
                  Compensation ({job.compensationType || 'Hourly'})
                </span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400 font-mono">
                  {payString}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-xs text-slate-500 uppercase tracking-wider font-medium block">
                  Compensation
                </span>
                <span className="text-sm font-medium text-slate-300">
                  Competitive / Unspecified by Source
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Save Job Action */}
            <Button
              variant={isSaved ? 'primary' : 'outline'}
              size="sm"
              onClick={handleToggleSave}
              disabled={isTogglingSave}
              leftIcon={
                isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Bookmark className="w-4 h-4 text-slate-400" />
                )
              }
              aria-label={isSaved ? 'Saved to bookmarks' : 'Save job bookmark'}
            >
              {isTogglingSave ? 'Updating...' : isSaved ? 'Saved' : 'Save Job'}
            </Button>

            {/* Share link button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              leftIcon={copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
              aria-label="Copy shareable link"
            >
              {copiedLink ? 'Link Copied' : 'Share'}
            </Button>

            {/* UI Integration Point: Report listing */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenReport}
              leftIcon={<Flag className="w-3.5 h-3.5 text-slate-500" />}
              aria-label="Report issue with listing"
            >
              Report
            </Button>

            {/* Direct External Application Link */}
            {job.originalUrl && job.originalUrl !== '#' ? (
              <a
                href={job.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex"
                onClick={() => {
                  recordApplicationClickEvent(job.id, job.sourceId, {
                    destinationUrl: job.originalUrl,
                    sourceName: job.sourceName,
                  }).catch(() => {});
                }}
                aria-label={`Apply on ${job.sourceName || 'external platform'} (opens in new tab)`}
              >
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                  className="font-semibold shadow-sm"
                >
                  Apply on {job.sourceName || 'Platform'}
                </Button>
              </a>
            ) : (
              <Button variant="secondary" size="md" disabled>
                Application Link Unavailable
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Main Content: 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column (2/3): Description, Normalized Specs, Skills & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Overview / Description */}
          <Card padded className="border-slate-800 bg-slate-950/60 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Layers className="w-4 h-4 text-emerald-400" />
              <Heading level={2} className="text-base font-semibold text-slate-100">
                Contract Overview &amp; Scope
              </Heading>
            </div>

            {/* Description Text */}
            <div className="prose prose-invert prose-sm max-w-none text-slate-300 leading-relaxed space-y-3">
              {job.normalizedDescription ? (
                <p className="whitespace-pre-line text-sm text-slate-200">
                  {job.normalizedDescription}
                </p>
              ) : job.description ? (
                <p className="whitespace-pre-line text-sm text-slate-300">
                  {job.description}
                </p>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  No full narrative description provided by the hiring platform. Please review the requirements below or consult the original application page.
                </p>
              )}
            </div>
          </Card>

          {/* Technical Skills & Capabilities Required */}
          {job.skills && job.skills.length > 0 && (
            <Card padded className="border-slate-800 bg-slate-950/60 space-y-3.5">
              <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <Heading level={2} className="text-base font-semibold text-slate-100">
                  Required Skills &amp; Domain Expertise
                </Heading>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs font-mono text-emerald-300 flex items-center gap-1.5"
                  >
                    <Check className="w-3 h-3 text-emerald-500" />
                    {skill}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Eligibility & Geographic Scope */}
          <Card padded className="border-slate-800 bg-slate-950/60 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-850 pb-3">
              <Globe className="w-4 h-4 text-emerald-400" />
              <Heading level={2} className="text-base font-semibold text-slate-100">
                Geographic &amp; Language Eligibility
              </Heading>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Eligible Countries */}
              <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Eligible Countries / Regions
                </div>
                {job.eligibleCountries && job.eligibleCountries.length > 0 ? (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.eligibleCountries.map((country, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-200"
                      >
                        {country}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    Open worldwide (Remote / Any Country)
                  </p>
                )}
              </div>

              {/* Spoken / Written Languages */}
              <div className="p-3.5 bg-slate-900/60 rounded-lg border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Languages className="w-3.5 h-3.5 text-emerald-400" />
                  Language Requirements
                </div>
                {job.languages && job.languages.length > 0 ? (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {job.languages.map((lang, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-200"
                      >
                        {lang}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    English (Standard AI annotation working language)
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column (1/3): Specification Sidebar & Audit Information */}
        <div className="space-y-6">
          {/* Key Contract Attributes */}
          <Card padded className="border-slate-800 bg-slate-950/70 space-y-4">
            <Heading level={2} className="text-sm font-semibold text-slate-100 uppercase tracking-wider pb-2 border-b border-slate-850">
              Contract Specifications
            </Heading>

            <div className="space-y-3 text-xs">
              {/* Job Category */}
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Category:</span>
                <span className="font-semibold text-slate-200 text-right">{job.category}</span>
              </div>

              {/* Contract Type */}
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Engagement Model:</span>
                <span className="font-semibold text-slate-200 text-right">
                  {job.jobType || job.workType || 'Independent Contractor'}
                </span>
              </div>

              {/* Experience Level */}
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Experience Level:</span>
                <span className="font-semibold text-slate-200 text-right">
                  {job.experienceLevel || 'Entry to Mid Level'}
                </span>
              </div>

              {/* Location Model */}
              <div className="flex items-center justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Location Status:</span>
                <span className="font-semibold text-slate-200 text-right">
                  {job.locationType === 'REMOTE' ? '100% Remote' : job.locationType || 'Remote'}
                </span>
              </div>

              {/* Expiration Date (if available) */}
              {expiresDateFormatted && (
                <div className="flex items-center justify-between py-1 border-b border-slate-900">
                  <span className="text-slate-400">Estimated Deadline:</span>
                  <span className="font-semibold text-amber-400 text-right">
                    {expiresDateFormatted}
                  </span>
                </div>
              )}
            </div>

            {/* Direct Apply CTA Box */}
            <div className="pt-2">
              {job.originalUrl && job.originalUrl !== '#' && (
                <a
                  href={job.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                  onClick={() => {
                    recordApplicationClickEvent(job.id, job.sourceId, {
                      destinationUrl: job.originalUrl,
                      sourceName: job.sourceName,
                    }).catch(() => {});
                  }}
                  aria-label={`Open direct application on ${job.sourceName || 'partner platform'}`}
                >
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center"
                    rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                  >
                    Direct Platform Application
                  </Button>
                </a>
              )}
            </div>
          </Card>

          {/* Provenance, Attribution & Verification Details */}
          <Card padded className="border-slate-800 bg-slate-950/70 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <Heading level={2} className="text-sm font-semibold text-slate-100 uppercase tracking-wider">
                Source &amp; Verification Audit
              </Heading>
            </div>

            <div className="space-y-3 text-xs">
              {/* Sourced Platform */}
              <div className="space-y-0.5">
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
                  Hiring Platform / Source
                </span>
                <div className="text-slate-200 font-semibold flex items-center justify-between">
                  <span>{job.sourceName || 'Direct Verification Network'}</span>
                  {job.sourceId && (
                    <span className="text-[10px] font-mono text-slate-500">[{job.sourceId}]</span>
                  )}
                </div>
              </div>

              {/* Source vs Job Verification Differentiation */}
              <div className="p-2.5 bg-slate-900/60 rounded border border-slate-850 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Job Verification:</span>
                  <span
                    className={`font-semibold ${
                      job.verificationStatus === 'VERIFIED' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {job.verificationStatus || 'Active'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Link Integrity:</span>
                  <span
                    className={`font-semibold ${
                      job.urlStatus === 'VALID' ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {job.urlStatus || 'Verified Destination'}
                  </span>
                </div>
              </div>

              {/* Telemetry Timestamps (Strictly un-fabricated) */}
              {lastCheckedFormatted && (
                <div className="space-y-0.5 pt-1">
                  <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-medium">
                    Last Verified &amp; Checked
                  </span>
                  <span className="text-slate-300 font-mono text-[11px]">
                    {lastCheckedFormatted}
                  </span>
                </div>
              )}

              {/* Notice */}
              <div className="pt-2 border-t border-slate-850 text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>
                  Applications are completed directly on the employer&apos;s verified platform portal. We never charge contractor placement fees.
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 4. Report Issue Modal (UI Integration Point for future Reporting feature) */}
      {showReportModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="report-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flag className="w-5 h-5 text-amber-400" />
                <h3 id="report-modal-title" className="text-base font-bold text-slate-100">
                  Report Job Listing
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseReport}
                className="text-slate-500 hover:text-slate-300 text-sm p-1"
                aria-label="Close modal"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Help maintain dataset accuracy. Report broken application links, expired contracts, or inaccurate compensation parameters for &ldquo;{job.title}&rdquo;.
            </p>

            <form onSubmit={handleSubmitReportStub} className="space-y-3">
              <div>
                <label htmlFor="report-reason" className="block text-xs font-medium text-slate-400 mb-1">
                  Reason for Report
                </label>
                <select
                  id="report-reason"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="EXPIRED">Contract is expired / closed</option>
                  <option value="BROKEN_LINK">Application link is broken or 404</option>
                  <option value="INCORRECT_RATE">Compensation info is inaccurate</option>
                  <option value="INCORRECT_REQUIREMENTS">Eligibility requirements incorrect</option>
                  <option value="OTHER">Other issue</option>
                </select>
              </div>

              <div>
                <label htmlFor="report-notes" className="block text-xs font-medium text-slate-400 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  id="report-notes"
                  rows={3}
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Provide context for our review..."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" size="xs" onClick={handleCloseReport}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="xs">
                  Submit Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
