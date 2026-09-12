/**
 * Aggregator Pipeline Type Definitions
 *
 * Defines contracts, intermediate representation stages, and result wrappers
 * for the modular aggregation pipeline:
 *
 * RAW SOURCE DATA → NORMALIZED DATA → VALIDATED DATA → DEDUPLICATED → PUBLISHED JOB
 */

import { Job, SourceType, JobCategory, ExperienceLevel, WorkType, LocationType, CompensationType, CurrencyCode } from '../src/types';

export type PipelineStageName =
  | 'FETCH'
  | 'PARSE'
  | 'NORMALIZE'
  | 'VALIDATE'
  | 'CATEGORIZE'
  | 'DEDUPLICATE'
  | 'PUBLISH'
  | 'PERSIST';

/**
 * Diagnostic record produced during any pipeline stage.
 */
export interface StageDiagnostic {
  stage: PipelineStageName;
  code: string;
  message: string;
  sourceId: string;
  sourceJobId?: string;
  itemIndex?: number;
  details?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Generic stage execution result.
 */
export interface StageResult<TOutput> {
  stage: PipelineStageName;
  success: boolean;
  data: TOutput;
  errors: StageDiagnostic[];
  warnings: StageDiagnostic[];
  durationMs: number;
}

/**
 * Context passed through all pipeline stages.
 */
export interface PipelineExecutionContext {
  runId: string;
  sourceId: string;
  startedAt: string;
  options?: {
    limit?: number;
    dryRun?: boolean;
    skipDeduplication?: boolean;
    forceRepublish?: boolean;
  };
}

/* ==========================================================================
   STAGE DATA TYPES
   ========================================================================== */

/**
 * 1. Raw payload returned directly from the source fetch operation.
 * Keeps raw source data completely isolated from domain structures.
 */
export interface RawSourcePayload<T = unknown> {
  sourceId: string;
  sourceName: string;
  fetchedAt: string;
  contentType: 'json' | 'xml' | 'html' | 'text' | 'rss' | 'custom';
  rawContent: T;
  statusCode?: number;
  headers?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

/**
 * 2. An individual raw job item extracted during the PARSE stage.
 */
export interface RawJobItem<T = unknown> {
  sourceId: string;
  sourceJobId: string;
  raw: T;
  extractedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * 3. Structured data produced after the NORMALIZE stage.
 * Represents clean, typed job data with preserved source attribution.
 * Does NOT fabricate missing information.
 */
export interface NormalizedJobItem {
  sourceId: string;
  sourceName: string;
  sourceJobId: string;
  originalUrl: string;
  title: string;
  companyName: string;
  description: string;
  normalizedDescription?: string;
  category?: JobCategory | string;
  subcategory?: string;
  jobType?: string;
  workType?: WorkType | string;
  locationType?: LocationType | string;
  eligibleCountries?: string[];
  languages?: string[];
  experienceLevel?: ExperienceLevel | string;
  compensationType?: CompensationType | string;
  compensationMin?: number | null;
  compensationMax?: number | null;
  compensationCurrency?: CurrencyCode | string;
  skills?: string[];
  postedAt?: string;
  expiresAt?: string | null;
  rawSourceData?: unknown;
}

/**
 * 4. Data verified during the VALIDATE stage.
 * Guarantees required fields (title, companyName, originalUrl, valid bounds)
 * are present and strictly compliant without silent conversions.
 */
export interface ValidatedJobItem extends NormalizedJobItem {
  isValid: true;
  validatedAt: string;
  validationRulesPassed: string[];
}

/**
 * Rejection record for an item that fails validation.
 */
export interface RejectedJobItem {
  sourceId: string;
  sourceJobId: string;
  itemIndex?: number;
  reason: string;
  rejectionCode: string;
  failedFields: string[];
  normalizedData: NormalizedJobItem;
  rejectedAt: string;
}

/**
 * 5. Job after the CATEGORIZE stage.
 */
export interface CategorizedJobItem extends ValidatedJobItem {
  assignedCategory: JobCategory | string;
  categorizationConfidence?: number;
  categorizationSource: 'ADAPTER' | 'RULE_MATCH' | 'DEFAULT_FALLBACK';
}

/**
 * 6. Job after the DEDUPLICATE stage.
 */
export interface DeduplicatedJobItem extends CategorizedJobItem {
  contentHash: string;
  isDuplicate: boolean;
  duplicateOfId?: string;
  deduplicationKey: string;
}

/**
 * 7. Canonical published job ready for database persistence.
 */
export interface PublishedJobResult {
  job: Job;
  isNew: boolean;
  publishedAt: string;
}

/* ==========================================================================
   PIPELINE SUMMARY AND CONTRACTS
   ========================================================================== */

/**
 * Aggregated execution metrics for a single source pipeline run.
 */
export interface SourcePipelineMetrics {
  fetchedItems: number;
  parsedItems: number;
  normalizedItems: number;
  validatedItems: number;
  rejectedItems: number;
  categorizedItems: number;
  duplicateItems: number;
  publishedItems: number;
  totalDurationMs: number;
}

/**
 * Final execution report for an individual source run.
 */
export interface SourcePipelineResult {
  sourceId: string;
  sourceName: string;
  runId: string;
  ingestionRunId?: string;
  ingestionRun?: import('../src/types').IngestionRun;
  success: boolean;
  startedAt: string;
  completedAt: string;
  metrics: SourcePipelineMetrics;
  publishedJobs: PublishedJobResult[];
  rejectedJobs: RejectedJobItem[];
  stageResults: {
    fetch?: StageResult<RawSourcePayload>;
    parse?: StageResult<RawJobItem[]>;
    normalize?: StageResult<NormalizedJobItem[]>;
    validate?: StageResult<{ valid: ValidatedJobItem[]; rejected: RejectedJobItem[] }>;
    categorize?: StageResult<CategorizedJobItem[]>;
    deduplicate?: StageResult<{ unique: DeduplicatedJobItem[]; duplicates: DeduplicatedJobItem[] }>;
    publish?: StageResult<PublishedJobResult[]>;
  };
  errors: StageDiagnostic[];
  warnings: StageDiagnostic[];
}

/**
 * Multi-source aggregation execution summary.
 */
export interface MultiSourcePipelineResult {
  runId: string;
  startedAt: string;
  completedAt: string;
  totalSources: number;
  successfulSources: number;
  failedSources: number;
  totalPublished: number;
  totalRejected: number;
  totalDuplicates: number;
  sourceResults: Record<string, SourcePipelineResult>;
}
