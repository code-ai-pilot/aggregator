import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import {
  SavedJob,
  SavedJobStatus,
  Job,
} from '../types';
import {
  saveJob as apiSaveJob,
  unsaveJob as apiUnsaveJob,
  updateSavedJob as apiUpdateSavedJob,
  fetchSavedJobs,
  fetchSavedJobsWithDetails,
  EnrichedSavedJobItem,
} from '../lib/savedJobService';

interface SavedJobsContextType {
  savedJobIds: Set<string>;
  savedJobs: SavedJob[];
  enrichedSavedJobs: EnrichedSavedJobItem[];
  isLoading: boolean;
  error: string | null;
  isJobSaved: (jobId: string) => boolean;
  getSavedJobRecord: (jobId: string) => SavedJob | undefined;
  save: (jobId: string, notes?: string, status?: SavedJobStatus) => Promise<SavedJob>;
  unsave: (jobId: string) => Promise<void>;
  toggleSave: (jobId: string) => Promise<boolean>;
  updateRecord: (jobId: string, updates: { notes?: string; status?: SavedJobStatus }) => Promise<SavedJob>;
  refreshSaved: () => Promise<void>;
  refreshEnriched: () => Promise<void>;
}

const SavedJobsContext = createContext<SavedJobsContextType | undefined>(undefined);

export function SavedJobsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [enrichedSavedJobs, setEnrichedSavedJobs] = useState<EnrichedSavedJobItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Derive Set of IDs for O(1) checks
  const savedJobIds = useMemo(() => {
    return new Set(savedJobs.map((item) => item.jobId));
  }, [savedJobs]);

  // Load user saved jobs list
  const refreshSaved = useCallback(async () => {
    if (!isAuthenticated || !user?.uid) {
      setSavedJobs([]);
      setEnrichedSavedJobs([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const records = await fetchSavedJobs(user.uid);
      setSavedJobs(records);
    } catch (err: any) {
      console.error('[SavedJobsContext] Failed to load saved jobs:', err);
      setError(err.message || 'Failed to retrieve saved jobs.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.uid]);

  // Load enriched saved jobs with full details
  const refreshEnriched = useCallback(async () => {
    if (!isAuthenticated || !user?.uid) {
      setEnrichedSavedJobs([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const enriched = await fetchSavedJobsWithDetails(user.uid);
      setEnrichedSavedJobs(enriched);
      // Also sync basic list
      setSavedJobs(enriched.map((item) => item.savedJob));
    } catch (err: any) {
      console.error('[SavedJobsContext] Failed to load enriched saved jobs:', err);
      setError(err.message || 'Failed to load saved jobs.');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.uid]);

  // Synchronize on authentication state change
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      refreshSaved();
    } else {
      setSavedJobs([]);
      setEnrichedSavedJobs([]);
    }
  }, [isAuthenticated, user?.uid, refreshSaved]);

  const isJobSaved = useCallback(
    (jobId: string): boolean => {
      if (!jobId) return false;
      return savedJobIds.has(jobId);
    },
    [savedJobIds]
  );

  const getSavedJobRecord = useCallback(
    (jobId: string): SavedJob | undefined => {
      return savedJobs.find((item) => item.jobId === jobId);
    },
    [savedJobs]
  );

  const save = useCallback(
    async (jobId: string, notes: string = '', status: SavedJobStatus = 'SAVED'): Promise<SavedJob> => {
      if (!isAuthenticated || !user?.uid) {
        throw new Error('You must be signed in to save jobs.');
      }
      const newRecord = await apiSaveJob(user.uid, jobId, notes, status);
      setSavedJobs((prev) => {
        const filtered = prev.filter((item) => item.jobId !== jobId);
        return [newRecord, ...filtered];
      });
      return newRecord;
    },
    [isAuthenticated, user?.uid]
  );

  const unsave = useCallback(
    async (jobId: string): Promise<void> => {
      if (!isAuthenticated || !user?.uid) {
        throw new Error('You must be signed in to manage saved jobs.');
      }
      await apiUnsaveJob(user.uid, jobId);
      setSavedJobs((prev) => prev.filter((item) => item.jobId !== jobId));
      setEnrichedSavedJobs((prev) => prev.filter((item) => item.savedJob.jobId !== jobId));
    },
    [isAuthenticated, user?.uid]
  );

  const toggleSave = useCallback(
    async (jobId: string): Promise<boolean> => {
      if (!jobId) return false;
      if (savedJobIds.has(jobId)) {
        await unsave(jobId);
        return false;
      } else {
        await save(jobId);
        return true;
      }
    },
    [savedJobIds, save, unsave]
  );

  const updateRecord = useCallback(
    async (jobId: string, updates: { notes?: string; status?: SavedJobStatus }): Promise<SavedJob> => {
      if (!isAuthenticated || !user?.uid) {
        throw new Error('Authentication required');
      }
      const updated = await apiUpdateSavedJob(user.uid, jobId, updates);
      setSavedJobs((prev) =>
        prev.map((item) => (item.jobId === jobId ? updated : item))
      );
      setEnrichedSavedJobs((prev) =>
        prev.map((item) => (item.savedJob.jobId === jobId ? { ...item, savedJob: updated } : item))
      );
      return updated;
    },
    [isAuthenticated, user?.uid]
  );

  const value = useMemo(
    () => ({
      savedJobIds,
      savedJobs,
      enrichedSavedJobs,
      isLoading,
      error,
      isJobSaved,
      getSavedJobRecord,
      save,
      unsave,
      toggleSave,
      updateRecord,
      refreshSaved,
      refreshEnriched,
    }),
    [
      savedJobIds,
      savedJobs,
      enrichedSavedJobs,
      isLoading,
      error,
      isJobSaved,
      getSavedJobRecord,
      save,
      unsave,
      toggleSave,
      updateRecord,
      refreshSaved,
      refreshEnriched,
    ]
  );

  return <SavedJobsContext.Provider value={value}>{children}</SavedJobsContext.Provider>;
}

export function useSavedJobs() {
  const context = useContext(SavedJobsContext);
  if (!context) {
    throw new Error('useSavedJobs must be used within a SavedJobsProvider');
  }
  return context;
}
