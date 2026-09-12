/**
 * Modular Aggregator Pipeline Coordinator
 *
 * Connects and orchestrates the full pipeline:
 * EXTERNAL SOURCE → FETCH → PARSE → NORMALIZE → VALIDATE → CATEGORIZE → DEDUPLICATE → PUBLISH → FIRESTORE
 *
 * Guarantees:
 * 1. Independent execution per source (failure in source A never halts source B).
 * 2. Strict stage isolation and transparent diagnostic collection.
 * 3. Preserves source attribution and identity at every transition.
 */

import {
  PipelineExecutionContext,
  SourcePipelineResult,
  MultiSourcePipelineResult,
  SourcePipelineMetrics,
  StageDiagnostic,
  RejectedJobItem,
  PublishedJobResult,
} from '../types';
import { IngestionRun, IngestionStatus } from '../../src/types';
import { SourceAdapter } from './adapter';
import { CoreFetcher } from './fetcher';
import { CoreParser } from './parser';
import { CoreNormalizer } from './normalizer';
import { CoreValidator } from './validator';
import { CoreCategorizer, CategorizationStrategy } from './categorizer';
import { CoreDeduplicator, DeduplicationStrategy } from './deduplicator';
import { CorePublisher, JobStoreSink } from './publisher';
import { IngestionRunService, ingestionRunService } from './ingestionRunService';

export interface AggregatorPipelineOptions {
  limit?: number;
  dryRun?: boolean;
  skipDeduplication?: boolean;
  skipIngestionTracking?: boolean;
  categorizationStrategy?: CategorizationStrategy;
  deduplicationStrategy?: DeduplicationStrategy;
  storeSink?: JobStoreSink;
  runService?: IngestionRunService;
}

export class AggregatorPipeline {
  private fetcher: CoreFetcher;
  private parser: CoreParser;
  private normalizer: CoreNormalizer;
  private validator: CoreValidator;
  private categorizer: CoreCategorizer;
  private deduplicator: CoreDeduplicator;
  private publisher: CorePublisher;
  private runService: IngestionRunService;

  constructor(options?: AggregatorPipelineOptions) {
    this.fetcher = new CoreFetcher();
    this.parser = new CoreParser();
    this.normalizer = new CoreNormalizer();
    this.validator = new CoreValidator();
    this.categorizer = new CoreCategorizer(options?.categorizationStrategy);
    this.deduplicator = new CoreDeduplicator(options?.deduplicationStrategy);
    this.publisher = new CorePublisher(options?.storeSink);
    this.runService = options?.runService || ingestionRunService;
  }

