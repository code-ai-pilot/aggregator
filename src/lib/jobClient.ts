import { Job, JobCategory } from '../types';

export interface JobFilters {
  q?: string;
  category?: string;
  country?: string;
  experience?: string;
  jobType?: string;
  language?: string;
  minPay?: number;
  sort?: 'newest' | 'highest_pay' | 'lowest_pay' | 'title_az' | 'relevance';
  page?: number;
  limit?: number;
}

export interface JobsResponse {
  jobs: Job[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  filters: {
    q?: string;
    category?: string;
    country?: string;
    experience?: string;
    jobType?: string;
    language?: string;
    minPay?: number;
    sort: string;
  };
}

export interface CategoryItem {
  id: JobCategory;
  label: string;
  description: string;
}

export interface CategoriesResponse {
  categories: CategoryItem[];
  total: number;
}

export interface PublicSource {
  id: string;
  name: string;
  domain: string;
  sourceType: string;
  baseUrl: string;
  verificationStatus: string;
  active: boolean;
}

export interface SourcesResponse {
  sources: PublicSource[];
  total: number;
}

/**
 * Fetch paginated jobs from /api/jobs or /api/jobs/search
 */
export async function getJobs(filters: JobFilters = {}): Promise<JobsResponse> {
  const queryParams = new URLSearchParams();

  if (filters.q && filters.q.trim()) queryParams.set('q', filters.q.trim());
  if (filters.category && filters.category !== 'ALL') queryParams.set('category', filters.category);
  if (filters.country && filters.country !== 'ALL') queryParams.set('country', filters.country);
  if (filters.experience && filters.experience !== 'ALL') queryParams.set('experience', filters.experience);
  if (filters.jobType && filters.jobType !== 'ALL') queryParams.set('jobType', filters.jobType);
  if (filters.language && filters.language !== 'ALL') queryParams.set('language', filters.language);
  if (typeof filters.minPay === 'number' && filters.minPay > 0) queryParams.set('minPay', String(filters.minPay));
  if (filters.sort) queryParams.set('sort', filters.sort);
  if (filters.page && filters.page > 1) queryParams.set('page', String(filters.page));
  if (filters.limit && filters.limit !== 20) queryParams.set('limit', String(filters.limit));

  const endpoint = filters.q && filters.q.trim() ? '/api/jobs/search' : '/api/jobs';
  const url = `${endpoint}?${queryParams.toString()}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    let errorMsg = `Server returned status ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore parse failure
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

/**
 * Fetch available categories
 */
export async function getCategories(): Promise<CategoriesResponse> {
  const response = await fetch('/api/categories', {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load categories');
  }
  return response.json();
}

/**
 * Fetch available public sources
 */
export async function getSources(): Promise<SourcesResponse> {
  const response = await fetch('/api/sources', {
    headers: { 'Accept': 'application/json' },
  });
  if (!response.ok) {
    throw new Error('Failed to load sources');
  }
  return response.json();
}

/**
 * Fetch a single job by ID or slug
 */
export async function getJobById(id: string): Promise<{ job: Job }> {
  if (!id || !id.trim()) {
    throw new Error('Invalid job ID');
  }

  const response = await fetch(`/api/jobs/${encodeURIComponent(id.trim())}`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    let errorMsg = `Job not found (${response.status})`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    const err: any = new Error(errorMsg);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

/**
 * Calculate relative freshness string deterministically without fabricating dates
 */
export function formatJobFreshness(postedAt?: string, createdAt?: string): { text: string; isFresh: boolean } | null {
  const dateStr = postedAt || createdAt;
  if (!dateStr) return null;

  try {
    const postDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - postDate.getTime();
    
    // If date is invalid
    if (isNaN(postDate.getTime())) return null;

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return { text: 'Just now', isFresh: true };
    }
    if (diffHours < 24) {
      return { text: `${diffHours}h ago`, isFresh: true };
    }
    if (diffDays === 1) {
      return { text: '1d ago', isFresh: true };
    }
    if (diffDays < 7) {
      return { text: `${diffDays}d ago`, isFresh: diffDays <= 3 };
    }
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return { text: `${weeks}w ago`, isFresh: false };
    }

    return {
      text: postDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      isFresh: false,
    };
  } catch {
    return null;
  }
}

/**
 * Format compensation rate cleanly
 */
export function formatCompensation(
  min: number | null,
  max: number | null,
  currency: string = 'USD',
  type: string = 'HOURLY'
): string | null {
  if (min === null && max === null) return null;

  const curr = currency || 'USD';
  const symbol = curr === 'USD' ? '$' : curr === 'EUR' ? '€' : curr === 'GBP' ? '£' : `${curr} `;
  const period = type === 'HOURLY' ? '/hr' : type === 'MONTHLY' ? '/mo' : type === 'TASK_BASED' ? '/task' : '';

  if (min !== null && max !== null) {
    if (min === max) {
      return `${symbol}${min}${period}`;
    }
    return `${symbol}${min}–${symbol}${max}${period}`;
  }

  if (min !== null) {
    return `From ${symbol}${min}${period}`;
  }

  if (max !== null) {
    return `Up to ${symbol}${max}${period}`;
  }

  return null;
}
