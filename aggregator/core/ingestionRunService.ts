/**
 * Ingestion Run Service
 *
 * Centralized tracking and concurrency management service for aggregator ingestion runs.
 *
 * Models Firestore collection: `ingestionRuns/{runId}`
 *
 * Responsibilities:
 * 1. Track lifecycle of an ingestion run: RUNNING → SUCCESS | PARTIAL | FAILED
 * 2. Maintain processing counters: fetched, parsed, normalized, duplicates, published, rejected
 * 3. Enforce per-source concurrency protection (prevents overlapping runs for the same source)
 * 4. Record structured, sanitized diagnostics without exposing API keys or secrets
 * 5. Provide independent error boundaries across different sources
 */

import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, limit as firestoreLimit } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../../src/lib/firebase';
import { IngestionRun, IngestionStatus, IngestionErrorRecord } from '../../src/types';

export interface StartRunResult {
  success: boolean;
  run?: IngestionRun;
  error?: string;
}

export interface IngestionRunUpdateOptions {
  fetched?: number;
  parsed?: number;
  normalized?: number;
  duplicates?: number;
  published?: number;
  rejected?: number;
  status?: IngestionStatus;
}

interface ActiveSourceLock {
  runId: string;
  sourceId: string;
  lockedAt: number; // epoch ms
}

