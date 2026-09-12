import { doc, setDoc } from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './firebase';
import { ActivityEventType, JobEvent } from '../types';

interface RecordEventOptions {
  eventType: ActivityEventType;
  jobId?: string | null;
  sourceId?: string | null;
  metadata?: Record<string, unknown>;
  force?: boolean; // Bypass deduplication check if explicitly required
}

// In-memory deduplication cache: key -> timestamp (epoch ms)
const eventDeduplicationCache = new Map<string, number>();

// Time-to-live windows for deduplication (in milliseconds)
const DEDUPLICATION_WINDOWS_MS: Partial<Record<ActivityEventType, number>> = {
  job_view: 10000, // 10 seconds for viewing the same job
  search: 3000, // 3 seconds for identical search query
  filter_use: 3000, // 3 seconds for identical filter state
  application_click: 2000, // 2 seconds for clicking apply on same job
  job_save: 1000,
  job_unsave: 1000,
  signup: 5000,
  login: 5000,
  job_report: 3000,
};

/**
 * Generates a clean cache key for deduplication.
 */
function getDeduplicationKey(
  eventType: ActivityEventType,
  uid: string | null,
  jobId?: string | null,
  metadata?: Record<string, unknown>
): string {
  const metaKey = metadata ? JSON.stringify(metadata) : '';
  return `${eventType}:${uid || 'anon'}:${jobId || 'none'}:${metaKey}`;
}

/**
 * Checks if an event is a duplicate within the defined throttle window.
 */
function isDuplicateEvent(
  eventType: ActivityEventType,
  uid: string | null,
  jobId?: string | null,
  metadata?: Record<string, unknown>
): boolean {
  const windowMs = DEDUPLICATION_WINDOWS_MS[eventType] || 2000;
  const key = getDeduplicationKey(eventType, uid, jobId, metadata);
  const now = Date.now();
  const lastRecorded = eventDeduplicationCache.get(key);

  if (lastRecorded && now - lastRecorded < windowMs) {
    return true;
  }

  // Record this timestamp and clean up old cache entries periodically
  eventDeduplicationCache.set(key, now);
  if (eventDeduplicationCache.size > 200) {
    for (const [k, time] of eventDeduplicationCache.entries()) {
      if (now - time > 30000) {
        eventDeduplicationCache.delete(k);
      }
    }
  }

  return false;
}

/**
 * Centralized telemetry and activity event recorder.
 * Guarantees:
 * 1. Resolves authenticated Firebase UID directly from `auth.currentUser` (never trusts spoofed client UIDs).
 * 2. Deduplicates rapid duplicate submissions.
 * 3. Never throws or breaks the caller's execution flow.
 * 4. Stores lightweight, non-PII metadata only.
 */
