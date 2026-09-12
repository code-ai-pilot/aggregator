/**
 * Core Categorizer Component
 *
 * Coordinates STAGE 5: CATEGORIZE.
 * Provides the pluggable categorization stage in the pipeline.
 * Preserves adapter-provided categories and prepares the structure for future rule-based or classification engines.
 */

import {
  ValidatedJobItem,
  CategorizedJobItem,
  StageResult,
  StageDiagnostic,
  PipelineExecutionContext,
} from '../types';
import { JobCategory, JOB_CATEGORIES } from '../../src/types';

export interface CategorizationStrategy {
  categorize(item: ValidatedJobItem, context: PipelineExecutionContext): Promise<{
    category: JobCategory | string;
    confidence?: number;
    source: 'ADAPTER' | 'RULE_MATCH' | 'DEFAULT_FALLBACK';
  }>;
}

export class CoreCategorizer {
  private customStrategy?: CategorizationStrategy;

  constructor(strategy?: CategorizationStrategy) {
    this.customStrategy = strategy;
  }

  /**
   * Categorizes an array of validated job items.
   */
  public async execute(
    validatedItems: ValidatedJobItem[],
    context: PipelineExecutionContext
  ): Promise<StageResult<CategorizedJobItem[]>> {
    const startTime = Date.now();
    const errors: StageDiagnostic[] = [];
    const warnings: StageDiagnostic[] = [];
    const categorizedItems: CategorizedJobItem[] = [];

    const knownCategories = new Set(JOB_CATEGORIES.map((c) => c.id));

    for (let idx = 0; idx < validatedItems.length; idx++) {
      const item = validatedItems[idx];

      try {
        if (this.customStrategy) {
          const result = await this.customStrategy.categorize(item, context);
          categorizedItems.push({
            ...item,
            assignedCategory: result.category,
            category: result.category,
            categorizationConfidence: result.confidence ?? 1.0,
            categorizationSource: result.source,
          });
          continue;
        }

        // Default Stage Categorization: Respect category if provided by adapter and valid
        if (item.category && knownCategories.has(item.category as JobCategory)) {
          categorizedItems.push({
            ...item,
            assignedCategory: item.category,
            categorizationConfidence: 1.0,
            categorizationSource: 'ADAPTER',
          });
        } else if (item.category && typeof item.category === 'string' && item.category.trim()) {
          // Non-standard category string preserved as-is
          categorizedItems.push({
            ...item,
            assignedCategory: item.category.trim(),
            categorizationConfidence: 0.8,
            categorizationSource: 'ADAPTER',
          });
        } else {
          // Default baseline fallback category without fabricating unwarranted domain classification
          categorizedItems.push({
            ...item,
            assignedCategory: 'OTHER_RELEVANT',
            category: 'OTHER_RELEVANT',
            categorizationConfidence: 0.5,
            categorizationSource: 'DEFAULT_FALLBACK',
          });
        }
      } catch (err: any) {
        warnings.push({
          stage: 'CATEGORIZE',
          code: 'CATEGORIZATION_ERROR',
          message: `Categorization hook failed for item '${item.sourceJobId}': ${err?.message}`,
          sourceId: item.sourceId,
          sourceJobId: item.sourceJobId,
          itemIndex: idx,
          timestamp: new Date().toISOString(),
        });

        categorizedItems.push({
          ...item,
          assignedCategory: item.category || 'OTHER_RELEVANT',
          category: item.category || 'OTHER_RELEVANT',
          categorizationSource: 'DEFAULT_FALLBACK',
        });
      }
    }

    return {
      stage: 'CATEGORIZE',
      success: true,
      data: categorizedItems,
      errors,
      warnings,
      durationMs: Date.now() - startTime,
    };
  }
}
