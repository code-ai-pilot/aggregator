/**
 * TELUS Digital AI Community Adapter Types
 *
 * Strongly-typed payload and raw record definitions for the TELUS Digital AI Community source.
 */

export type TelusAccessMethod =
  | 'OFFICIAL_FEED'
  | 'PERMITTED_API'
  | 'STRUCTURED_IMPORT'
  | 'BLOCKED_PENDING_CONFIRMATION';

/**
 * Raw job listing structure as delivered by TELUS Digital systems.
 * All optional fields remain strictly optional to prevent data fabrication.
 */
export interface TelusRawJob {
  jobId: string;
  title: string;
  url: string;
  companyName?: string;
  department?: string;
  location?: string;
  country?: string;
  employmentType?: string;
  workArrangement?: 'REMOTE' | 'HYBRID' | 'ONSITE' | string;
  descriptionHtml?: string;
  descriptionText?: string;
  requiredLanguages?: string[];
  requiredSkills?: string[];
  experienceLevel?: string;
  hourlyRate?: number;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  postedDate?: string;
  deadlineDate?: string;
  rawMetadata?: Record<string, unknown>;
}

/**
 * Raw payload container received from the TELUS Digital access mechanism.
 */
export interface TelusRawPayload {
  accessMethod: TelusAccessMethod;
  sourceEndpoint: string;
  retrievedAt: string;
  itemCount: number;
  items: TelusRawJob[];
  accessNotice?: string;
}
