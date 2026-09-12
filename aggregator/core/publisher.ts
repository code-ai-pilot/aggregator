/**
 * Core Publisher Component
 *
 * Coordinates STAGE 7: PUBLISH & FIRESTORE sink.
 * Transforms deduplicated, validated records into the canonical Firestore Job domain model.
 * Dispatches jobs to a pluggable JobStoreSink (Firestore, local repository, or dry-run).
 */

import {
  DeduplicatedJobItem,
  PublishedJobResult,
  StageResult,
  StageDiagnostic,
  PipelineExecutionContext,
} from '../types';
import { Job, JobCategory, JobStatus, JobVerificationStatus, JobUrlStatus } from '../../src/types';

/**
 * Storage sink contract for publishing jobs to Firestore or other backends.
 */
export interface JobStoreSink {
  saveJob(job: Job, context: PipelineExecutionContext): Promise<{ isNew: boolean }>;
}

export class CorePublisher {
  private storeSink?: JobStoreSink;

  constructor(storeSink?: JobStoreSink) {
    this.storeSink = storeSink;
  }

  /**
   * Generates a clean URL slug from title and company.
   */
  public static generateSlug(title: string, company: string, sourceJobId: string): string {
    const combined = `${company}-${title}-${sourceJobId.slice(-6)}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return combined.slice(0, 100) || `job-${Date.now()}`;
  }

  /**
   * Publishes deduplicated job items into canonical Job records.
   */
  public async execute(
    deduplicatedItems: DeduplicatedJobItem[],
    context: PipelineExecutionContext
  ): Promise<StageResult<PublishedJobResult[]>> {
    const startTime = Date.now();
    const errors: StageDiagnostic[] = [];
    const warnings: StageDiagnostic[] = [];
    const publishedResults: PublishedJobResult[] = [];

    const nowIso = new Date().toISOString();

    for (let idx = 0; idx < deduplicatedItems.length; idx++) {
      const item = deduplicatedItems[idx];

      try {
        // Canonical Job ID format: `${sourceId}_${sourceJobId}` sanitized
        const cleanJobId = `${item.sourceId}_${item.sourceJobId}`
          .replace(/[^a-zA-Z0-9_-]/g, '_')
          .slice(0, 128);

        const slug = CorePublisher.generateSlug(item.title, item.companyName, item.sourceJobId);

        const canonicalJob: Job = {
          id: cleanJobId,
          title: item.title,
          slug,
          companyName: item.companyName,
          sourceId: item.sourceId,
          sourceName: item.sourceName,
          sourceJobId: item.sourceJobId,
          originalUrl: item.originalUrl,
          description: item.description,
          normalizedDescription: item.normalizedDescription || item.description,
          category: (item.assignedCategory || item.category || 'OTHER_RELEVANT') as JobCategory,
          subcategory: item.subcategory || '',
          jobType: item.jobType || 'CONTRACT',
          workType: item.workType || 'CONTRACT',
          locationType: item.locationType || 'REMOTE',
          eligibleCountries: Array.isArray(item.eligibleCountries) ? item.eligibleCountries : [],
          languages: Array.isArray(item.languages) ? item.languages : ['English'],
          experienceLevel: item.experienceLevel || 'ENTRY',
          compensationType: item.compensationType || 'HOURLY',
          compensationMin: typeof item.compensationMin === 'number' ? item.compensationMin : null,
          compensationMax: typeof item.compensationMax === 'number' ? item.compensationMax : null,
          compensationCurrency: item.compensationCurrency || 'USD',
          skills: Array.isArray(item.skills) ? item.skills : [],
          postedAt: item.postedAt || nowIso,
          discoveredAt: nowIso,
          updatedAt: nowIso,
          expiresAt: item.expiresAt || null,
          lastCheckedAt: nowIso,
          status: 'ACTIVE' as JobStatus,
          verificationStatus: 'VERIFIED' as JobVerificationStatus,
          urlStatus: 'VALID' as JobUrlStatus,
          contentHash: item.contentHash,
          createdAt: nowIso,
        };

        let isNew = true;

        // Persist to store if sink is configured and not in dry-run mode
        if (this.storeSink && !context.options?.dryRun) {
          const saveRes = await this.storeSink.saveJob(canonicalJob, context);
          isNew = saveRes.isNew;
        }

        publishedResults.push({
          job: canonicalJob,
          isNew,
          publishedAt: nowIso,
        });
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        errors.push({
          stage: 'PUBLISH',
          code: 'PUBLISH_ITEM_ERROR',
          message: `Failed to publish job '${item.sourceJobId}': ${errorMsg}`,
          sourceId: item.sourceId,
          sourceJobId: item.sourceJobId,
          itemIndex: idx,
          details: { rawError: errorMsg },
          timestamp: new Date().toISOString(),
        });
      }
    }

    return {
      stage: 'PUBLISH',
      success: errors.length === 0 || publishedResults.length > 0,
      data: publishedResults,
      errors,
      warnings,
      durationMs: Date.now() - startTime,
    };
  }
}
