/**
 * Core Fetcher Component
 *
 * Coordinates STAGE 1: FETCH.
 * Executes the adapter's fetch method, monitors execution time, and produces a structured StageResult.
 * Does not contain source-specific logic or endpoints.
 */

import {
  RawSourcePayload,
  StageResult,
  StageDiagnostic,
  PipelineExecutionContext,
} from '../types';
import { SourceAdapter } from './adapter';

export class CoreFetcher {
  /**
   * Fetches raw content from the provided source adapter.
   */
  public async execute<TRawPayload, TRawItem>(
    adapter: SourceAdapter<TRawPayload, TRawItem>,
    context: PipelineExecutionContext
  ): Promise<StageResult<RawSourcePayload<TRawPayload>>> {
    const startTime = Date.now();
    const errors: StageDiagnostic[] = [];
    const warnings: StageDiagnostic[] = [];

    try {
      const rawPayload = await adapter.fetch(context);

      if (!rawPayload || rawPayload.rawContent === undefined || rawPayload.rawContent === null) {
        errors.push({
          stage: 'FETCH',
          code: 'FETCH_EMPTY_PAYLOAD',
          message: `Source adapter for '${adapter.sourceId}' returned an empty or undefined payload.`,
          sourceId: adapter.sourceId,
          timestamp: new Date().toISOString(),
        });

        return {
          stage: 'FETCH',
          success: false,
          data: rawPayload || {
            sourceId: adapter.sourceId,
            sourceName: adapter.sourceName,
            fetchedAt: new Date().toISOString(),
            contentType: 'custom',
            rawContent: null as any,
          },
          errors,
          warnings,
          durationMs: Date.now() - startTime,
        };
      }

      // Enforce source attribution consistency
      if (rawPayload.sourceId !== adapter.sourceId) {
        warnings.push({
          stage: 'FETCH',
          code: 'FETCH_SOURCE_ID_MISMATCH',
          message: `Payload sourceId '${rawPayload.sourceId}' does not match adapter sourceId '${adapter.sourceId}'. Aligning to adapter.`,
          sourceId: adapter.sourceId,
          timestamp: new Date().toISOString(),
        });
        rawPayload.sourceId = adapter.sourceId;
      }

      return {
        stage: 'FETCH',
        success: true,
        data: rawPayload,
        errors,
        warnings,
        durationMs: Date.now() - startTime,
      };
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      errors.push({
        stage: 'FETCH',
        code: 'FETCH_EXECUTION_ERROR',
        message: `Failed to fetch from source '${adapter.sourceId}': ${errorMsg}`,
        sourceId: adapter.sourceId,
        details: { rawError: errorMsg, stack: err?.stack },
        timestamp: new Date().toISOString(),
      });

      return {
        stage: 'FETCH',
        success: false,
        data: {
          sourceId: adapter.sourceId,
          sourceName: adapter.sourceName,
          fetchedAt: new Date().toISOString(),
          contentType: 'custom',
          rawContent: null as any,
        },
        errors,
        warnings,
        durationMs: Date.now() - startTime,
      };
    }
  }
}
