export type JobCategory =
  | 'IMAGE_ANNOTATION'
  | 'IMAGE_CATEGORIZATION'
  | 'DATA_LABELING'
  | 'TEXT_ANNOTATION'
  | 'AI_RESPONSE_EVALUATION'
  | 'SEARCH_EVALUATION'
  | 'CONTENT_EVALUATION'
  | 'DATA_VERIFICATION'
  | 'TRANSCRIPTION'
  | 'CONTENT_MODERATION'
  | 'LANGUAGE_EVALUATION'
  | 'AI_TRAINING'
  | 'OTHER_RELEVANT';

export const JOB_CATEGORIES: { id: JobCategory; label: string; description: string }[] = [
  { id: 'IMAGE_ANNOTATION', label: 'Image Annotation', description: 'Bounding boxes, segmentation, and visual landmarking' },
  { id: 'IMAGE_CATEGORIZATION', label: 'Image Categorization', description: 'Visual classification and tagging' },
  { id: 'DATA_LABELING', label: 'Data Labeling', description: 'General structured data tagging and dataset curation' },
  { id: 'TEXT_ANNOTATION', label: 'Text Annotation', description: 'Named entity recognition, POS tagging, and sentiment classification' },
  { id: 'AI_RESPONSE_EVALUATION', label: 'AI Response Evaluation', description: 'RLHF, model response ranking, and quality assessment' },
  { id: 'SEARCH_EVALUATION', label: 'Search Evaluation', description: 'Search result relevance, query intent, and ranking audits' },
  { id: 'CONTENT_EVALUATION', label: 'Content Evaluation', description: 'Quality checks, factual consistency, and hallucination audits' },
  { id: 'DATA_VERIFICATION', label: 'Data Verification', description: 'Cross-referencing claims and ground truth verification' },
  { id: 'TRANSCRIPTION', label: 'Transcription', description: 'Audio/video to text conversion and timestamp alignment' },
  { id: 'CONTENT_MODERATION', label: 'Content Moderation', description: 'Safety compliance, policy violations, and toxicity review' },
  { id: 'LANGUAGE_EVALUATION', label: 'Language Evaluation', description: 'Translation validation, localization, and linguistic quality' },
  { id: 'AI_TRAINING', label: 'AI Training', description: 'Domain-specific prompt engineering and instruction tuning' },
  { id: 'OTHER_RELEVANT', label: 'Other Remote AI/Data Roles', description: 'Other verified remote AI and data tasks' },
];

export interface ServerHealthResponse {
  status: string;
  service: string;
  timestamp: string;
  environment: string;
}

export interface AppConfigResponse {
  appName: string;
  version: string;
  categories: JobCategory[];
}

export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'EXPERT';

export interface ExperienceLevelOption {
  id: ExperienceLevel;
  label: string;
  description: string;
}

export const EXPERIENCE_LEVELS: ExperienceLevelOption[] = [
  { id: 'ENTRY', label: 'Entry Level', description: '0–1 years of data annotation or prompt evaluation experience' },
  { id: 'MID', label: 'Mid-Level', description: '2–4 years evaluating model outputs, QA, or specialized labeling' },
  { id: 'SENIOR', label: 'Senior Contributor', description: '5+ years leading data workflows, RLHF pipelines, or quality audits' },
  { id: 'EXPERT', label: 'Domain Specialist / Lead', description: 'Subject matter expert (Law, STEM, Medicine, Code, Linguistics)' },
];

export type WorkType = 'CONTRACT' | 'HOURLY' | 'PART_TIME' | 'FULL_TIME' | 'FLEXIBLE';

export interface WorkTypeOption {
  id: WorkType;
  label: string;
}

export const WORK_TYPES: WorkTypeOption[] = [
  { id: 'CONTRACT', label: 'Fixed-Term Contract' },
  { id: 'HOURLY', label: 'Hourly / Task-Based' },
  { id: 'PART_TIME', label: 'Part-Time Remote' },
  { id: 'FULL_TIME', label: 'Full-Time Remote' },
  { id: 'FLEXIBLE', label: 'Flexible / As-Needed' },
];

