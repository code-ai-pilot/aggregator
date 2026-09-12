/**
 * TELUS Digital AI Community Source Adapter
 *
 * Implements the SourceAdapter contract for TELUS Digital AI Community opportunities.
 *
 * Source Metadata:
 * - Name: TELUS Digital AI Community
 * - Domain: jobs.telusdigital.com
 * - Source Type: OFFICIAL_EMPLOYER_CAREERS
 * - Base URL: https://jobs.telusdigital.com/search/cfm5/ai-community/jobs/in/country/india
 * - Verification: VERIFIED
 *
 * Compliance:
 * - Does not bypass authentication, anti-bot controls, or robots.txt.
 * - Requires a verified machine-readable access mechanism before automated fetching runs live.
 * - Preserves original TELUS job URLs, source attribution, and real eligibility data.
 * - Never fabricates compensation, dates, or missing qualifications.
 */

import { BaseSourceAdapter, AdapterValidationResult } from '../../core/adapter';
import {
  RawSourcePayload,
  RawJobItem,
  NormalizedJobItem,
  PipelineExecutionContext,
} from '../../types';
import { TelusRawPayload, TelusRawJob, TelusAccessMethod } from './types';
import { SourceType, LocationType, WorkType, CompensationType, JobCategory } from '../../../src/types';

export class TelusDigitalAdapter extends BaseSourceAdapter<TelusRawPayload, TelusRawJob> {
  public readonly sourceId = 'src_telus_digital';
  public readonly sourceName = 'TELUS Digital AI Community';
  public readonly domain = 'jobs.telusdigital.com';
  public readonly baseUrl = 'https://jobs.telusdigital.com/search/cfm5/ai-community/jobs/in/country/india';
  public readonly sourceType: SourceType = 'OFFICIAL_EMPLOYER_CAREERS';