  /**
   * Runs the complete pipeline for a single source adapter.
   * Isolates any thrown error so the calling environment remains stable.
   */
  public async runSource<TRawPayload, TRawItem>(
    adapter: SourceAdapter<TRawPayload, TRawItem>,
    options?: AggregatorPipelineOptions
  ): Promise<SourcePipelineResult> {
    const startedAt = new Date().toISOString();
    const startMs = Date.now();
    const runId = `run_${adapter.sourceId}_${Date.now()}`;
    const runService = options?.runService || this.runService;
    const shouldTrack = !options?.skipIngestionTracking;

    // 1. Concurrency and Ingestion Run Initialization
    let activeIngestionRun: IngestionRun | undefined;
    if (shouldTrack) {
      const startResult = await runService.startRun(adapter.sourceId, runId);
      if (!startResult.success) {
        const lockDiag: StageDiagnostic = {
          stage: 'FETCH',
          code: 'CONCURRENCY_LOCK_ACTIVE',
          message: startResult.error || `Source '${adapter.sourceId}' is already running an ingestion task. Overlapping execution prevented.`,
          sourceId: adapter.sourceId,
          timestamp: startedAt,
        };

        return {
          sourceId: adapter.sourceId,
          sourceName: adapter.sourceName,
          runId,
          success: false,
          startedAt,
          completedAt: new Date().toISOString(),
          metrics: {
            fetchedItems: 0,
            parsedItems: 0,
            normalizedItems: 0,
            validatedItems: 0,
            rejectedItems: 0,
            categorizedItems: 0,
            duplicateItems: 0,
            publishedItems: 0,
            totalDurationMs: Date.now() - startMs,
          },
          publishedJobs: [],
          rejectedJobs: [],
          stageResults: {},
          errors: [lockDiag],
          warnings: [],
        };
      }
      activeIngestionRun = startResult.run;
    }

    const context: PipelineExecutionContext = {
      runId,
      sourceId: adapter.sourceId,
      startedAt,
      options: {
        limit: options?.limit,
        dryRun: options?.dryRun,
        skipDeduplication: options?.skipDeduplication,
      },
    };

    const allErrors: StageDiagnostic[] = [];
    const allWarnings: StageDiagnostic[] = [];
    const stageResults: SourcePipelineResult['stageResults'] = {};
    let rejectedJobs: RejectedJobItem[] = [];
    let publishedJobs: PublishedJobResult[] = [];

    const metrics: SourcePipelineMetrics = {
      fetchedItems: 0,
      parsedItems: 0,
      normalizedItems: 0,
      validatedItems: 0,
      rejectedItems: 0,
      categorizedItems: 0,
      duplicateItems: 0,
      publishedItems: 0,
      totalDurationMs: 0,
    };

    try {
      // ==========================================
      // STAGE 1: FETCH
      // ==========================================
      const fetchResult = await this.fetcher.execute(adapter, context);
      stageResults.fetch = fetchResult as any;
      allErrors.push(...fetchResult.errors);
      allWarnings.push(...fetchResult.warnings);

      if (shouldTrack && fetchResult.errors.length > 0) {
        for (const err of fetchResult.errors) {
          await runService.recordError(runId, {
            step: 'FETCH',
            message: err.message,
            sourceJobId: err.sourceJobId,
          });
        }
      }

      if (!fetchResult.success) {
        if (shouldTrack) {
          activeIngestionRun = (await runService.completeRun(runId, 'FAILED', { fetched: 0 })) || undefined;
        }
        return this.buildResult(adapter, runId, startedAt, false, metrics, publishedJobs, rejectedJobs, stageResults, allErrors, allWarnings, startMs, activeIngestionRun);
      }

      metrics.fetchedItems = 1;
      if (shouldTrack) {
        await runService.updateCounters(runId, { fetched: 1 });
      }

      // ==========================================
      // STAGE 2: PARSE
      // ==========================================
      const parseResult = await this.parser.execute(adapter, fetchResult.data, context);
      stageResults.parse = parseResult as any;
      allErrors.push(...parseResult.errors);
      allWarnings.push(...parseResult.warnings);

      if (shouldTrack && parseResult.errors.length > 0) {
        for (const err of parseResult.errors) {
          await runService.recordError(runId, {
            step: 'PARSE',
            message: err.message,
            sourceJobId: err.sourceJobId,
          });
        }
      }

      if (!parseResult.success || parseResult.data.length === 0) {
        if (shouldTrack) {
          activeIngestionRun = (await runService.completeRun(runId, 'FAILED', { parsed: 0 })) || undefined;
        }
        return this.buildResult(adapter, runId, startedAt, false, metrics, publishedJobs, rejectedJobs, stageResults, allErrors, allWarnings, startMs, activeIngestionRun);
      }

      metrics.parsedItems = parseResult.data.length;
      if (shouldTrack) {
        await runService.updateCounters(runId, { parsed: parseResult.data.length });
      }

      // Apply optional batch limit
      const rawItemsToProcess = options?.limit
        ? parseResult.data.slice(0, options.limit)
        : parseResult.data;

      // ==========================================
      // STAGE 3: NORMALIZE
      // ==========================================
      const normalizeResult = await this.normalizer.execute(adapter, rawItemsToProcess, context);
      stageResults.normalize = normalizeResult;
      allErrors.push(...normalizeResult.errors);
      allWarnings.push(...normalizeResult.warnings);

      if (shouldTrack && normalizeResult.errors.length > 0) {
        for (const err of normalizeResult.errors) {
          await runService.recordError(runId, {
            step: 'NORMALIZE',
            message: err.message,
            sourceJobId: err.sourceJobId,
          });
        }
      }

      if (!normalizeResult.success || normalizeResult.data.length === 0) {
        if (shouldTrack) {
          activeIngestionRun = (await runService.completeRun(runId, 'FAILED', { normalized: 0 })) || undefined;
        }
        return this.buildResult(adapter, runId, startedAt, false, metrics, publishedJobs, rejectedJobs, stageResults, allErrors, allWarnings, startMs, activeIngestionRun);
      }

      metrics.normalizedItems = normalizeResult.data.length;
      if (shouldTrack) {
        await runService.updateCounters(runId, { normalized: normalizeResult.data.length });
      }

      // ==========================================
      // STAGE 4: VALIDATE
      // ==========================================
      const validateResult = await this.validator.execute(adapter, normalizeResult.data, context);
      stageResults.validate = validateResult;
      allErrors.push(...validateResult.errors);
      allWarnings.push(...validateResult.warnings);

      rejectedJobs = validateResult.data.rejected;
      metrics.validatedItems = validateResult.data.valid.length;
      metrics.rejectedItems = validateResult.data.rejected.length;

      if (shouldTrack) {
        await runService.updateCounters(runId, {
          rejected: validateResult.data.rejected.length,
        });

        for (const rej of validateResult.data.rejected) {
          await runService.recordError(runId, {
            step: 'VALIDATE',
            message: `Validation rejected (${rej.rejectionCode}): ${rej.reason}`,
            sourceJobId: rej.sourceJobId,
          });
        }
      }

      if (validateResult.data.valid.length === 0) {
        const finalStatus: IngestionStatus = validateResult.data.rejected.length > 0 ? 'PARTIAL' : 'SUCCESS';
        if (shouldTrack) {
          activeIngestionRun = (await runService.completeRun(runId, finalStatus, {
            published: 0,
            rejected: validateResult.data.rejected.length,
          })) || undefined;
        }
        return this.buildResult(adapter, runId, startedAt, true, metrics, publishedJobs, rejectedJobs, stageResults, allErrors, allWarnings, startMs, activeIngestionRun);
      }

      // ==========================================
      // STAGE 5: CATEGORIZE
      // ==========================================
      const categorizeResult = await this.categorizer.execute(validateResult.data.valid, context);
      stageResults.categorize = categorizeResult;
      allErrors.push(...categorizeResult.errors);
      allWarnings.push(...categorizeResult.warnings);

      metrics.categorizedItems = categorizeResult.data.length;

      // ==========================================
      // STAGE 6: DEDUPLICATE
      // ==========================================
      const dedupResult = await this.deduplicator.execute(categorizeResult.data, context);
      stageResults.deduplicate = dedupResult;
      allErrors.push(...dedupResult.errors);
      allWarnings.push(...dedupResult.warnings);

      metrics.duplicateItems = dedupResult.data.duplicates.length;
      if (shouldTrack) {
        await runService.updateCounters(runId, {
          duplicates: dedupResult.data.duplicates.length,
        });
      }

      const itemsToPublish = options?.skipDeduplication
        ? [...dedupResult.data.unique, ...dedupResult.data.duplicates]
        : dedupResult.data.unique;

      // ==========================================
      // STAGE 7: PUBLISH & SINK
      // ==========================================
      const publishResult = await this.publisher.execute(itemsToPublish, context);
      stageResults.publish = publishResult;
      allErrors.push(...publishResult.errors);
      allWarnings.push(...publishResult.warnings);

      if (shouldTrack && publishResult.errors.length > 0) {
        for (const err of publishResult.errors) {
          await runService.recordError(runId, {
            step: 'PUBLISH',
            message: err.message,
            sourceJobId: err.sourceJobId,
          });
        }
      }

      publishedJobs = publishResult.data;
      metrics.publishedItems = publishResult.data.length;

      // Final status determination for ingestion run
      if (shouldTrack) {
        const hasErrors = allErrors.length > 0 || rejectedJobs.length > 0;
        const finalStatus: IngestionStatus =
          publishedJobs.length === 0 && hasErrors
            ? 'FAILED'
            : hasErrors
            ? 'PARTIAL'
            : 'SUCCESS';

        activeIngestionRun = (await runService.completeRun(runId, finalStatus, {
          published: publishedJobs.length,
          rejected: rejectedJobs.length,
          duplicates: metrics.duplicateItems,
        })) || undefined;
      }

      return this.buildResult(
        adapter,
        runId,
        startedAt,
        allErrors.length === 0 || publishedJobs.length > 0,
        metrics,
        publishedJobs,
        rejectedJobs,
        stageResults,
        allErrors,
        allWarnings,
        startMs,
        activeIngestionRun
      );
    } catch (topErr: any) {
      const errorMsg = topErr?.message || String(topErr);
      allErrors.push({
        stage: 'FETCH',
        code: 'PIPELINE_UNCAUGHT_ERROR',
        message: `Uncaught error in aggregator pipeline for '${adapter.sourceId}': ${errorMsg}`,
        sourceId: adapter.sourceId,
        details: { rawError: errorMsg, stack: topErr?.stack },
        timestamp: new Date().toISOString(),
      });

      if (shouldTrack) {
        await runService.recordError(runId, {
          step: 'PIPELINE',
          message: `Uncaught exception: ${errorMsg}`,
        });
        activeIngestionRun = (await runService.completeRun(runId, 'FAILED', {
          fetched: metrics.fetchedItems,
          parsed: metrics.parsedItems,
          normalized: metrics.normalizedItems,
          duplicates: metrics.duplicateItems,
          published: metrics.publishedItems,
          rejected: metrics.rejectedItems,
        })) || undefined;
      }

      return this.buildResult(
        adapter,
        runId,
        startedAt,
        false,
        metrics,
        publishedJobs,
        rejectedJobs,
        stageResults,
        allErrors,
        allWarnings,
        startMs,
        activeIngestionRun
      );
    }
  }