export async function recordActivityEvent(options: RecordEventOptions): Promise<JobEvent | null> {
  try {
    const { eventType, jobId, sourceId, metadata, force = false } = options;

    // 1. Authenticated UID resolution: always query live auth instance
    const currentUid = auth?.currentUser?.uid || null;

    // 2. Deduplication check
    if (!force && isDuplicateEvent(eventType, currentUid, jobId, metadata)) {
      return null;
    }

    // 3. Generate unique, safe document ID
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const eventId = `evt_${Date.now()}_${randomSuffix}`;
    const timestamp = new Date().toISOString();

    // 4. Sanitize lightweight metadata (strip sensitive keys if any)
    const sanitizedMetadata: Record<string, unknown> = {};
    if (metadata && typeof metadata === 'object') {
      for (const [key, value] of Object.entries(metadata)) {
        if (
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('secret')
        ) {
          continue;
        }
        // Limit string lengths in metadata
        if (typeof value === 'string') {
          sanitizedMetadata[key] = value.slice(0, 500);
        } else if (
          typeof value === 'number' ||
          typeof value === 'boolean' ||
          Array.isArray(value) ||
          (typeof value === 'object' && value !== null)
        ) {
          sanitizedMetadata[key] = value;
        }
      }
    }

    const eventPayload: JobEvent = {
      id: eventId,
      eventType,
      uid: currentUid,
      ...(jobId ? { jobId: jobId.slice(0, 128) } : {}),
      ...(sourceId ? { sourceId: sourceId.slice(0, 128) } : {}),
      timestamp,
      ...(Object.keys(sanitizedMetadata).length > 0 ? { metadata: sanitizedMetadata } : {}),
    };

    // 5. If Firebase is active and configured, persist to Firestore jobEvents collection
    if (db && isFirebaseConfigured) {
      const eventDocRef = doc(db, 'jobEvents', eventId);
      // Non-blocking fire-and-forget write to Firestore
      setDoc(eventDocRef, eventPayload).catch((writeErr) => {
        // Log at debug level to never throw or break caller
        console.warn(`[EventTelemetry] Failed to write ${eventType} event:`, writeErr);
      });
    } else {
      // Local fallback / dev telemetry cache
      try {
        const localEventsRaw = localStorage.getItem('wfh_recent_activity_events');
        const localEvents: JobEvent[] = localEventsRaw ? JSON.parse(localEventsRaw) : [];
        localEvents.unshift(eventPayload);
        if (localEvents.length > 50) localEvents.length = 50; // Cap local cache
        localStorage.setItem('wfh_recent_activity_events', JSON.stringify(localEvents));
      } catch {
        // Ignore local storage errors
      }
    }

    return eventPayload;
  } catch (err) {
    // Top-level catch guarantee: never throw
    console.warn('[EventTelemetry] Unexpected error in recordActivityEvent:', err);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Convenience Helper Functions
// ---------------------------------------------------------------------------

/**
 * Record a user signup event
 */
export function recordSignupEvent(metadata?: { method?: 'email' | 'google'; role?: string }) {
  return recordActivityEvent({
    eventType: 'signup',
    metadata,
  });
}

/**
 * Record a user login event
 */
export function recordLoginEvent(metadata?: { method?: 'email' | 'google'; role?: string }) {
  return recordActivityEvent({
    eventType: 'login',
    metadata,
  });
}

/**
 * Record a job detail view event
 */
export function recordJobViewEvent(
  jobId: string,
  sourceId?: string | null,
  metadata?: { title?: string; companyName?: string; category?: string }
) {
  return recordActivityEvent({
    eventType: 'job_view',
    jobId,
    sourceId,
    metadata,
  });
}

/**
 * Record a job save / bookmark event
 */
export function recordJobSaveEvent(
  jobId: string,
  sourceId?: string | null,
  metadata?: { status?: string }
) {
  return recordActivityEvent({
    eventType: 'job_save',
    jobId,
    sourceId,
    metadata,
  });
}

/**
 * Record a job unsave event
 */
export function recordJobUnsaveEvent(
  jobId: string,
  metadata?: { previousStatus?: string }
) {
  return recordActivityEvent({
    eventType: 'job_unsave',
    jobId,
    metadata,
  });
}

/**
 * Record an external application click event
 */
export function recordApplicationClickEvent(
  jobId: string,
  sourceId?: string | null,
  metadata?: { destinationUrl?: string; sourceName?: string }
) {
  return recordActivityEvent({
    eventType: 'application_click',
    jobId,
    sourceId,
    metadata,
  });
}

/**
 * Record a search query event
 */
export function recordSearchEvent(
  query: string,
  totalResults?: number,
  metadata?: Record<string, unknown>
) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return Promise.resolve(null);

  return recordActivityEvent({
    eventType: 'search',
    metadata: {
      query: cleanQuery.slice(0, 100),
      ...(typeof totalResults === 'number' ? { totalResults } : {}),
      ...metadata,
    },
  });
}

/**
 * Record a filter change or usage event
 */
export function recordFilterUseEvent(
  filters: {
    category?: string;
    country?: string;
    experience?: string;
    jobType?: string;
    language?: string;
    minPay?: number;
    sort?: string;
  }
) {
  // Only record if at least one non-default filter is applied
  const activeFilters: Record<string, unknown> = {};
  if (filters.category && filters.category !== 'ALL') activeFilters.category = filters.category;
  if (filters.country && filters.country !== 'ALL') activeFilters.country = filters.country;
  if (filters.experience && filters.experience !== 'ALL') activeFilters.experience = filters.experience;
  if (filters.jobType && filters.jobType !== 'ALL') activeFilters.jobType = filters.jobType;
  if (filters.language && filters.language !== 'ALL') activeFilters.language = filters.language;
  if (filters.minPay && filters.minPay > 0) activeFilters.minPay = filters.minPay;
  if (filters.sort && filters.sort !== 'newest') activeFilters.sort = filters.sort;

  if (Object.keys(activeFilters).length === 0) {
    return Promise.resolve(null);
  }

  return recordActivityEvent({
    eventType: 'filter_use',
    metadata: activeFilters,
  });
}

/**
 * Record a job report submission event
 */
export function recordJobReportEvent(
  jobId: string,
  reason: string,
  sourceId?: string | null,
  metadata?: { detailsSnippet?: string; detailsLength?: number; [key: string]: unknown }
) {
  return recordActivityEvent({
    eventType: 'job_report',
    jobId,
    sourceId,
    metadata: {
      reason,
      ...metadata,
    },
  });
}
