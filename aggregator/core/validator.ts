/**
 * Core Validator Component
 *
 * Coordinates STAGE 4: VALIDATE.
 * Validates normalized job items against strict data integrity and quality rules.
 * Does NOT silently convert invalid data into valid data.
 * Rejection records clearly capture failed fields and reasons.
 */

import {
  NormalizedJobItem,
  ValidatedJobItem,
  RejectedJobItem,
  StageResult,
  StageDiagnostic,
  PipelineExecutionContext,
} from '../types';
import { SourceAdapter } from './adapter';

export interface ValidationOutput {
  valid: ValidatedJobItem[];
  rejected: RejectedJobItem[];
}

export class CoreValidator {
  /**
   * Validates an array of normalized items.
   */
  public async execute<TRawPayload, TRawItem>(
    adapter: SourceAdapter<TRawPayload, TRawItem>,
    normalizedItems: NormalizedJobItem[],
    context: PipelineExecutionContext
  ): Promise<StageResult<ValidationOutput>> {
    const startTime = Date.now();
    const errors: StageDiagnostic[] = [];
    const warnings: StageDiagnostic[] = [];
    const valid: ValidatedJobItem[] = [];
    const rejected: RejectedJobItem[] = [];

    for (let idx = 0; idx < normalizedItems.length; idx++) {
      const item = normalizedItems[idx];
      const failedFields: string[] = [];
      const rejectionReasons: string[] = [];
      const passedRules: string[] = [];

      // 1. Adapter-specific validation hook
      if (adapter.validate) {
        try {
          const adapterCheck = await adapter.validate(item, context);
          if (!adapterCheck.valid) {
            failedFields.push('adapter_validation');
            rejectionReasons.push(...(adapterCheck.errors || ['Failed source-specific validation rules']));
          } else {
            passedRules.push('adapter_validation');
          }
        } catch (err: any) {
          warnings.push({
            stage: 'VALIDATE',
            code: 'VALIDATE_ADAPTER_HOOK_ERROR',
            message: `Adapter validation hook threw error for '${item.sourceJobId}': ${err?.message}`,
            sourceId: adapter.sourceId,
            sourceJobId: item.sourceJobId,
            itemIndex: idx,
            timestamp: new Date().toISOString(),
          });
        }
      }

      // 2. Structural & Required Field Validations
      if (!item.title || item.title.trim().length < 2) {
        failedFields.push('title');
        rejectionReasons.push('Job title is missing or less than 2 characters');
      } else {
        passedRules.push('title_required');
      }

      if (!item.companyName || item.companyName.trim().length < 1) {
        failedFields.push('companyName');
        rejectionReasons.push('Company or provider name is missing');
      } else {
        passedRules.push('company_name_required');
      }

      if (!item.sourceJobId || item.sourceJobId.trim().length < 1) {
        failedFields.push('sourceJobId');
        rejectionReasons.push('Source job ID is missing');
      } else {
        passedRules.push('source_job_id_required');
      }

      if (!item.originalUrl || !this.isValidHttpUrl(item.originalUrl)) {
        failedFields.push('originalUrl');
        rejectionReasons.push('Original URL is missing or not a valid http/https URL');
      } else {
        passedRules.push('valid_url');
      }

      // 3. Compensation Bounds Sanity Check
      if (
        item.compensationMin !== null &&
        item.compensationMin !== undefined &&
        (isNaN(item.compensationMin) || item.compensationMin < 0)
      ) {
        failedFields.push('compensationMin');
        rejectionReasons.push('Minimum compensation cannot be negative or NaN');
      }

      if (
        item.compensationMax !== null &&
        item.compensationMax !== undefined &&
        (isNaN(item.compensationMax) || item.compensationMax < 0)
      ) {
        failedFields.push('compensationMax');
        rejectionReasons.push('Maximum compensation cannot be negative or NaN');
      }

      if (
        item.compensationMin !== null &&
        item.compensationMin !== undefined &&
        item.compensationMax !== null &&
        item.compensationMax !== undefined &&
        item.compensationMin > item.compensationMax
      ) {
        failedFields.push('compensation_range');
        rejectionReasons.push(`Minimum compensation (${item.compensationMin}) exceeds maximum (${item.compensationMax})`);
      }

      // 4. Determine validity
      if (failedFields.length === 0) {
        const validatedItem: ValidatedJobItem = {
          ...item,
          isValid: true,
          validatedAt: new Date().toISOString(),
          validationRulesPassed: passedRules,
        };
        valid.push(validatedItem);
      } else {
        const rejectionRecord: RejectedJobItem = {
          sourceId: adapter.sourceId,
          sourceJobId: item.sourceJobId || `unidentified_${idx}`,
          itemIndex: idx,
          reason: rejectionReasons.join('; '),
          rejectionCode: failedFields.join('_').toUpperCase(),
          failedFields,
          normalizedData: item,
          rejectedAt: new Date().toISOString(),
        };
        rejected.push(rejectionRecord);

        warnings.push({
          stage: 'VALIDATE',
          code: 'JOB_VALIDATION_REJECTED',
          message: `Job '${item.sourceJobId}' rejected: ${rejectionRecord.reason}`,
          sourceId: adapter.sourceId,
          sourceJobId: item.sourceJobId,
          itemIndex: idx,
          details: { failedFields, rejectionReasons },
          timestamp: new Date().toISOString(),
        });
      }
    }

    return {
      stage: 'VALIDATE',
      success: true,
      data: { valid, rejected },
      errors,
      warnings,
      durationMs: Date.now() - startTime,
    };
  }

  /**
   * Helper to strictly validate HTTP/HTTPS URLs.
   */
  private isValidHttpUrl(urlString: string): boolean {
    try {
      const parsed = new URL(urlString);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