  /**
   * Executes the pipeline across multiple source adapters with isolated error boundaries.
   */
  public async runSources(
    adapters: SourceAdapter[],
    options?: AggregatorPipelineOptions
  ): Promise<MultiSourcePipelineResult> {
    const startedAt = new Date().toISOString();
    const runId = `multi_run_${Date.now()}`;
    const sourceResults: Record<string, SourcePipelineResult> = {};

    let totalPublished = 0;
    let totalRejected = 0;
    let totalDuplicates = 0;
    let successfulSources = 0;
    let failedSources = 0;

    for (const adapter of adapters) {
      try {
        const result = await this.runSource(adapter, options);
        sourceResults[adapter.sourceId] = result;

        if (result.success) {
          successfulSources++;
        } else {
          failedSources++;
        }

        totalPublished += result.metrics.publishedItems;
        totalRejected += result.metrics.rejectedItems;
        totalDuplicates += result.metrics.duplicateItems;
      } catch (adapterErr: any) {
        failedSources++;
        console.error(`[AggregatorPipeline] Failed source '${adapter.sourceId}':`, adapterErr);
      }
    }

    return {
      runId,
      startedAt,
      completedAt: new Date().toISOString(),
      totalSources: adapters.length,
      successfulSources,
      failedSources,
      totalPublished,
      totalRejected,
      totalDuplicates,
      sourceResults,
    };
  }

  private buildResult(
    adapter: SourceAdapter,
    runId: string,
    startedAt: string,
    success: boolean,
    metrics: SourcePipelineMetrics,
    publishedJobs: PublishedJobResult[],
    rejectedJobs: RejectedJobItem[],
    stageResults: SourcePipelineResult['stageResults'],
    errors: StageDiagnostic[],
    warnings: StageDiagnostic[],
    startMs: number,
    ingestionRun?: IngestionRun
  ): SourcePipelineResult {
    metrics.totalDurationMs = Date.now() - startMs;
    return {
      sourceId: adapter.sourceId,
      sourceName: adapter.sourceName,
      runId,
      ingestionRunId: ingestionRun?.id || runId,
      ingestionRun,
      success,
      startedAt,
      completedAt: new Date().toISOString(),
      metrics,
      publishedJobs,
      rejectedJobs,
      stageResults,
      errors,
      warnings,
    };
  }
}

