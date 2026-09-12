/**
 * Core Normalizer Component
 *
 * Coordinates STAGE 3: NORMALIZE.
 * Iterates through raw job records and calls the adapter's normalize() method for each item.
 * Preserves source identity, attribution, and original metadata.
 * Does NOT fabricate missing information.
 */

import {
  RawJobItem,
  NormalizedJobItem,
  StageResult,
  StageDiagnostic,
  PipelineExecutionContext,
} from '../types';
import { SourceAdapter } from './adapter';

export class CoreNormalizer {
  /**
   * Normalizes an array of raw items using the source adapter.
   */
  public async execute<TRawPayload, TRawItem>(
    adapter: SourceAdapter<TRawPayload, TRawItem>,
    rawItems: RawJobItem<TRawItem>[],
    context: PipelineExecutionContext
  ): Promise<StageResult<NormalizedJobItem[]>> {
    const startTime = Date.now();
    const errors: StageDiagnostic[] = [];
    const warnings: StageDiagnostic[] = [];
    const normalizedItems: NormalizedJobItem[] = [];

    for (let idx = 0; idx < rawItems.length; idx++) {
      const rawItem = rawItems[idx];

      try {
        const normalized = await adapter.normalize(rawItem, context);

        if (!normalized || typeof normalized !== 'object') {
          warnings.push({
            stage: 'NORMALIZE',
            code: 'NORMALIZE_EMPTY_RESULT',
            message: `Adapter returned empty normalized result for item at index ${idx}.`,
            sourceId: adapter.sourceId,
            sourceJobId: rawItem.sourceJobId,
            itemIndex: idx,
            timestamp: new Date().toISOString(),
          });
          continue;
        }

        // Guarantee source attribution integrity
        const guaranteedItem: NormalizedJobItem = {
          ...normalized,
          sourceId: adapter.sourceId,
          sourceName: adapter.sourceName,
          sourceJobId: normalized.sourceJobId || rawItem.sourceJobId,
          title: typeof normalized.title === 'string' ? normalized.title.trim() : '',
          companyName: typeof normalized.companyName === 'string' ? normalized.companyName.trim() : '',
          originalUrl: typeof normalized.originalUrl === 'string' ? normalized.originalUrl.trim() : '',
          description: typeof normalized.description === 'string' ? normalized.description.trim() : '',
          rawSourceData: normalized.rawSourceData !== undefined ? normalized.rawSourceData : rawItem.raw,
        };

        normalizedItems.push(guaranteedItem);
      } catch (err: any) {
        const errorMsg = err?.message || String(err);
        errors.push({
          stage: 'NORMALIZE',
          code: 'NORMALIZE_ITEM_ERROR',
          message: `Failed to normalize item '${rawItem.sourceJobId}' at index ${idx}: ${errorMsg}`,
          sourceId: adapter.sourceId,
          sourceJobId: rawItem.sourceJobId,
          itemIndex: idx,
          details: { rawError: errorMsg },
          timestamp: new Date().toISOString(),
        });
        // Continue processing remaining items
      }
    }

    return {
      stage: 'NORMALIZE',
      success: errors.length === 0 || normalizedItems.length > 0,
      data: normalizedItems,
      errors,
      warnings,
      durationMs: Date.now() - startTime,
    };
  }
}
