/**
 * Source A Skeleton Adapter Contract Reference
 *
 * Demonstrates the implementation pattern for an external platform or API feed adapter.
 * Kept isolated under aggregator/sources/source-a.
 */

import { BaseSourceAdapter } from '../../core/adapter';
import {
  RawSourcePayload,
  RawJobItem,
  NormalizedJobItem,
  PipelineExecutionContext,
} from '../../types';

export interface SourceARawJob {
  externalId: string;
  roleTitle: string;
  clientOrg: string;
  jobDetailsUrl: string;
  roleDescription: string;
  hourlyPayRate?: number;
  currency?: string;
  domainCategory?: string;
  tags?: string[];
  publicationDate?: string;
}

export interface SourceAPayload {
  status: string;
  results: SourceARawJob[];
}

export class SourceAAdapter extends BaseSourceAdapter<SourceAPayload, SourceARawJob> {
  public readonly sourceId = 'src_platform_a';
  public readonly sourceName = 'Source A Platform';
  public readonly baseUrl = 'https://api.source-a.example.com';
  public readonly sourceType = 'PLATFORM';

  public async fetch(_context: PipelineExecutionContext): Promise<RawSourcePayload<SourceAPayload>> {
    // Stub implementation - actual HTTP/API client will be implemented in future source integration prompts
    return this.createRawPayload({
      status: 'ok',
      results: [],
    });
  }

  public async parse(
    rawPayload: RawSourcePayload<SourceAPayload>,
    _context: PipelineExecutionContext
  ): Promise<RawJobItem<SourceARawJob>[]> {
    const rawJobs = rawPayload.rawContent?.results || [];
    return rawJobs.map((rawJob) => this.createRawJobItem(rawJob.externalId, rawJob));
  }

  public async normalize(
    rawItem: RawJobItem<SourceARawJob>,
    _context: PipelineExecutionContext
  ): Promise<NormalizedJobItem> {
    const raw = rawItem.raw;
    return {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      sourceJobId: raw.externalId || rawItem.sourceJobId,
      originalUrl: raw.jobDetailsUrl || '',
      title: raw.roleTitle || '',
      companyName: raw.clientOrg || this.sourceName,
      description: raw.roleDescription || '',
      category: raw.domainCategory || 'OTHER_RELEVANT',
      jobType: 'CONTRACT',
      workType: 'CONTRACT',
      locationType: 'REMOTE',
      compensationType: raw.hourlyPayRate ? 'HOURLY' : 'UNSPECIFIED',
      compensationMin: raw.hourlyPayRate || null,
      compensationMax: raw.hourlyPayRate || null,
      compensationCurrency: raw.currency || 'USD',
      skills: raw.tags || [],
      postedAt: raw.publicationDate || new Date().toISOString(),
      rawSourceData: raw,
    };
  }
}