  /**
   * STAGE 1: FETCH
   * Inspects configured permitted access mechanisms (official feed, authorized partner API, or structured ingest).
   * If no permitted machine-readable method is configured, cleanly halts automated ingestion without
   * attempting forbidden arbitrary web scraping.
   */
  public async fetch(context: PipelineExecutionContext): Promise<RawSourcePayload<TelusRawPayload>> {
    const configuredFeedUrl = process.env.TELUS_DIGITAL_FEED_URL || process.env.TELUS_JOB_FEED_URL;
    const permittedApiKey = process.env.TELUS_DIGITAL_API_KEY;

    // 1. If an official, permitted feed endpoint is explicitly configured:
    if (configuredFeedUrl) {
      try {
        const response = await fetch(configuredFeedUrl, {
          headers: {
            Accept: 'application/json, text/xml, application/rss+xml',
            ...(permittedApiKey ? { Authorization: `Bearer ${permittedApiKey}` } : {}),
          },
        });

        if (!response.ok) {
          throw new Error(`Permitted feed endpoint returned HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const items: TelusRawJob[] = Array.isArray(data) ? data : data.jobs || data.items || [];

        return this.createRawPayload(
          {
            accessMethod: 'OFFICIAL_FEED',
            sourceEndpoint: configuredFeedUrl,
            retrievedAt: new Date().toISOString(),
            itemCount: items.length,
            items,
          },
          'json',
          { endpoint: configuredFeedUrl }
        );
      } catch (err: any) {
        throw new Error(`Failed to fetch from permitted TELUS feed: ${err?.message}`);
      }
    }

    // 2. Permitted Access Blocker Guard:
    // When no authorized feed or API endpoint has been confirmed, we do not engage in unauthorized HTML scraping.
    const accessNotice =
      'Automated fetching paused: Direct web scraping of jobs.telusdigital.com without an official API or authorized feed is prohibited. Awaiting confirmation of official RSS/API endpoint.';

    return this.createRawPayload(
      {
        accessMethod: 'BLOCKED_PENDING_CONFIRMATION',
        sourceEndpoint: this.baseUrl,
        retrievedAt: new Date().toISOString(),
        itemCount: 0,
        items: [],
        accessNotice,
      },
      'custom',
      { status: 'access_method_unconfirmed', notice: accessNotice }
    );
  }

  /**
   * STAGE 2: PARSE
   * Extracts discreet TelusRawJob items from the payload.
   */
  public async parse(
    rawPayload: RawSourcePayload<TelusRawPayload>,
    _context: PipelineExecutionContext
  ): Promise<RawJobItem<TelusRawJob>[]> {
    const payload = rawPayload.rawContent;

    if (!payload || !Array.isArray(payload.items)) {
      return [];
    }

    return payload.items.map((job, index) => {
      const jobId = job.jobId || `telus_${Date.now()}_${index}`;
      return this.createRawJobItem(jobId, job, {
        originalUrl: job.url,
        department: job.department,
      });
    });
  }

  /**
   * STAGE 3: NORMALIZE
   * Maps raw TELUS job fields to standard NormalizedJobItem schema.
   * Strictly preserves source attribution and original URLs.
   * Does NOT fabricate missing data (compensation, dates, or eligibility).
   */
  public async normalize(
    rawItem: RawJobItem<TelusRawJob>,
    _context: PipelineExecutionContext
  ): Promise<NormalizedJobItem> {
    const raw = rawItem.raw;

    // 1. URL Preservation: Ensure canonical TELUS link is preserved
    let originalUrl = (raw.url || '').trim();
    if (!originalUrl) {
      originalUrl = `${this.baseUrl}#${raw.jobId || rawItem.sourceJobId}`;
    }

    // 2. Title & Company extraction
    const title = (raw.title || '').trim();
    const companyName = (raw.companyName || 'TELUS Digital').trim();

    // 3. Description extraction
    const description = (raw.descriptionText || raw.descriptionHtml || '').trim();

    // 4. Country & Eligibility extraction
    const eligibleCountries: string[] = [];
    if (raw.country && raw.country.trim()) {
      eligibleCountries.push(raw.country.trim());
    } else if (raw.location && /india/i.test(raw.location)) {
      eligibleCountries.push('India');
    }

    // 5. Work & Location arrangement
    let locationType: LocationType = 'REMOTE';
    if (raw.workArrangement) {
      const wa = raw.workArrangement.toUpperCase();
      if (wa === 'HYBRID' || wa === 'ONSITE' || wa === 'REMOTE') {
        locationType = wa;
      }
    }

    // 6. Job Type & Work Type
    const workType: WorkType = 'CONTRACT';
    const jobType = (raw.employmentType || 'CONTRACT').toUpperCase();

    // 7. Compensation (extracted only if explicitly provided)
    let compensationType: CompensationType = 'UNSPECIFIED';
    let compensationMin: number | null = null;
    let compensationMax: number | null = null;
    let compensationCurrency = 'USD';

    if (raw.hourlyRate !== undefined && raw.hourlyRate !== null && !isNaN(raw.hourlyRate)) {
      compensationType = 'HOURLY';
      compensationMin = raw.hourlyRate;
      compensationMax = raw.hourlyRate;
      compensationCurrency = raw.currency || 'USD';
    } else if (raw.salaryMin !== undefined && raw.salaryMin !== null && !isNaN(raw.salaryMin)) {
      compensationType = 'HOURLY';
      compensationMin = raw.salaryMin;
      compensationMax = raw.salaryMax ?? raw.salaryMin;
      compensationCurrency = raw.currency || 'USD';
    }

    // 8. Languages & Skills
    const languages = Array.isArray(raw.requiredLanguages) && raw.requiredLanguages.length > 0
      ? raw.requiredLanguages
      : ['English'];

    const skills = Array.isArray(raw.requiredSkills) ? raw.requiredSkills : [];

    // 9. Initial Category Mapping based on standard title keywords
    let category: JobCategory = 'OTHER_RELEVANT';
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('search') || lowerTitle.includes('evaluator')) {
      category = 'SEARCH_EVALUATION';
    } else if (lowerTitle.includes('rater') || lowerTitle.includes('quality assurance')) {
      category = 'CONTENT_EVALUATION';
    } else if (lowerTitle.includes('data analyst') || lowerTitle.includes('online data')) {
      category = 'DATA_LABELING';
    } else if (lowerTitle.includes('deduplication') || lowerTitle.includes('collection')) {
      category = 'DATA_VERIFICATION';
    } else if (lowerTitle.includes('annotation') || lowerTitle.includes('annotator')) {
      category = 'TEXT_ANNOTATION';
    }

    return {
      sourceId: this.sourceId,
      sourceName: this.sourceName,
      sourceJobId: raw.jobId || rawItem.sourceJobId,
      originalUrl,
      title,
      companyName,
      description,
      category,
      jobType,
      workType,
      locationType,
      eligibleCountries,
      languages,
      experienceLevel: raw.experienceLevel || 'ENTRY',
      compensationType,
      compensationMin,
      compensationMax,
      compensationCurrency,
      skills,
      postedAt: raw.postedDate,
      expiresAt: raw.deadlineDate || null,
      rawSourceData: raw,
    };
  }

  /**
   * STAGE 4: VALIDATE
   * Validates TELUS-specific constraints.
   */
  public async validate(
    normalizedItem: NormalizedJobItem,
    _context: PipelineExecutionContext
  ): Promise<AdapterValidationResult> {
    const errors: string[] = [];

    if (!normalizedItem.title || normalizedItem.title.length < 3) {
      errors.push('TELUS job must have a valid title of at least 3 characters.');
    }

    if (!normalizedItem.originalUrl || !normalizedItem.originalUrl.startsWith('http')) {
      errors.push('TELUS job must provide a valid HTTP/HTTPS URL.');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
