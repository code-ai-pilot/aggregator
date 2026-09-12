/**
 * Source C Skeleton Adapter Contract Reference
 *
 * Demonstrates the implementation pattern for a Direct Lab / AI evaluation provider adapter.
 * Kept isolated under aggregator/sources/source-c.
 */

import { BaseSourceAdapter } from '../../core/adapter';
import {
  RawSourcePayload,
  RawJobItem,
  NormalizedJobItem,
  PipelineExecutionContext,
} from '../../types';

export interface SourceCRawProject {
  projectCode: string;
  projectTitle: string;
  partnerLab: string;
  applicationLink: string;
  scopeOverview: string;
  ratePerHour?: number;
  currency?: string;
  requiredSkills?: string[];
  createdTimestamp?: string;
}

export interface SourceCPayload {
  data: {
    projects: SourceCRawProject[];
  };
}

export class SourceCAdapter extends BaseSourceAdapter<SourceCPayload, SourceCRawProject> {
  public readonly sourceId = 'src_lab_c';
  public readonly sourceName = 'Source C AI Lab';
  public readonly baseUrl = 'https://portal.source-c.example.com';
  public readonly sourceType = 'LAB_PORTAL';

  public async fetch(_context: PipelineExecutionContext): Promise<RawSourcePayload<SourceCPayload>> {
    return this.createRawPayload({
      data: {
        projects: [],
      },
    });
  }

  public async parse(
    rawPayload: RawSourcePayload<SourceCPayload>,
    _context: PipelineExecutionContext
  ): Promise<RawJobItem<SourceCRawProject>[]> {
    const projects = rawPayload.rawContent?.data?.projects || [];
    return projects.map((proj) => this.createRawJobItem(proj.projectCode, proj));
  }

  public async normalize(
    rawItem: RawJobItem<SourceCRawProject>,
    _context: PipelineExecutionContext
  ): Promise<NormalizedJobItem> {
    const raw = rawItem.raw;
    return {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      sourceJobId: raw.projectCode || rawItem.sourceJobId,
      originalUrl: raw.applicationLink || '',
      title: raw.projectTitle || '',
      companyName: raw.partnerLab || this.sourceName,
      description: raw.scopeOverview || '',
      category: 'AI_RESPONSE_EVALUATION',
      jobType: 'CONTRACT',
      workType: 'FLEXIBLE',
      locationType: 'REMOTE',
      compensationType: raw.ratePerHour ? 'HOURLY' : 'UNSPECIFIED',
      compensationMin: raw.ratePerHour || null,
      compensationMax: raw.ratePerHour || null,
      compensationCurrency: raw.currency || 'USD',
      skills: raw.requiredSkills || [],
      postedAt: raw.createdTimestamp || new Date().toISOString(),
      rawSourceData: raw,
    };
  }
}
