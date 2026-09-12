import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import {
  UserSettings,
  CurrencyCode,
  JobSortPreference,
  RefreshInterval,
  NotificationCadence,
  ProfileVisibility,
} from '../types';

const LOCAL_STORAGE_SETTINGS_PREFIX = 'wfh_user_settings_';

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'uid'> = {
  account: {
    displayName: '',
    contactEmail: '',
    locale: 'en-US',
  },
  jobPreferences: {
    minHourlyRate: 15,
    currency: 'USD',
    defaultSort: 'NEWEST',
    autoRefreshInterval: '15_MIN',
    compactView: false,
    confirmExternalRedirects: true,
  },
  notifications: {
    emailCadence: 'DAILY',
    notifyOnMatchingRoles: true,
    notifyOnRateSpikes: true,
    notifyOnApplicationDeadlines: true,
    notifySystemAnnouncements: true,
  },
  privacy: {
    visibility: 'PUBLIC_TO_RECRUITERS',
    allowSearchIndexing: true,
    recordSearchTelemetry: true,
    shareAnonymousSalaryStats: false,
  },
};

/**
 * Generates default settings instance for a given user
 */
export function createDefaultSettings(
  uid: string,
  hints?: { displayName?: string | null; email?: string | null }
): UserSettings {
  const nowIso = new Date().toISOString();
  return {
    uid,
    account: {
      displayName: hints?.displayName || '',
      contactEmail: hints?.email || '',
      locale: typeof navigator !== 'undefined' ? navigator.language || 'en-US' : 'en-US',
    },
    jobPreferences: {
      ...DEFAULT_USER_SETTINGS.jobPreferences,
    },
    notifications: {
      ...DEFAULT_USER_SETTINGS.notifications,
    },
    privacy: {
      ...DEFAULT_USER_SETTINGS.privacy,
    },
    createdAt: nowIso,
    updatedAt: nowIso,
  };
}

/**
 * Loads the user's settings document from Firestore (or localStorage fallback).
 * Uses the authenticated UID to guarantee user isolation.
 */
export async function fetchUserSettings(uid: string): Promise<UserSettings | null> {
  if (!uid) return null;

  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'user_settings', uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<UserSettings>;
        return sanitizeSettings(uid, data);
      }
    } catch (err) {
      console.warn('[SettingsService] Firestore fetch error (falling back to local storage):', err);
    }
  }

  // Fallback to local storage
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_SETTINGS_PREFIX}${uid}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return sanitizeSettings(uid, parsed);
    }
  } catch {
    // Ignore local storage parse errors
  }

  return null;
}

/**
 * Persists settings to Firestore document `/user_settings/{uid}` and caches locally.
 */
export async function saveUserSettings(
  uid: string,
  settings: Partial<UserSettings>
): Promise<UserSettings> {
  if (!uid) {
    throw new Error('Authentication error: Cannot update settings without an active user ID.');
  }

  const sanitized = sanitizeSettings(uid, settings);
  sanitized.updatedAt = new Date().toISOString();

  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'user_settings', uid);
      await setDoc(docRef, sanitized, { merge: true });
    } catch (err: unknown) {
      console.error('[SettingsService] Firestore save error:', err);
      // Cache locally in case of network issue
      try {
        localStorage.setItem(`${LOCAL_STORAGE_SETTINGS_PREFIX}${uid}`, JSON.stringify(sanitized));
      } catch {}
      const errMsg = err instanceof Error ? err.message : 'Failed to save settings to Firestore.';
      throw new Error(errMsg);
    }
  }

  // Local storage cache
  try {
    localStorage.setItem(`${LOCAL_STORAGE_SETTINGS_PREFIX}${uid}`, JSON.stringify(sanitized));
  } catch {}

  return sanitized;
}

/**
 * Validates and populates missing fields with default values
 */
function sanitizeSettings(uid: string, data: Partial<UserSettings>): UserSettings {
  const account: Partial<UserSettings['account']> = data.account || {};
  const jobPrefs: Partial<UserSettings['jobPreferences']> = data.jobPreferences || {};
  const notifs: Partial<UserSettings['notifications']> = data.notifications || {};
  const privacy: Partial<UserSettings['privacy']> = data.privacy || {};

  const validCurrencies: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'SGD', 'INR'];
  const validSorts: JobSortPreference[] = ['NEWEST', 'HIGHEST_RATE', 'TITLE_AZ', 'LOWEST_RATE'];
  const validRefresh: RefreshInterval[] = ['OFF', '5_MIN', '15_MIN', '30_MIN'];
  const validCadence: NotificationCadence[] = ['INSTANT', 'DAILY', 'WEEKLY', 'OFF'];
  const validVisibility: ProfileVisibility[] = ['PUBLIC_TO_RECRUITERS', 'ONLY_APPLIED', 'COMPLETELY_PRIVATE'];

  const rawRate = Number(jobPrefs.minHourlyRate);
  const safeRate = isNaN(rawRate) ? 15 : Math.max(0, Math.min(500, rawRate));

  return {
    uid,
    account: {
      displayName: typeof account.displayName === 'string' ? account.displayName.trim().slice(0, 80) : '',
      contactEmail: typeof account.contactEmail === 'string' ? account.contactEmail.trim().slice(0, 120) : '',
      locale: typeof account.locale === 'string' ? account.locale.trim().slice(0, 20) || 'en-US' : 'en-US',
    },
    jobPreferences: {
      minHourlyRate: safeRate,
      currency: validCurrencies.includes(jobPrefs.currency as CurrencyCode) ? (jobPrefs.currency as CurrencyCode) : 'USD',
      defaultSort: validSorts.includes(jobPrefs.defaultSort as JobSortPreference) ? (jobPrefs.defaultSort as JobSortPreference) : 'NEWEST',
      autoRefreshInterval: validRefresh.includes(jobPrefs.autoRefreshInterval as RefreshInterval) ? (jobPrefs.autoRefreshInterval as RefreshInterval) : '15_MIN',
      compactView: Boolean(jobPrefs.compactView),
      confirmExternalRedirects: jobPrefs.confirmExternalRedirects !== false,
    },
    notifications: {
      emailCadence: validCadence.includes(notifs.emailCadence as NotificationCadence) ? (notifs.emailCadence as NotificationCadence) : 'DAILY',
      notifyOnMatchingRoles: notifs.notifyOnMatchingRoles !== false,
      notifyOnRateSpikes: notifs.notifyOnRateSpikes !== false,
      notifyOnApplicationDeadlines: notifs.notifyOnApplicationDeadlines !== false,
      notifySystemAnnouncements: notifs.notifySystemAnnouncements !== false,
    },
    privacy: {
      visibility: validVisibility.includes(privacy.visibility as ProfileVisibility) ? (privacy.visibility as ProfileVisibility) : 'PUBLIC_TO_RECRUITERS',
      allowSearchIndexing: privacy.allowSearchIndexing !== false,
      recordSearchTelemetry: privacy.recordSearchTelemetry !== false,
      shareAnonymousSalaryStats: Boolean(privacy.shareAnonymousSalaryStats),
    },
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt || new Date().toISOString(),
  };
}