// Secret masking patterns for safety
const SENSITIVE_KEY_PATTERNS = [
  /bearer\s+[a-zA-Z0-9_\-\.]+/gi,
  /(api[_-]?key|token|secret|password|auth|authorization)=['"]?[a-zA-Z0-9_\-\.]+['"]?/gi,
  /eyJ[a-zA-Z0-9_\-]+\.eyJ[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+/g, // JWTs
];

/**
 * Sanitizes strings and objects to prevent secrets or PII from being written to telemetry logs.
 */
export function sanitizeErrorPayload(raw: string): string {
  if (!raw || typeof raw !== 'string') return '';
  let sanitized = raw;
  for (const pattern of SENSITIVE_KEY_PATTERNS) {
    sanitized = sanitized.replace(pattern, '[REDACTED_CREDENTIAL]');
  }
  return sanitized.slice(0, 500); // Enforce max string length limit
}

export class IngestionRunService {
  private static instance: IngestionRunService;

  // In-memory active locks: sourceId -> ActiveSourceLock
  private activeSourceLocks = new Map<string, ActiveSourceLock>();

  // In-memory run cache: runId -> IngestionRun
  private inMemoryRuns = new Map<string, IngestionRun>();

  // Maximum allowed run execution duration before automatic lock release (15 minutes)
  private readonly LOCK_STALE_TIMEOUT_MS = 15 * 60 * 1000;

  public static getInstance(): IngestionRunService {
    if (!IngestionRunService.instance) {
      IngestionRunService.instance = new IngestionRunService();
    }
    return IngestionRunService.instance;
  }

  /**
   * Checks if a source currently has an active, non-stale ingestion run.
   */
  public isSourceRunning(sourceId: string): boolean {
    const lock = this.activeSourceLocks.get(sourceId);
    if (!lock) return false;

    // Check if the lock has timed out
    const now = Date.now();
    if (now - lock.lockedAt > this.LOCK_STALE_TIMEOUT_MS) {
      console.warn(`[IngestionRunService] Evicting stale lock for source '${sourceId}' (runId: ${lock.runId})`);
      this.activeSourceLocks.delete(sourceId);
      return false;
    }

    return true;
  }

  /**
   * Attempts to acquire an execution lock for a source.
   */
  public acquireSourceLock(sourceId: string, runId: string): boolean {
    if (this.isSourceRunning(sourceId)) {
      return false;
    }

    this.activeSourceLocks.set(sourceId, {
      sourceId,
      runId,
      lockedAt: Date.now(),
    });
    return true;
  }

  /**
   * Releases an execution lock for a source.
   */
  public releaseSourceLock(sourceId: string, runId?: string): void {
    const existing = this.activeSourceLocks.get(sourceId);
    if (existing) {
      // If runId specified, only release if it matches
      if (!runId || existing.runId === runId) {
        this.activeSourceLocks.delete(sourceId);
      }
    }
  }

  /**
   * Starts a new ingestion run for a source with status 'RUNNING'.
   * Enforces concurrency check: prevents overlapping runs for the same source.
   */
  public async startRun(sourceId: string, customRunId?: string): Promise<StartRunResult> {
    const cleanSourceId = sourceId.trim();
    if (!cleanSourceId) {
      return { success: false, error: 'A valid sourceId is required to start an ingestion run.' };
    }

    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const runId = customRunId || `run_${cleanSourceId}_${Date.now()}_${randomSuffix}`;

    // 1. Concurrency check: enforce single active run per source
    const acquired = this.acquireSourceLock(cleanSourceId, runId);
    if (!acquired) {
      const lock = this.activeSourceLocks.get(cleanSourceId);
      return {
        success: false,
        error: `Source '${cleanSourceId}' already has an active ingestion run (${lock?.runId || 'in-progress'}). Overlapping runs are prevented.`,
      };
    }

    const startedAt = new Date().toISOString();

    const newRun: IngestionRun = {
      id: runId,
      sourceId: cleanSourceId,
      startedAt,
      completedAt: null,
      status: 'RUNNING',
      fetched: 0,
      parsed: 0,
      normalized: 0,
      duplicates: 0,
      published: 0,
      rejected: 0,
      errors: [],
    };

    // 2. Cache in memory
    this.inMemoryRuns.set(runId, newRun);

    // 3. Persist to Firestore if available
    try {
      if (db && isFirebaseConfigured) {
        const runDocRef = doc(db, 'ingestionRuns', runId);
        await setDoc(runDocRef, newRun);
      }
    } catch (err) {
      console.warn(`[IngestionRunService] Firestore write failed for run start '${runId}':`, err);
    }

    return {
      success: true,
      run: newRun,
    };
  }

  /**
   * Updates processing counters as the pipeline progresses.
   */
  public async updateCounters(
    runId: string,
    updates: IngestionRunUpdateOptions
  ): Promise<IngestionRun | null> {
    const run = this.inMemoryRuns.get(runId);
    if (!run) {
      console.warn(`[IngestionRunService] Cannot update counters: run '${runId}' not found in cache.`);
      return null;
    }

    if (updates.fetched !== undefined) run.fetched = updates.fetched;
    if (updates.parsed !== undefined) run.parsed = updates.parsed;
    if (updates.normalized !== undefined) run.normalized = updates.normalized;
    if (updates.duplicates !== undefined) run.duplicates = updates.duplicates;
    if (updates.published !== undefined) run.published = updates.published;
    if (updates.rejected !== undefined) run.rejected = updates.rejected;
    if (updates.status !== undefined) run.status = updates.status;

    this.inMemoryRuns.set(runId, run);

    // Persist to Firestore
    try {
      if (db && isFirebaseConfigured) {
        const runDocRef = doc(db, 'ingestionRuns', runId);
        await updateDoc(runDocRef, {
          fetched: run.fetched,
          parsed: run.parsed,
          normalized: run.normalized,
          duplicates: run.duplicates,
          published: run.published,
          rejected: run.rejected,
          status: run.status,
        });
      }
    } catch (err) {
      console.warn(`[IngestionRunService] Failed to update Firestore counters for '${runId}':`, err);
    }

    return run;
  }

  /**
   * Records a structured diagnostic error for the run.
   * Guarantees secret sanitization.
   */
  public async recordError(
    runId: string,
    error:
      | IngestionErrorRecord
      | { step: string; message: string; sourceJobId?: string; rawPayloadSnippet?: string }
      | string
  ): Promise<void> {
    const run = this.inMemoryRuns.get(runId);
    if (!run) return;

    let errorRecord: IngestionErrorRecord;

    if (typeof error === 'string') {
      errorRecord = {
        timestamp: new Date().toISOString(),
        step: 'PIPELINE',
        message: sanitizeErrorPayload(error),
      };
    } else {
      const ts = ('timestamp' in error && typeof error.timestamp === 'string') ? error.timestamp : new Date().toISOString();
      errorRecord = {
        timestamp: ts,
        step: (error.step || 'PIPELINE') as any,
        message: sanitizeErrorPayload(error.message),
        ...(error.sourceJobId ? { sourceJobId: error.sourceJobId.slice(0, 128) } : {}),
        ...(error.rawPayloadSnippet ? { rawPayloadSnippet: sanitizeErrorPayload(error.rawPayloadSnippet) } : {}),
      };
    }

    run.errors.push(errorRecord);
    this.inMemoryRuns.set(runId, run);

    try {
      if (db && isFirebaseConfigured) {
        const runDocRef = doc(db, 'ingestionRuns', runId);
        await updateDoc(runDocRef, {
          errors: run.errors,
        });
      }
    } catch (err) {
      console.warn(`[IngestionRunService] Failed to append error to Firestore for '${runId}':`, err);
    }
  }

  /**
   * Completes an ingestion run, calculates the final status (SUCCESS, PARTIAL, FAILED),
   * sets the completed timestamp, and releases the source lock.
   */
  public async completeRun(
    runId: string,
    explicitStatus?: IngestionStatus,
    finalCounters?: IngestionRunUpdateOptions
  ): Promise<IngestionRun | null> {
    const run = this.inMemoryRuns.get(runId);
    if (!run) {
      console.warn(`[IngestionRunService] Cannot complete run: '${runId}' not found.`);
      return null;
    }

    // Apply any final counter updates
    if (finalCounters) {
      if (finalCounters.fetched !== undefined) run.fetched = finalCounters.fetched;
      if (finalCounters.parsed !== undefined) run.parsed = finalCounters.parsed;
      if (finalCounters.normalized !== undefined) run.normalized = finalCounters.normalized;
      if (finalCounters.duplicates !== undefined) run.duplicates = finalCounters.duplicates;
      if (finalCounters.published !== undefined) run.published = finalCounters.published;
      if (finalCounters.rejected !== undefined) run.rejected = finalCounters.rejected;
    }

    run.completedAt = new Date().toISOString();

    // Determine final status if not explicitly specified
    if (explicitStatus) {
      run.status = explicitStatus;
    } else {
      const hasErrors = run.errors.length > 0;
      const hasRejections = run.rejected > 0;
      const hasPublished = run.published > 0;

      if (hasErrors && !hasPublished && run.fetched === 0) {
        // Fetch/Parse completely failed before publishing anything
        run.status = 'FAILED';
      } else if (hasErrors || hasRejections) {
        // Some items failed or were rejected, but run finished
        run.status = 'PARTIAL';
      } else {
        // Complete clean run
        run.status = 'SUCCESS';
      }
    }

    this.inMemoryRuns.set(runId, run);

    // Persist completion to Firestore
    try {
      if (db && isFirebaseConfigured) {
        const runDocRef = doc(db, 'ingestionRuns', runId);
        await setDoc(runDocRef, run, { merge: true });
      }
    } catch (err) {
      console.warn(`[IngestionRunService] Failed to persist run completion to Firestore for '${runId}':`, err);
    }

    // Always release the source concurrency lock
    this.releaseSourceLock(run.sourceId, runId);

    return run;
  }

  /**
   * Retrieves an ingestion run by ID from cache or Firestore.
   */
  public async getRun(runId: string): Promise<IngestionRun | null> {
    const cached = this.inMemoryRuns.get(runId);
    if (cached) return cached;

    if (db && isFirebaseConfigured) {
      try {
        const docRef = doc(db, 'ingestionRuns', runId);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          const data = snapshot.data() as IngestionRun;
          this.inMemoryRuns.set(runId, data);
          return data;
        }
      } catch (err) {
        console.warn(`[IngestionRunService] Failed to get run '${runId}' from Firestore:`, err);
      }
    }

    return null;
  }

  /**
   * Retrieves recent ingestion runs for a specific source.
   */
  public async getRunsForSource(sourceId: string, limitCount = 20): Promise<IngestionRun[]> {
    const inMemoryMatches = Array.from(this.inMemoryRuns.values())
      .filter((r) => r.sourceId === sourceId)
      .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
      .slice(0, limitCount);

    if (inMemoryMatches.length > 0 || !db || !isFirebaseConfigured) {
      return inMemoryMatches;
    }

    try {
      const q = query(
        collection(db, 'ingestionRuns'),
        where('sourceId', '==', sourceId),
        firestoreLimit(limitCount)
      );
      const snapshot = await getDocs(q);
      const runs: IngestionRun[] = [];
      snapshot.forEach((d) => runs.push(d.data() as IngestionRun));
      runs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
      return runs;
    } catch (err) {
      console.warn(`[IngestionRunService] Failed to query Firestore runs for source '${sourceId}':`, err);
      return inMemoryMatches;
    }
  }

  /**
   * Returns all currently cached active runs.
   */
  public getActiveRuns(): IngestionRun[] {
    return Array.from(this.inMemoryRuns.values()).filter((r) => r.status === 'RUNNING');
  }

  /**
   * Utility helper to clear in-memory locks (useful for test harnesses).
   */
  public clearLocks(): void {
    this.activeSourceLocks.clear();
  }
}

export const ingestionRunService = IngestionRunService.getInstance();
