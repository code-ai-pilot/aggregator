/**
 * Source Adapter Contract and Registry
 *
 * Defines the contract that every provider or external platform source adapter must implement.
 * The core pipeline interacts solely through this abstract contract, ensuring no source-specific
 * parsing or formatting logic leaks into the aggregator core.
 */

import {
  RawSourcePayload,
  RawJobItem,
  NormalizedJobItem,
  PipelineExecutionContext,
} from '../types';
import { SourceType } from '../../src/types';

/**
 * Result of an adapter's custom pre-validation check (optional).
 */
export interface AdapterValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
}

/**
 * Reusable Source Adapter Contract.
 * Every source (e.g., platforms, APIs, feeds) must implement this interface.
 */
export interface SourceAdapter<TRawPayload = unknown, TRawItem = unknown> {
  /** Unique permanent identifier for this source (e.g. 'src-outlier', 'src-dataannotation') */
  readonly sourceId: string;

  /** Human-readable display name for attribution (e.g. 'Outlier.ai', 'DataAnnotation Tech') */
  readonly sourceName: string;

  /** Domain or base URL */
  readonly baseUrl: string;

  /** Category/type of provider */
  readonly sourceType: SourceType | string;

  /**
   * STAGE 1: FETCH
   * Retrieves the raw payload from the external provider.
   * Keeps the raw data unparsed and unmodified.
   */
  fetch(context: PipelineExecutionContext): Promise<RawSourcePayload<TRawPayload>>;

  /**
   * STAGE 2: PARSE
   * Deconstructs the raw payload into individual raw job records.
   */
  parse(
    rawPayload: RawSourcePayload<TRawPayload>,
    context: PipelineExecutionContext
  ): Promise<RawJobItem<TRawItem>[]>;

  /**
   * STAGE 3: NORMALIZE
   * Maps a single raw item into standard NormalizedJobItem fields.
   * Must preserve source attribution and must NOT fabricate missing info.
   */
  normalize(
    rawItem: RawJobItem<TRawItem>,
    context: PipelineExecutionContext
  ): Promise<NormalizedJobItem>;

  /**
   * STAGE 4: VALIDATE (Optional hook)
   * Allows source-specific sanity checks before generic core validation.
   */
  validate?(
    normalizedItem: NormalizedJobItem,
    context: PipelineExecutionContext
  ): Promise<AdapterValidationResult>;
}

/**
 * Abstract Base Class providing common helper utilities for concrete source adapters.
 */
export abstract class BaseSourceAdapter<TRawPayload = unknown, TRawItem = unknown>
  implements SourceAdapter<TRawPayload, TRawItem>
{
  abstract readonly sourceId: string;
  abstract readonly sourceName: string;
  abstract readonly baseUrl: string;
  abstract readonly sourceType: SourceType | string;

  abstract fetch(context: PipelineExecutionContext): Promise<RawSourcePayload<TRawPayload>>;

  abstract parse(
    rawPayload: RawSourcePayload<TRawPayload>,
    context: PipelineExecutionContext
  ): Promise<RawJobItem<TRawItem>[]>;

  abstract normalize(
    rawItem: RawJobItem<TRawItem>,
    context: PipelineExecutionContext
  ): Promise<NormalizedJobItem>;

  /**
   * Default validation hook: passes by default. Subclasses may override for source-specific checks.
   */
  async validate(
    _normalizedItem: NormalizedJobItem,
    _context: PipelineExecutionContext
  ): Promise<AdapterValidationResult> {
    return { valid: true };
  }

  /**
   * Utility helper to create standard RawSourcePayload wrapper.
   */
  protected createRawPayload(
    rawContent: TRawPayload,
    contentType: RawSourcePayload['contentType'] = 'json',
    metadata?: Record<string, unknown>
  ): RawSourcePayload<TRawPayload> {
    return {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      fetchedAt: new Date().toISOString(),
      contentType,
      rawContent,
      metadata,
    };
  }

  /**
   * Utility helper to create standard RawJobItem wrapper.
   */
  protected createRawJobItem(
    sourceJobId: string,
    rawItem: TRawItem,
    metadata?: Record<string, unknown>
  ): RawJobItem<TRawItem> {
    return {
      sourceId: this.sourceId,
      sourceJobId,
      raw: rawItem,
      extractedAt: new Date().toISOString(),
      metadata,
    };
  }
}

/**
 * Registry for managing and retrieving active source adapters in the aggregator core.
 */
export class AdapterRegistry {
  private static instance: AdapterRegistry;
  private adapters: Map<string, SourceAdapter> = new Map();

  private constructor() {}

  public static getInstance(): AdapterRegistry {
    if (!AdapterRegistry.instance) {
      AdapterRegistry.instance = new AdapterRegistry();
    }
    return AdapterRegistry.instance;
  }

  /**
   * Registers a source adapter.
   */
  public register(adapter: SourceAdapter): void {
    if (this.adapters.has(adapter.sourceId)) {
      console.warn(`[AdapterRegistry] Overwriting existing adapter for source: ${adapter.sourceId}`);
    }
    this.adapters.set(adapter.sourceId, adapter);
  }

  /**
   * Retrieves an adapter by source ID.
   */
  public get(sourceId: string): SourceAdapter | undefined {
    return this.adapters.get(sourceId);
  }

  /**
   * Checks if an adapter is registered.
   */
  public has(sourceId: string): boolean {
    return this.adapters.has(sourceId);
  }

  /**
   * Returns all registered adapters.
   */
  public getAll(): SourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  /**
   * Clears all registered adapters (useful for testing).
   */
  public clear(): void {
    this.adapters.clear();
  }
}
