/**
 * Core Parser Component
 *
 * Coordinates STAGE 2: PARSE.
 * Invokes the source adapter's parse method to transform the raw payload into discrete RawJobItem records.
 * Keeps raw data unnormalized and tracks parsing metrics and errors.
 */

import {
  RawSourcePayload,
  RawJobItem,
  StageResult,
  StageDiagnostic,
  PipelineExecutionContext,
} from '../types';
import { SourceAdapter } from './adapter';

export class CoreParser {
  /**
   * Parses the raw source payload into individual raw job records using the adapter.
   */
  public async execute<TRawPayload, TRawItem>(
    adapter: SourceAdapter<TRawPayload, TRawItem>,
    rawPayload: RawSourcePayload<TRawPayload>,
    context: PipelineExecutionContext
  ): Promise<StageResult<RawJobItem<TRawItem>[]>> {
    const startTime = Date.now();
    const errors: StageDiagnostic[] = [];
    const warnings: StageDiagnostic[] = [];

    try {
      const rawItems = await adapter.parse(rawPayload, context);

      if (!Array.isArray(rawItems)) {
        errors.push({
          stage: 'PARSE',
          code: 'PARSE_INVALID_OUTPUT_TYPE',
          message: `Adapter parse() for '${adapter.sourceId}' did not return an array.`,
          sourceId: adapter.sourceId,
          timestamp: new Date().toISOString(),
        });

        return {
          stage: 'PARSE',
          success: false,
          data: [],
          errors,
          warnings,
          durationMs: Date.now() - startTime,
        };
      }

      // Check item-level identity & structure
      const validItems: RawJobItem<TRawItem>[] = [];
      rawItems.forEach((item, idx) => {
        if (!item || typeof item !== 'object') {
          warnings.push({
            stage: 'PARSE',
            code: 'PARSE_NULL_ITEM',
            message: `Skipping null or non-object item at index ${idx}.`,
            sourceId: adapter.sourceId,
            itemIndex: idx,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        if (!item.sourceJobId) {
          warnings.push({
            stage: 'PARSE',
            code: 'PARSE_MISSING_SOURCE_JOB_ID',
            message: `Item at index ${idx} is missing sourceJobId.`,
            sourceId: adapter.sourceId,
            itemIndex: idx,
            timestamp: new Date().toISOString(),
          });
        }

        // Guarantee source identity preservation
        const cleanItem: RawJobItem<TRawItem> = {
          sourceId: adapter.sourceId,
          sourceJobId: item.sourceJobId || `unidentified_${idx}`,
          raw: item.raw !== undefined ? item.raw : (item as any),
          extractedAt: item.extractedAt || new Date().toISOString(),
          metadata: item.metadata,
        };

        validItems.push(cleanItem);
      });

      return {
        stage: 'PARSE',
        success: true,
        data: validItems,
        errors,
        warnings,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      errors.push({
        stage: 'PARSE',
        code: 'PARSE_EXECUTION_ERROR',
        message: `Failed to parse payload for source '${adapter.sourceId}': ${errorMsg}`,
        sourceId: adapter.sourceId,
        details: { rawError: errorMsg, stack: err?.stack },
        timestamp: new Date().toISOString(),
      });

      return {
        stage: 'PARSE',
        success: false,
        data: [],
        errors,
        warnings,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
