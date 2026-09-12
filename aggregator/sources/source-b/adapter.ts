/**
 * Source B Skeleton Adapter Contract Reference
 *
 * Demonstrates the implementation pattern for an RSS/Feed or structured JSON catalog adapter.
 * Kept isolated under aggregator/sources/source-b.
 */

import { BaseSourceAdapter } from '../../core/adapter';
import {
  RawSourcePayload,
  RawJobItem,
  NormalizedJobItem,
  PipelineExecutionContext,
} from '../../types';

export interface SourceBRawItem {
  id: string;
  headline: string;
  employer: string;
  applyUrl: string;
  bodyHtml: string;
  salaryMin?: number;
  salaryMax?: number;
  currencyCode?: string;
  categoryTag?: string;
  targetCountries?: string[];
  datePosted?: string;
}

export interface SourceBPayload {
  items: SourceBRawItem[];
}

export class SourceBAdapter extends BaseSourceAdapter<SourceBPayload, SourceBRawItem> {
  public readonly sourceId = 'src_board_b';
  public readonly sourceName = 'Source B Job Board';
  public readonly baseUrl = 'https://feed.source-b.example.com';
  public readonly sourceType = 'JOB_BOARD';

  public async fetch(_context: PipelineExecutionContext): Promise<RawSourcePayload<SourceBPayload>> {
    return this.createRawPayload({
      items: [],
    });
  }

  public async parse(
    rawPayload: RawSourcePayload<SourceBPayload>,
    _context: PipelineExecutionContext
  ): Promise<RawJobItem<SourceBRawItem>[]> {
    const items = rawPayload.rawContent?.items || [];
    return items.map((item) => this.createRawJobItem(item.id, item));
  }

  public async normalize(
    rawItem: RawJobItem<SourceBRawItem>,
    _context: PipelineExecutionContext
  ): Promise<NormalizedJobItem> {
    const raw = rawItem.raw;
    return {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      sourceJobId: raw.id || rawItem.sourceJobId,
      originalUrl: raw.applyUrl || '',
      title: raw.headline || '',
      companyName: raw.employer || this.sourceName,
      description: raw.bodyHtml || '',
      category: raw.categoryTag || 'OTHER_RELEVANT',
      jobType: 'HOURLY',
      workType: 'FLEXIBLE',
      locationType: 'REMOTE',
      eligibleCountries: raw.targetCountries || [],
      compensationType: raw.salaryMin ? 'HOURLY' : 'UNSPECIFIED',
      compensationMin: raw.salaryMin || null,
      compensationMax: raw.salaryMax || null,
      compensationCurrency: raw.currencyCode || 'USD',
      skills: [],
      postedAt: raw.datePosted || new Date().toISOString(),
      rawSourceData: raw,
    };
  }
}
