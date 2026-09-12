import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  limit as firestoreLimit,
} from 'firebase/firestore';
import { serverDb, isServerFirebaseConfigured } from './firestore';
import {
  Job,
  Source,
  JOB_CATEGORIES,
  JobCategory,
  JobStatus,
  JobVerificationStatus,
  JobUrlStatus,
} from '../src/types';

export interface JobQueryFilters {
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

export interface PaginatedJobsResponse {
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

export interface PublicSourceProjection {
  id: string;
  name: string;
  domain: string;
  sourceType: string;
  baseUrl: string;
  verificationStatus: string;
  active: boolean;
}

/**
 * Standard public categories
 */
export function getCategories() {
  return {
    categories: JOB_CATEGORIES,
    total: JOB_CATEGORIES.length,
  };
}

/**
 * Strips internal ingestion metadata and ensures standard public job structure
 */
function sanitizePublicJob(data: Record<string, any>, docId: string): Job {
  return {
    id: data.id || docId,
    title: String(data.title || ''),
    slug: String(data.slug || (data.title ? data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : docId)),
    companyName: String(data.companyName || 'Verified AI Partner'),
    sourceId: String(data.sourceId || 'direct'),
    sourceName: String(data.sourceName || 'Direct Verification'),
    sourceJobId: String(data.sourceJobId || docId),
    originalUrl: String(data.originalUrl || '#'),
    description: String(data.description || ''),
    normalizedDescription: String(data.normalizedDescription || data.description || ''),
    category: (data.category as JobCategory) || 'OTHER_RELEVANT',
    subcategory: String(data.subcategory || ''),
    jobType: String(data.jobType || data.workType || 'CONTRACT'),
    workType: String(data.workType || 'CONTRACT'),
    locationType: String(data.locationType || 'REMOTE'),
    eligibleCountries: Array.isArray(data.eligibleCountries) ? data.eligibleCountries.map(String) : ['Worldwide (Remote)'],
    languages: Array.isArray(data.languages) ? data.languages.map(String) : ['English'],
    experienceLevel: String(data.experienceLevel || 'ENTRY'),
    compensationType: String(data.compensationType || 'HOURLY'),
    compensationMin: typeof data.compensationMin === 'number' ? data.compensationMin : null,
    compensationMax: typeof data.compensationMax === 'number' ? data.compensationMax : null,
    compensationCurrency: String(data.compensationCurrency || 'USD'),
    skills: Array.isArray(data.skills) ? data.skills.map(String) : [],
    postedAt: String(data.postedAt || data.createdAt || new Date().toISOString()),
    discoveredAt: String(data.discoveredAt || data.createdAt || new Date().toISOString()),
    updatedAt: String(data.updatedAt || new Date().toISOString()),
    expiresAt: data.expiresAt ? String(data.expiresAt) : null,
    lastCheckedAt: String(data.lastCheckedAt || new Date().toISOString()),
    status: (data.status as JobStatus) || 'ACTIVE',
    verificationStatus: (data.verificationStatus as JobVerificationStatus) || 'VERIFIED',
    urlStatus: (data.urlStatus as JobUrlStatus) || 'VALID',
    contentHash: String(data.contentHash || ''),
    createdAt: String(data.createdAt || new Date().toISOString()),
  };
}

/**
 * Checks if a job is visible to normal public users
 */
function isJobPubliclyVisible(job: Job): boolean {
  // Must be ACTIVE
  if (job.status !== 'ACTIVE') return false;

  // Must not be failed or rejected
  if (job.verificationStatus === 'FAILED') return false;

  // Must not be broken link
  if (job.urlStatus === 'BROKEN') return false;

  return true;
}

/**
 * Fetches and filters jobs with deterministic sorting and pagination
 */
export async function queryJobs(filters: JobQueryFilters): Promise<PaginatedJobsResponse> {
  const page = Math.max(1, Math.floor(Number(filters.page) || 1));
  const limit = Math.max(1, Math.min(100, Math.floor(Number(filters.limit) || 20)));
  const sort = filters.sort || 'newest';
  const queryText = (filters.q || '').trim().toLowerCase();

  let allJobs: Job[] = [];

  if (serverDb && isServerFirebaseConfigured) {
    try {
      const jobsCol = collection(serverDb, 'jobs');
      const snapshot = await getDocs(jobsCol);

      snapshot.forEach((docSnap) => {
        const raw = docSnap.data();
        const job = sanitizePublicJob(raw, docSnap.id);
        if (isJobPubliclyVisible(job)) {
          allJobs.push(job);
        }
      });
    } catch (err) {
      console.warn('[JobService] Firestore query error:', err);
    }
  }

  // Filter pipeline
  let filtered = allJobs.filter((job) => {
    // 1. Category Filter
    if (filters.category && filters.category !== 'ALL') {
      const targetCat = filters.category.toUpperCase();
      const jobCat = String(job.category).toUpperCase();
      if (jobCat !== targetCat) return false;
    }

    // 2. Country Filter
    if (filters.country && filters.country !== 'ALL' && filters.country !== 'ANY') {
      const targetCountry = filters.country.toLowerCase();
      const matchesCountry = job.eligibleCountries.some((c) => {
        const cLower = c.toLowerCase();
        return (
          cLower.includes(targetCountry) ||
          targetCountry.includes(cLower) ||
          cLower.includes('remote') ||
          cLower.includes('worldwide') ||
          cLower.includes('global')
        );
      });
      if (!matchesCountry) return false;
    }

    // 3. Experience Level Filter
    if (filters.experience && filters.experience !== 'ALL') {
      const targetExp = filters.experience.toUpperCase();
      const jobExp = String(job.experienceLevel).toUpperCase();
      if (jobExp !== targetExp) return false;
    }

    // 4. Job Type / Work Type Filter
    if (filters.jobType && filters.jobType !== 'ALL') {
      const targetType = filters.jobType.toUpperCase();
      const jobTypeUpper = String(job.jobType || '').toUpperCase();
      const workTypeUpper = String(job.workType || '').toUpperCase();
      if (!jobTypeUpper.includes(targetType) && !workTypeUpper.includes(targetType)) {
        return false;
      }
    }

    // 5. Language Filter
    if (filters.language && filters.language !== 'ALL') {
      const targetLang = filters.language.toLowerCase();
      const matchesLang = job.languages.some((l) => l.toLowerCase().includes(targetLang));
      if (!matchesLang) return false;
    }

    // 6. Minimum Pay Filter
    if (typeof filters.minPay === 'number' && !isNaN(filters.minPay) && filters.minPay > 0) {
      const minRate = filters.minPay;
      const jobMax = job.compensationMax;
      const jobMin = job.compensationMin;

      if (jobMax === null && jobMin === null) {
        return false;
      }

      const effectiveRate = jobMax !== null ? jobMax : jobMin!;
      if (effectiveRate < minRate) {
        return false;
      }
    }

    // 7. Deterministic Text Search (q)
    if (queryText.length > 0) {
      const tokens = queryText.split(/\s+/).filter((t) => t.length > 0);
      const searchBlob = [
        job.title,
        job.companyName,
        job.category,
        job.subcategory,
        job.skills.join(' '),
        job.normalizedDescription,
        job.description,
      ]
        .join(' ')
        .toLowerCase();

      // All tokens must be present
      const allTokensMatch = tokens.every((tok) => searchBlob.includes(tok));
      if (!allTokensMatch) return false;
    }

    return true;
  });

  // Calculate relevance score map if searching
  const relevanceMap = new Map<string, number>();
  if (queryText.length > 0) {
    const tokens = queryText.split(/\s+/).filter((t) => t.length > 0);
    filtered.forEach((job) => {
      let score = 0;
      const titleLower = job.title.toLowerCase();
      const companyLower = job.companyName.toLowerCase();
      const skillsLower = job.skills.map((s) => s.toLowerCase());

      // Exact phrase match in title
      if (titleLower.includes(queryText)) {
        score += 100;
      }

      tokens.forEach((token) => {
        if (titleLower.includes(token)) score += 30;
        if (companyLower.includes(token)) score += 15;
        if (skillsLower.some((s) => s.includes(token))) score += 25;
        if (job.normalizedDescription.toLowerCase().includes(token)) score += 5;
      });

      relevanceMap.set(job.id, score);
    });
  }

  // Deterministic Sorting
  filtered.sort((a, b) => {
    if (sort === 'relevance' && queryText.length > 0) {
      const scoreA = relevanceMap.get(a.id) || 0;
      const scoreB = relevanceMap.get(b.id) || 0;
      if (scoreA !== scoreB) return scoreB - scoreA;
    }

    if (sort === 'highest_pay') {
      const payA = a.compensationMax ?? a.compensationMin ?? 0;
      const payB = b.compensationMax ?? b.compensationMin ?? 0;
      if (payA !== payB) return payB - payA;
    }

    if (sort === 'lowest_pay') {
      const payA = a.compensationMin ?? a.compensationMax ?? 0;
      const payB = b.compensationMin ?? b.compensationMax ?? 0;
      if (payA !== payB) return payA - payB;
    }

    if (sort === 'title_az') {
      const comp = a.title.localeCompare(b.title);
      if (comp !== 0) return comp;
    }

    // Default: newest postedAt
    const timeA = new Date(a.postedAt || a.createdAt).getTime() || 0;
    const timeB = new Date(b.postedAt || b.createdAt).getTime() || 0;
    if (timeA !== timeB) return timeB - timeA;

    // Deterministic tie-breaker: ID
    return a.id.localeCompare(b.id);
  });

  // Pagination slicing
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedJobs = filtered.slice(startIndex, startIndex + limit);

  return {
    jobs: paginatedJobs,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    filters: {
      q: filters.q,
      category: filters.category,
      country: filters.country,
      experience: filters.experience,
      jobType: filters.jobType,
      language: filters.language,
      minPay: filters.minPay,
      sort,
    },
  };
}

/**
 * Fetches a single published job by ID or slug
 */
export async function getJobById(idOrSlug: string): Promise<Job | null> {
  if (!idOrSlug || typeof idOrSlug !== 'string') return null;
  const sanitizedId = idOrSlug.trim();
  if (!sanitizedId) return null;

  if (serverDb && isServerFirebaseConfigured) {
    try {
      // 1. Direct document ID lookup
      const docRef = doc(serverDb, 'jobs', sanitizedId);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const job = sanitizePublicJob(snapshot.data(), snapshot.id);
        if (isJobPubliclyVisible(job)) {
          return job;
        }
      }

      // 2. Slug lookup fallback
      const jobsCol = collection(serverDb, 'jobs');
      const q = query(jobsCol, where('slug', '==', sanitizedId), firestoreLimit(1));
      const slugSnap = await getDocs(q);

      if (!slugSnap.empty) {
        const docSnap = slugSnap.docs[0];
        const job = sanitizePublicJob(docSnap.data(), docSnap.id);
        if (isJobPubliclyVisible(job)) {
          return job;
        }
      }
    } catch (err) {
      console.warn('[JobService] Firestore getJobById error:', err);
    }
  }

  return null;
}

/**
 * Fetches public source platforms, safely stripping internal ingestion metadata
 */
export async function getPublicSources(): Promise<{ sources: PublicSourceProjection[]; total: number }> {
  const sources: PublicSourceProjection[] = [];

  if (serverDb && isServerFirebaseConfigured) {
    try {
      const sourcesCol = collection(serverDb, 'sources');
      const snapshot = await getDocs(sourcesCol);

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.active !== false && data.verificationStatus !== 'REJECTED') {
          sources.push({
            id: docSnap.id,
            name: String(data.name || 'Verified Partner'),
            domain: String(data.domain || ''),
            sourceType: String(data.sourceType || 'PLATFORM'),
            baseUrl: String(data.baseUrl || ''),
            verificationStatus: String(data.verificationStatus || 'VERIFIED'),
            active: Boolean(data.active ?? true),
          });
        }
      });
    } catch (err) {
      console.warn('[JobService] Firestore getPublicSources error:', err);
    }
  }

  return {
    sources,
    total: sources.length,
  };
}
