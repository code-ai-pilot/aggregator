import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  Heading,
  Text,
  Badge,
  Button,
  SearchInput,
  LoadingState,
  EmptyState,
  ErrorState,
} from '../../components/ui';
import {
  Bookmark,
  BookmarkCheck,
  Briefcase,
  ArrowRight,
  ExternalLink,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  MapPin,
  Award,
  DollarSign,
  FileText,
  Check,
  X,
  Archive,
  Send,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useSavedJobs } from '../../context/SavedJobsContext';
import { useAuth } from '../../context/AuthContext';
import { SavedJob, SavedJobStatus, Job } from '../../types';
import { formatJobFreshness, formatCompensation } from '../../lib/jobClient';
import { recordApplicationClickEvent } from '../../lib/eventService';

export function SavedJobsPage() {
  const { user } = useAuth();
  const {
    enrichedSavedJobs,
    isLoading,
    error,
    unsave,
    updateRecord,
    refreshEnriched,
  } = useSavedJobs();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusTab, setSelectedStatusTab] = useState<'ALL' | SavedJobStatus>('ALL');
  
  // Note editing state
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');
  const [isSavingNote, setIsSavingNote] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Initial load of enriched saved jobs
  useEffect(() => {
    refreshEnriched();
  }, [refreshEnriched]);

  // Notice toaster helper
  const triggerNotice = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Status metrics counts
  const stats = useMemo(() => {
    const total = enrichedSavedJobs.length;
    const saved = enrichedSavedJobs.filter((item) => item.savedJob.status === 'SAVED').length;
    const applied = enrichedSavedJobs.filter((item) => item.savedJob.status === 'APPLIED').length;
    const archived = enrichedSavedJobs.filter((item) => item.savedJob.status === 'ARCHIVED').length;
    return { total, saved, applied, archived };
  }, [enrichedSavedJobs]);

  // Filtered saved jobs based on search query and status tab
  const filteredItems = useMemo(() => {
    return enrichedSavedJobs.filter(({ savedJob, job }) => {
      // Status filter
      if (selectedStatusTab !== 'ALL' && savedJob.status !== selectedStatusTab) {
        return false;
      }

      // Keyword search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const title = job?.title?.toLowerCase() || '';
        const company = job?.companyName?.toLowerCase() || '';
        const notes = savedJob.notes?.toLowerCase() || '';
        const category = job?.category?.toLowerCase() || '';
        const skills = job?.skills?.join(' ').toLowerCase() || '';

        const matches =
          title.includes(query) ||
          company.includes(query) ||
          notes.includes(query) ||
          category.includes(query) ||
          skills.includes(query) ||
          savedJob.jobId.toLowerCase().includes(query);

        if (!matches) return false;
      }

      return true;
    });
  }, [enrichedSavedJobs, selectedStatusTab, searchQuery]);

  // Handle Unsave
  const handleUnsave = async (jobId: string, title?: string) => {
    try {
      await unsave(jobId);
      triggerNotice(`Removed "${title || 'Job'}" from saved listings`);
    } catch (err: any) {
      console.error('Failed to unsave job:', err);
      triggerNotice(`Error removing job: ${err.message}`);
    }
  };

  // Handle Status change (e.g. SAVED -> APPLIED -> ARCHIVED)
  const handleStatusChange = async (jobId: string, newStatus: SavedJobStatus) => {
    try {
      await updateRecord(jobId, { status: newStatus });
      triggerNotice(`Status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      triggerNotice(`Error updating status: ${err.message}`);
    }
  };

  // Open note edit dialog/inline form
  const handleStartEditNote = (savedJob: SavedJob) => {
    setEditingJobId(savedJob.jobId);
    setEditingNoteText(savedJob.notes || '');
  };

  // Cancel note edit
  const handleCancelEditNote = () => {
    setEditingJobId(null);
    setEditingNoteText('');
  };

  // Save note edit
  const handleSaveNote = async (jobId: string) => {
    setIsSavingNote(true);
    try {
      await updateRecord(jobId, { notes: editingNoteText });
      setEditingJobId(null);
      setEditingNoteText('');
      triggerNotice('Personal notes updated');
    } catch (err: any) {
      console.error('Failed to save note:', err);
      triggerNotice(`Error saving note: ${err.message}`);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Date formatting helper
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header & Summary Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Heading level={2} className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <BookmarkCheck className="w-6 h-6 text-emerald-400" />
            Saved Contracts &amp; Applications
          </Heading>
          <Text className="text-sm text-slate-400 mt-1">
            Manage your bookmarked remote AI roles, track application status, and keep private notes.
          </Text>
        </div>

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3.5 py-1.5 rounded-md animate-fade-in flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>{actionNotice}</span>
          </div>
        )}
      </div>

      {/* 2. Status Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedStatusTab('ALL')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            selectedStatusTab === 'ALL'
              ? 'bg-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-medium text-slate-400">Total Saved</div>
          <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{stats.total}</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('SAVED')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            selectedStatusTab === 'SAVED'
              ? 'bg-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Bookmark className="w-3 h-3 text-emerald-400" />
            Bookmarked
          </div>
          <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">{stats.saved}</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('APPLIED')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            selectedStatusTab === 'APPLIED'
              ? 'bg-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Send className="w-3 h-3 text-blue-400" />
            Applied
          </div>
          <div className="text-xl font-bold text-blue-400 mt-1 font-mono">{stats.applied}</div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedStatusTab('ARCHIVED')}
          className={`p-3.5 rounded-lg border text-left transition-all ${
            selectedStatusTab === 'ARCHIVED'
              ? 'bg-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/20'
              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <Archive className="w-3 h-3 text-amber-400" />
            Archived
          </div>
          <div className="text-xl font-bold text-amber-400 mt-1 font-mono">{stats.archived}</div>
        </button>
      </div>

      {/* 3. Search & Filter Bar */}
      <Card padded className="border-slate-800 bg-slate-950/60 space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              placeholder="Filter by contract title, platform, notes, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refreshEnriched()}
              leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-400" />}
              aria-label="Refresh saved listings"
            >
              Sync
            </Button>

            <Link to="/app/jobs">
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Explore Feed
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* 4. Content Area: Loading, Error, Empty, List */}
      {isLoading ? (
        <LoadingState message="Synchronizing saved contracts and application records..." />
      ) : error ? (
        <ErrorState
          title="Failed to Load Saved Jobs"
          message={error}
          onRetry={refreshEnriched}
        />
      ) : enrichedSavedJobs.length === 0 ? (
        <Card padded className="border-slate-800 bg-slate-950/60 text-center py-12">
          <EmptyState
            icon={<Bookmark className="w-8 h-8 text-slate-500" />}
            title="No Saved Contracts Yet"
            description="When you bookmark AI training, data annotation, or response evaluation jobs from the feed, they will appear here with your personal notes and status tracking."
            action={{
              label: 'Explore Active Job Feed',
              onClick: () => (window.location.href = '/app/jobs'),
            }}
          />
        </Card>
      ) : filteredItems.length === 0 ? (
        <Card padded className="border-slate-800 bg-slate-950/60 text-center py-10">
          <EmptyState
            title="No matching saved contracts"
            description="None of your saved jobs match the current search keyword or status tab."
            action={{
              label: 'Clear Filters',
              onClick: () => {
                setSearchQuery('');
                setSelectedStatusTab('ALL');
              },
            }}
          />
        </Card>
      ) : (
        <div className="space-y-4" role="feed" aria-label="Saved jobs list">
          {filteredItems.map(({ savedJob, job, isUnavailable }) => {
            const isEditingThis = editingJobId === savedJob.jobId;
            const freshness = job ? formatJobFreshness(job.postedAt, job.createdAt) : null;
            const payString = job
              ? formatCompensation(
                  job.compensationMin,
                  job.compensationMax,
                  job.compensationCurrency,
                  job.compensationType
                )
              : null;

            return (
              <Card
                key={savedJob.id}
                padded
                className={`border transition-all ${
                  isUnavailable
                    ? 'border-amber-900/40 bg-slate-950/80 opacity-90'
                    : 'border-slate-800/90 bg-slate-950/60 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left Section: Metadata, Title, Description, Notes */}
                  <div className="space-y-2.5 flex-1 min-w-0">
                    {/* Badge Row */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Tag Selector */}
                      <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-xs">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">
                          Status:
                        </span>
                        <select
                          value={savedJob.status}
                          onChange={(e) =>
                            handleStatusChange(savedJob.jobId, e.target.value as SavedJobStatus)
                          }
                          aria-label={`Change status for ${job?.title || 'contract'}`}
                          className="bg-transparent text-xs font-semibold text-slate-200 focus:outline-none cursor-pointer"
                        >
                          <option value="SAVED" className="bg-slate-900 text-emerald-400">
                            Bookmarked
                          </option>
                          <option value="APPLIED" className="bg-slate-900 text-blue-400">
                            Applied
                          </option>
                          <option value="ARCHIVED" className="bg-slate-900 text-amber-400">
                            Archived
                          </option>
                        </select>
                      </div>

                      {/* Unavailable Warning */}
                      {isUnavailable && (
                        <Badge
                          variant="warning"
                          size="xs"
                          icon={<AlertCircle className="w-3 h-3 text-amber-400" />}
                        >
                          Contract Expired / Inactive in Feed
                        </Badge>
                      )}

                      {/* Category Badge */}
                      {job?.category && (
                        <Badge variant="category" size="xs">
                          {job.category}
                        </Badge>
                      )}

                      {/* Source Attribution */}
                      {job?.sourceName && (
                        <Badge
                          variant="neutral"
                          size="xs"
                          icon={<Building2 className="w-3 h-3 text-slate-400" />}
                        >
                          via {job.sourceName}
                        </Badge>
                      )}

                      {/* Freshness */}
                      {freshness && (
                        <Badge
                          variant={freshness.isFresh ? 'success' : 'neutral'}
                          size="xs"
                          icon={<Clock className="w-3 h-3" />}
                        >
                          {freshness.text}
                        </Badge>
                      )}

                      {/* Saved Timestamp */}
                      <span className="text-[11px] text-slate-500">
                        Saved on {formatDate(savedJob.savedAt)}
                      </span>
                    </div>

                    {/* Job Title & Company */}
                    <div>
                      {job ? (
                        <Link
                          to={`/app/jobs/${job.id}`}
                          className="text-base font-semibold text-slate-100 hover:text-emerald-400 transition-colors inline-flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500 rounded"
                        >
                          {job.title}
                        </Link>
                      ) : (
                        <div className="text-base font-semibold text-slate-300">
                          {savedJob.notes ? savedJob.notes.slice(0, 50) : `Listing ID: ${savedJob.jobId}`}
                        </div>
                      )}

                      <div className="text-xs font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span className="text-slate-300 font-semibold">
                          {job?.companyName || 'External AI Provider'}
                        </span>
                        {job?.subcategory && (
                          <>
                            <span className="text-slate-600">&bull;</span>
                            <span className="text-slate-400">{job.subcategory}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Job Snippet if available */}
                    {job && (job.normalizedDescription || job.description) && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {job.normalizedDescription || job.description}
                      </p>
                    )}

                    {/* Personal Notes Section */}
                    <div className="pt-2 border-t border-slate-900">
                      {isEditingThis ? (
                        <div className="space-y-2 bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                          <label
                            htmlFor={`note-input-${savedJob.jobId}`}
                            className="block text-[11px] font-medium text-slate-300 flex items-center gap-1.5"
                          >
                            <FileText className="w-3 h-3 text-emerald-400" />
                            Personal Notes &amp; Application Checklist:
                          </label>
                          <textarea
                            id={`note-input-${savedJob.jobId}`}
                            rows={3}
                            value={editingNoteText}
                            onChange={(e) => setEditingNoteText(e.target.value)}
                            placeholder="e.g., Completed qualification test, interview scheduled for Friday, pay rate confirmed at $35/hr..."
                            className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={handleCancelEditNote}
                              disabled={isSavingNote}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="xs"
                              onClick={() => handleSaveNote(savedJob.jobId)}
                              disabled={isSavingNote}
                              leftIcon={<Check className="w-3 h-3" />}
                            >
                              {isSavingNote ? 'Saving...' : 'Save Note'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-3 text-xs bg-slate-900/40 px-3 py-2 rounded border border-slate-900">
                          <div className="flex items-start gap-2 text-slate-300">
                            <FileText className="w-3.5 h-3.5 text-slate-500 mt-0.5 shrink-0" />
                            <div>
                              {savedJob.notes ? (
                                <p className="text-slate-300 whitespace-pre-wrap">{savedJob.notes}</p>
                              ) : (
                                <span className="text-slate-500 italic">No notes added yet.</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleStartEditNote(savedJob)}
                            aria-label={`Edit notes for ${job?.title || 'saved job'}`}
                            className="text-xs text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 shrink-0 p-1"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>{savedJob.notes ? 'Edit' : 'Add Note'}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Section: Compensation & Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-900">
                    {/* Pay display */}
                    <div className="text-left lg:text-right">
                      {payString ? (
                        <div>
                          <span className="text-base font-bold text-emerald-400 font-mono">
                            {payString}
                          </span>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">
                            {job?.compensationType || 'Hourly Rate'}
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 font-medium">
                          {isUnavailable ? 'Inactive Listing' : 'Pay: Unspecified'}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* View Details if active */}
                      {job && !isUnavailable && (
                        <Link to={`/app/jobs/${job.id}`}>
                          <Button
                            variant="secondary"
                            size="xs"
                            rightIcon={<ArrowRight className="w-3 h-3" />}
                          >
                            View
                          </Button>
                        </Link>
                      )}

                      {/* Direct Apply if link exists */}
                      {job?.originalUrl && job.originalUrl !== '#' && !isUnavailable && (
                        <a
                          href={job.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            recordApplicationClickEvent(job.id, job.sourceId, {
                              destinationUrl: job.originalUrl,
                              sourceName: job.sourceName,
                            }).catch(() => {});
                          }}
                          aria-label={`Apply on ${job.sourceName || 'external platform'}`}
                        >
                          <Button
                            variant="primary"
                            size="xs"
                            rightIcon={<ExternalLink className="w-3 h-3" />}
                          >
                            Apply
                          </Button>
                        </a>
                      )}

                      {/* Unsave / Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleUnsave(savedJob.jobId, job?.title)}
                        aria-label={`Remove ${job?.title || 'contract'} from saved jobs`}
                        className="p-1.5 rounded border border-slate-800 bg-slate-900 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-colors"
                        title="Remove from saved jobs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
