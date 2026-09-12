import { doc, getDoc, setDoc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { SavedJob, SavedJobStatus, Job } from '../types';
import { getJobById } from './jobClient';
import { recordJobSaveEvent, recordJobUnsaveEvent } from './eventService';

const LOCAL_STORAGE_SAVED_PREFIX = 'wfh_saved_jobs_';

/**
 * Helper to get local cache for a user UID
 */
function getLocalSavedJobs(uid: string): SavedJob[] {
  if (!uid) return [];
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_SAVED_PREFIX}${uid}`);
    if (raw) {
      return JSON.parse(raw) as SavedJob[];
    }
  } catch (err) {
    console.warn('[SavedJobService] Failed to read local storage:', err);
  }
  return [];
}

/**
 * Helper to save local cache for a user UID
 */
function setLocalSavedJobs(uid: string, list: SavedJob[]): void {
  if (!uid) return;
  try {
    localStorage.setItem(`${LOCAL_STORAGE_SAVED_PREFIX}${uid}`, JSON.stringify(list));
  } catch (err) {
    console.warn('[SavedJobService] Failed to write local storage:', err);
  }
}

/**
 * Saves a job for an authenticated user.
 * Guarantees document ID format: `${uid}_${jobId}`
 * Prevents saving nonexistent jobs by verifying with Job API.
 */
export async function saveJob(
  uid: string,
  jobId: string,
  notes: string = '',
  status: SavedJobStatus = 'SAVED'
): Promise<SavedJob> {
  if (!uid || !uid.trim()) {
    throw new Error('Authentication required to save jobs');
  }
  if (!jobId || !jobId.trim()) {
    throw new Error('Valid Job ID is required');
  }

  const cleanUid = uid.trim();
  const cleanJobId = jobId.trim();
  const docId = `${cleanUid}_${cleanJobId}`;
  const nowIso = new Date().toISOString();

  // Verify that the job actually exists before allowing save
  try {
    const jobRes = await getJobById(cleanJobId);
    if (!jobRes || !jobRes.job) {
      throw new Error('Cannot save nonexistent or inactive job listing.');
    }
  } catch (verifyErr: any) {
    console.error(`[SavedJobService] Job validation failed for ${cleanJobId}:`, verifyErr);
    throw new Error(verifyErr.message || 'Cannot save nonexistent or inactive job listing.');
  }

  const savedRecord: SavedJob = {
    id: docId,
    uid: cleanUid,
    jobId: cleanJobId,
    notes: notes.trim(),
    status,
    savedAt: nowIso,
    updatedAt: nowIso,
  };

  // 1. Firestore persistence if configured
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'savedJobs', docId);
      await setDoc(docRef, savedRecord, { merge: true });
    } catch (err: any) {
      console.warn('[SavedJobService] Firestore save failed, syncing to local store:', err);
    }
  }

  // 2. Local cache sync
  const existing = getLocalSavedJobs(cleanUid);
  const filtered = existing.filter((item) => item.jobId !== cleanJobId);
  filtered.unshift(savedRecord);
  setLocalSavedJobs(cleanUid, filtered);

  // 3. Telemetry event recording (non-blocking)
  recordJobSaveEvent(cleanJobId, undefined, { status }).catch(() => {});

  return savedRecord;
}

/**
 * Removes / unsaves a job for an authenticated user.
 */
export async function unsaveJob(uid: string, jobId: string): Promise<void> {
  if (!uid || !uid.trim()) {
    throw new Error('Authentication required to unsave jobs');
  }
  if (!jobId || !jobId.trim()) {
    throw new Error('Valid Job ID is required');
  }

  const cleanUid = uid.trim();
  const cleanJobId = jobId.trim();
  const docId = `${cleanUid}_${cleanJobId}`;

  // 1. Firestore deletion
  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'savedJobs', docId);
      await deleteDoc(docRef);
    } catch (err: any) {
      console.warn('[SavedJobService] Firestore delete failed:', err);
    }
  }

  // 2. Local cache sync
  const existing = getLocalSavedJobs(cleanUid);
  const updated = existing.filter((item) => item.jobId !== cleanJobId);
  setLocalSavedJobs(cleanUid, updated);

  // 3. Telemetry event recording (non-blocking)
  recordJobUnsaveEvent(cleanJobId).catch(() => {});
}

/**
 * Updates a saved job's personal notes or application status (e.g., SAVED -> APPLIED -> ARCHIVED).
 */
export async function updateSavedJob(
  uid: string,
  jobId: string,
  updates: { notes?: string; status?: SavedJobStatus }
): Promise<SavedJob> {
  if (!uid || !uid.trim()) {
    throw new Error('Authentication required');
  }
  if (!jobId || !jobId.trim()) {
    throw new Error('Valid Job ID is required');
  }

  const cleanUid = uid.trim();
  const cleanJobId = jobId.trim();
  const docId = `${cleanUid}_${cleanJobId}`;
  const nowIso = new Date().toISOString();

  let existingRecord = await getSavedJob(cleanUid, cleanJobId);
  if (!existingRecord) {
    existingRecord = {
      id: docId,
      uid: cleanUid,
      jobId: cleanJobId,
      notes: '',
      status: 'SAVED',
      savedAt: nowIso,
      updatedAt: nowIso,
    };
  }

  const updatedRecord: SavedJob = {
    ...existingRecord,
    notes: updates.notes !== undefined ? updates.notes.trim() : existingRecord.notes,
    status: updates.status || existingRecord.status,
    updatedAt: nowIso,
  };

  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'savedJobs', docId);
      await setDoc(docRef, updatedRecord, { merge: true });
    } catch (err) {
      console.warn('[SavedJobService] Firestore update failed:', err);
    }
  }

  const existingList = getLocalSavedJobs(cleanUid);
  const updatedList = existingList.map((item) => (item.jobId === cleanJobId ? updatedRecord : item));
  if (!updatedList.some((item) => item.jobId === cleanJobId)) {
    updatedList.unshift(updatedRecord);
  }
  setLocalSavedJobs(cleanUid, updatedList);

  return updatedRecord;
}

/**
 * Check if a single job is saved by the user
 */
export async function getSavedJob(uid: string, jobId: string): Promise<SavedJob | null> {
  if (!uid || !jobId) return null;

  const cleanUid = uid.trim();
  const cleanJobId = jobId.trim();
  const docId = `${cleanUid}_${cleanJobId}`;

  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'savedJobs', docId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return snap.data() as SavedJob;
      }
    } catch (err) {
      console.warn('[SavedJobService] Firestore getDoc failed, checking local:', err);
    }
  }

  const local = getLocalSavedJobs(cleanUid);
  return local.find((item) => item.jobId === cleanJobId) || null;
}

/**
 * Fetch all saved job records for a user
 */
export async function fetchSavedJobs(uid: string): Promise<SavedJob[]> {
  if (!uid || !uid.trim()) return [];
  const cleanUid = uid.trim();

  if (db && isFirebaseConfigured) {
    try {
      const q = query(collection(db, 'savedJobs'), where('uid', '==', cleanUid));
      const querySnap = await getDocs(q);
      const results: SavedJob[] = [];
      querySnap.forEach((docSnap) => {
        results.push(docSnap.data() as SavedJob);
      });

      // Sort by savedAt descending
      results.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());

      // Sync local cache
      setLocalSavedJobs(cleanUid, results);
      return results;
    } catch (err) {
      console.warn('[SavedJobService] Firestore query failed, using local cache:', err);
    }
  }

  const local = getLocalSavedJobs(cleanUid);
  return local.sort((a, b) => new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime());
}

export interface EnrichedSavedJobItem {
  savedJob: SavedJob;
  job: Job | null;
  isUnavailable: boolean;
}

/**
 * Fetches all saved jobs with their corresponding Job listing data from the Job API.
 * Handles jobs that are no longer available/active gracefully without throwing.
 */
export async function fetchSavedJobsWithDetails(uid: string): Promise<EnrichedSavedJobItem[]> {
  const savedRecords = await fetchSavedJobs(uid);
  if (savedRecords.length === 0) return [];

  const results: EnrichedSavedJobItem[] = await Promise.all(
    savedRecords.map(async (savedJob) => {
      try {
        const jobRes = await getJobById(savedJob.jobId);
        if (jobRes && jobRes.job) {
          return {
            savedJob,
            job: jobRes.job,
            isUnavailable: false,
          };
        }
        return {
          savedJob,
          job: null,
          isUnavailable: true,
        };
      } catch (err: any) {
        return {
          savedJob,
          job: null,
          isUnavailable: true,
        };
      }
    })
  );

  return results;
}
