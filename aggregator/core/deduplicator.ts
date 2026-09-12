/**
 * Core Deduplicator Component
 *
 * Coordinates STAGE 6: DEDUPLICATE.
 * Computes deterministic content hashes and composite deduplication keys.
 * Separates unique and duplicate listings within the ingestion batch.
 */

import {
  CategorizedJobItem,
  DeduplicatedJobItem,
  StageResult,
  StageDiagnostic,
  PipelineExecutionContext,
} from '../types';

export interface DeduplicationStrategy {
  isDuplicate(
    item: CategorizedJobItem,
    context: PipelineExecutionContext
  ): Promise<{ isDuplicate: boolean; duplicateOfId?: string; contentHash: string }>;
}

export interface DeduplicationOutput {
  unique: DeduplicatedJobItem[];
  duplicates: DeduplicatedJobItem[];
}

export class CoreDeduplicator {
  private customStrategy?: DeduplicationStrategy;

  constructor(strategy?: DeduplicationStrategy) {
    this.customStrategy = strategy;
  }

  /**
   * Generates a deterministic content hash from title, company, and url.
   */
  public static generateContentHash(title: string, companyName: string, url: string): string {
    const rawKey = `${companyName.toLowerCase().trim()}|${title.toLowerCase().trim()}|${url.toLowerCase().trim()}`;
    let hash = 0;
    for (let i = 0; i < rawKey.length; i++) {
      const char = rawKey.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Deduplicates an array of categorized job items.
   */
  public async execute(
    categorizedItems: CategorizedJobItem[],
    context: PipelineExecutionContext
  ): Promise<StageResult<DeduplicationOutput>> {
    const startTime = Date.now();
    const errors: StageDiagnostic[] = [];
    const warnings: StageDiagnostic[] = [];
    const unique: DeduplicatedJobItem[] = [];
    const duplicates: DeduplicatedJobItem[] = [];

    const seenSourceKeys = new Set<string>();
    const seenContentHashes = new Set<string>();

    for (let idx = 0; idx < categorizedItems.length; idx++) {
      const item = categorizedItems[idx];
      const sourceKey = `${item.sourceId}_${item.sourceJobId}`;
      const contentHash = CoreDeduplicator.generateContentHash(
        item.title,
        item.companyName,
        item.originalUrl
      );

      try {
        if (this.customStrategy) {
          const customResult = await this.customStrategy.isDuplicate(item, context);
          const dedupItem: DeduplicatedJobItem = {
            ...item,
            contentHash: customResult.contentHash || contentHash,
            isDuplicate: customResult.isDuplicate,
            duplicateOfId: customResult.duplicateOfId,
            deduplicationKey: sourceKey,
          };

          if (customResult.isDuplicate) {
            duplicates.push(dedupItem);
          } else {
            unique.push(dedupItem);
          }
          continue;
        }

        // Default In-Batch Deduplication Check
        let isDup = false;
        let dupReason = '';

        if (seenSourceKeys.has(sourceKey)) {
          isDup = true;
          dupReason = `Duplicate source job key: ${sourceKey}`;
        } else if (seenContentHashes.has(contentHash)) {
          isDup = true;
          dupReason = `Duplicate content hash: ${contentHash}`;
        }

        const dedupItem: DeduplicatedJobItem = {
          ...item,
          contentHash,
          isDuplicate: isDup,
          deduplicationKey: sourceKey,
        };

        if (isDup) {
          duplicates.push(dedupItem);
          warnings.push({
            stage: 'DEDUPLICATE',
            code: 'JOB_DUPLICATE_IDENTIFIED',
            message: `Identified duplicate job '${item.sourceJobId}': ${dupReason}`,
            sourceId: item.sourceId,
            sourceJobId: item.sourceJobId,
            itemIndex: idx,
            timestamp: new Date().toISOString(),
          });
        } else {
          seenSourceKeys.add(sourceKey);
          seenContentHashes.add(contentHash);
          unique.push(dedupItem);
        }
      } catch (err: any) {
        warnings.push({
          stage: 'DEDUPLICATE',
          code: 'DEDUPLICATION_ERROR',
          message: `Deduplication failed for item '${item.sourceJobId}': ${err?.message}`,
          sourceId: item.sourceId,
          sourceJobId: item.sourceJobId,
          itemIndex: idx,
          timestamp: new Date().toISOString(),
        });
        // Default to unique on internal error
        unique.push({
          ...item,
          contentHash,
          isDuplicate: false,
          deduplicationKey: sourceKey,
        });
      }
    }

    return {
      stage: 'DEDUPLICATE',
      success: true,
      data: { unique, duplicates },
      errors,
      warnings,
      durationMs: Date.now() - startTime,
    };
  }
}