export type AvailabilityStatus =
  | 'IMMEDIATELY'
  | 'WITHIN_2_WEEKS'
  | 'WITHIN_MONTH'
  | 'PART_TIME_ONLY'
  | 'NOT_ACTIVELY_LOOKING';

export interface AvailabilityOption {
  id: AvailabilityStatus;
  label: string;
}

export const AVAILABILITY_OPTIONS: AvailabilityOption[] = [
  { id: 'IMMEDIATELY', label: 'Available Immediately (Ready now)' },
  { id: 'WITHIN_2_WEEKS', label: 'Within 1–2 Weeks' },
  { id: 'WITHIN_MONTH', label: 'Within 1 Month' },
  { id: 'PART_TIME_ONLY', label: 'Part-Time / Evenings & Weekends Only' },
  { id: 'NOT_ACTIVELY_LOOKING', label: 'Not Actively Looking' },
];

export interface UserProfile {
  uid: string;
  firstName: string;
  lastName: string;
  country: string;
  timezone: string;
  languages: string[];
  skills: string[];
  experienceLevel: ExperienceLevel | string;
  preferredCategories: JobCategory[];
  preferredWorkTypes: (WorkType | string)[];
  availability: AvailabilityStatus | string;
  createdAt?: string;
  updatedAt?: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'CAD' | 'AUD' | 'SGD' | 'INR';

export type JobSortPreference = 'NEWEST' | 'HIGHEST_RATE' | 'TITLE_AZ' | 'LOWEST_RATE';

export type RefreshInterval = 'OFF' | '5_MIN' | '15_MIN' | '30_MIN';

export type NotificationCadence = 'INSTANT' | 'DAILY' | 'WEEKLY' | 'OFF';

export type ProfileVisibility = 'PUBLIC_TO_RECRUITERS' | 'ONLY_APPLIED' | 'COMPLETELY_PRIVATE';

export interface AccountSettings {
  displayName: string;
  contactEmail: string;
  locale: string;
}

export interface JobPreferenceSettings {
  minHourlyRate: number;
  currency: CurrencyCode;
  defaultSort: JobSortPreference;
  autoRefreshInterval: RefreshInterval;
  compactView: boolean;
  confirmExternalRedirects: boolean;
}

export interface NotificationSettings {
  emailCadence: NotificationCadence;
  notifyOnMatchingRoles: boolean;
  notifyOnRateSpikes: boolean;
  notifyOnApplicationDeadlines: boolean;
  notifySystemAnnouncements: boolean;
}

export interface PrivacySettings {
  visibility: ProfileVisibility;
  allowSearchIndexing: boolean;
  recordSearchTelemetry: boolean;
  shareAnonymousSalaryStats: boolean;
}

export interface UserSettings {
  uid: string;
  account: AccountSettings;
  jobPreferences: JobPreferenceSettings;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  updatedAt?: string;
  createdAt?: string;
}

/* ==========================================================================
   FIRESTORE DATA MODELS (FOUNDATION)
   ========================================================================== */

/** Location constraint model */
export type LocationType = 'REMOTE' | 'HYBRID' | 'ONSITE' | 'GEO_FENCED';

/** Compensation schedule model */
export type CompensationType = 'HOURLY' | 'FIXED' | 'TASK_BASED' | 'MONTHLY' | 'UNSPECIFIED';

/**
 * Job Status Values:
 * ACTIVE: Available and live on the aggregator feed
 * STALE: Not refreshed recently; pending re-check
 * EXPIRED: Offer deadline passed or removed by provider
 * UNDER_REVIEW: In verification triage or reported
 * REJECTED: Failed quality, compliance, or scam filters
 * SUSPENDED: Temporarily taken down
 */
export type JobStatus =
  | 'ACTIVE'
  | 'STALE'
  | 'EXPIRED'
  | 'UNDER_REVIEW'
  | 'REJECTED'
  | 'SUSPENDED';

export const JOB_STATUSES: JobStatus[] = [
  'ACTIVE',
  'STALE',
  'EXPIRED',
  'UNDER_REVIEW',
  'REJECTED',
  'SUSPENDED',
];

/**
 * Job Verification Status Values:
 * VERIFIED: Confirmed authentic job by trusted origin
 * PENDING: Awaiting origin audit or initial triage
 * REVIEW_REQUIRED: Flagged for anomaly or policy review
 * FAILED: Verification failed
 */
export type JobVerificationStatus =
  | 'VERIFIED'
  | 'PENDING'
  | 'REVIEW_REQUIRED'
  | 'FAILED';

export const JOB_VERIFICATION_STATUSES: JobVerificationStatus[] = [
  'VERIFIED',
  'PENDING',
  'REVIEW_REQUIRED',
  'FAILED',
];

/**
 * Job URL Status Values:
 * VALID: Destination returns HTTP 200 / active landing
 * BROKEN: Destination returns 404, 410, or DNS error
 * REDIRECTED: Destination moved to another URI
 * UNKNOWN: Unchecked or pending health probe
 */
export type JobUrlStatus =
  | 'VALID'
  | 'BROKEN'
  | 'REDIRECTED'
  | 'UNKNOWN';

export const JOB_URL_STATUSES: JobUrlStatus[] = [
  'VALID',
  'BROKEN',
  'REDIRECTED',
  'UNKNOWN',
];

/**
 * Primary Job Document Schema (Collection: `jobs/{jobId}`)
 */
export interface Job {
  id: string;
  title: string;
  slug: string;
  companyName: string;
  sourceId: string;
  sourceName: string;
  sourceJobId: string;
  originalUrl: string;
  description: string;
  normalizedDescription: string;
  category: JobCategory | string;
  subcategory: string;
  jobType: string;
  workType: WorkType | string;
  locationType: LocationType | string;
  eligibleCountries: string[];
  languages: string[];
  experienceLevel: ExperienceLevel | string;
  compensationType: CompensationType | string;
  compensationMin: number | null;
  compensationMax: number | null;
  compensationCurrency: CurrencyCode | string;
  skills: string[];
  postedAt: string;
  discoveredAt: string;
  updatedAt: string;
  expiresAt: string | null;
  lastCheckedAt: string;
  status: JobStatus;
  verificationStatus: JobVerificationStatus;
  urlStatus: JobUrlStatus;
  contentHash: string;
  createdAt: string;
}

/**
 * Source Verification Status Values:
 * PENDING_REVIEW: New provider feed awaiting admin audit
 * VERIFIED: Trusted platform or verified API feed
 * SUSPENDED: Temporarily halted due to error rate or policy
 * REJECTED: Disallowed scraper target or scam origin
 */
export type SourceVerificationStatus =
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'SUSPENDED'
  | 'REJECTED';

export const SOURCE_VERIFICATION_STATUSES: SourceVerificationStatus[] = [
  'PENDING_REVIEW',
  'VERIFIED',
  'SUSPENDED',
  'REJECTED',
];

export type SourceType =
  | 'PLATFORM'
  | 'AGGREGATOR'
  | 'JOB_BOARD'
  | 'LAB_PORTAL'
  | 'DIRECT_FEED'
  | 'OFFICIAL_EMPLOYER_CAREERS'
  | 'MANUAL_ENTRY';

export type FetchMethod =
  | 'API'
  | 'RSS'
  | 'SCRAPE'
  | 'WEBHOOK'
  | 'MANUAL';

/**
 * Aggregator Source Schema (Collection: `sources/{sourceId}`)
 */
export interface Source {
  id: string;
  name: string;
  domain: string;
  sourceType: SourceType | string;
  baseUrl: string;
  verificationStatus: SourceVerificationStatus;
  verificationReason: string;
  verifiedAt: string | null;
  lastReviewedAt: string | null;
  active: boolean;
  fetchMethod: FetchMethod | string;
  fetchInterval: number;
  lastSuccessfulFetch: string | null;
  lastAttemptedFetch: string | null;
  jobsFetched: number;
  jobsPublished: number;
  jobsRejected: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Ingestion Run Status Values:
 * RUNNING: Execution in progress
 * SUCCESS: Completed without critical pipeline errors
 * PARTIAL: Completed with some rejected/unparseable items
 * FAILED: Terminated prematurely
 */
export type IngestionStatus =
  | 'RUNNING'
  | 'SUCCESS'
  | 'PARTIAL'
  | 'FAILED';

export const INGESTION_STATUSES: IngestionStatus[] = [
  'RUNNING',
  'SUCCESS',
  'PARTIAL',
  'FAILED',
];

export interface IngestionErrorRecord {
  timestamp: string;
  step: 'FETCH' | 'PARSE' | 'NORMALIZE' | 'VALIDATE' | 'CATEGORIZE' | 'DEDUPLICATE' | 'PUBLISH' | 'PERSIST' | string;
  message: string;
  rawPayloadSnippet?: string;
  sourceJobId?: string;
}

/**
 * Ingestion Execution Log Schema (Collection: `ingestionRuns/{runId}`)
 */
export interface IngestionRun {
  id: string;
  sourceId: string;
  startedAt: string;
  completedAt: string | null;
  status: IngestionStatus;
  fetched: number;
  parsed: number;
  normalized: number;
  duplicates: number;
  published: number;
  rejected: number;
  errors: (IngestionErrorRecord | string)[];
}

/**
 * Saved Job Status Values
 */
export type SavedJobStatus = 'SAVED' | 'APPLIED' | 'ARCHIVED';

/**
 * User Saved Job Document Schema (Collection: `savedJobs/{uid_jobId}`)
 */
export interface SavedJob {
  id: string; // `${uid}_${jobId}`
  uid: string;
  jobId: string;
  notes?: string;
  status: SavedJobStatus;
  savedAt: string;
  updatedAt: string;
}

/**
 * Activity Event Types
 */
export type ActivityEventType =
  | 'signup'
  | 'login'
  | 'job_view'
  | 'job_save'
  | 'job_unsave'
  | 'application_click'
  | 'search'
  | 'filter_use'
  | 'job_report';

/**
 * Job / Activity Event Type
 */
export type JobEventType =
  | ActivityEventType
  | 'VIEWED'
  | 'CLICKED_APPLY'
  | 'SAVED'
  | 'REPORTED'
  | 'STATUS_CHANGED';

/**
 * Job Event / Analytics Document Schema (Collection: `jobEvents/{eventId}`)
 */
export interface JobEvent {
  id: string;
  eventType: JobEventType;
  uid: string | null;
  jobId?: string | null;
  sourceId?: string | null;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

/**
 * Job Report Reason
 */
export type JobReportReason =
  | 'EXPIRED'
  | 'MISLEADING'
  | 'SCAM'
  | 'INCORRECT_PAY'
  | 'BROKEN_LINK'
  | 'OTHER';

export type JobReportStatus = 'PENDING' | 'RESOLVED' | 'DISMISSED';

/**
 * Job Report / Community Flagging Schema (Collection: `jobReports/{reportId}`)
 */
export interface JobReport {
  id: string;
  jobId: string;
  reporterUid: string;
  reason: JobReportReason;
  details: string;
  status: JobReportStatus;
  createdAt: string;
  resolvedAt: string | null;
}

/**
 * System Configuration Schema (Collection: `systemConfig/{configId}`)
 */
export interface SystemConfig {
  id: string;
  configKey: string;
  value: Record<string, unknown>;
  updatedAt: string;
  updatedBy: string;
}/**
 * Aggregator Types Export
 */
export * from '../aggregator/types';
