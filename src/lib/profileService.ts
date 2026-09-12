import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { UserProfile, JobCategory, ExperienceLevel, AvailabilityStatus, WorkType } from '../types';

const LOCAL_STORAGE_PREFIX = 'wfh_user_profile_';

export const DEFAULT_PROFILE: Omit<UserProfile, 'uid'> = {
  firstName: '',
  lastName: '',
  country: '',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  languages: ['English'],
  skills: [],
  experienceLevel: 'ENTRY',
  preferredCategories: [],
  preferredWorkTypes: ['CONTRACT', 'HOURLY'],
  availability: 'IMMEDIATELY',
};

/**
 * Initializes a clean fallback profile object if none exists
 */
export function createDefaultProfile(
  uid: string,
  hints?: { displayName?: string | null; email?: string | null }
): UserProfile {
  let initialFirst = '';
  let initialLast = '';

  if (hints?.displayName) {
    const parts = hints.displayName.trim().split(' ');
    initialFirst = parts[0] || '';
    initialLast = parts.slice(1).join(' ') || '';
  }

  return {
    ...DEFAULT_PROFILE,
    uid,
    firstName: initialFirst,
    lastName: initialLast,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Loads the user's profile from Firestore (or localStorage fallback in offline/demo mode).
 * Restricts query strictly to the authenticated UID.
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  if (!uid) return null;

  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'users', uid);
      const snapshot = await getDoc(docRef);

      if (snapshot.exists()) {
        const data = snapshot.data();
        return {
          uid,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          country: data.country || '',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
          languages: Array.isArray(data.languages) ? data.languages : ['English'],
          skills: Array.isArray(data.skills) ? data.skills : [],
          experienceLevel: data.experienceLevel || 'ENTRY',
          preferredCategories: Array.isArray(data.preferredCategories) ? data.preferredCategories : [],
          preferredWorkTypes: Array.isArray(data.preferredWorkTypes) ? data.preferredWorkTypes : ['CONTRACT'],
          availability: data.availability || 'IMMEDIATELY',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      }
    } catch (err) {
      console.warn('[ProfileService] Firestore fetch error (attempting local fallback):', err);
    }
  }

  // Fallback to local storage (e.g. for offline evaluation or test simulation)
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${uid}`);
    if (raw) {
      return JSON.parse(raw) as UserProfile;
    }
  } catch {
    // ignore storage errors
  }

  return null;
}

/**
 * Saves or updates the user's profile in Firestore (or local storage fallback).
 * Uses the authenticated UID to guarantee identity boundaries.
 */
export async function saveUserProfile(
  uid: string,
  profileData: Partial<UserProfile>
): Promise<UserProfile> {
  if (!uid) {
    throw new Error('Authentication error: Cannot update profile without an active user ID.');
  }

  const nowIso = new Date().toISOString();

  // Sanitize and constrain inputs
  const cleanedProfile: UserProfile = {
    uid,
    firstName: (profileData.firstName || '').trim().slice(0, 60),
    lastName: (profileData.lastName || '').trim().slice(0, 60),
    country: (profileData.country || '').trim().slice(0, 80),
    timezone: (profileData.timezone || '').trim().slice(0, 80) || 'UTC',
    languages: Array.isArray(profileData.languages)
      ? Array.from(new Set(profileData.languages.map((l) => String(l).trim()).filter(Boolean))).slice(0, 20)
      : ['English'],
    skills: Array.isArray(profileData.skills)
      ? Array.from(new Set(profileData.skills.map((s) => String(s).trim()).filter(Boolean))).slice(0, 50)
      : [],
    experienceLevel: profileData.experienceLevel || 'ENTRY',
    preferredCategories: Array.isArray(profileData.preferredCategories)
      ? (profileData.preferredCategories as JobCategory[]).slice(0, 30)
      : [],
    preferredWorkTypes: Array.isArray(profileData.preferredWorkTypes)
      ? profileData.preferredWorkTypes.slice(0, 10)
      : ['CONTRACT'],
    availability: profileData.availability || 'IMMEDIATELY',
    createdAt: profileData.createdAt || nowIso,
    updatedAt: nowIso,
  };

  if (db && isFirebaseConfigured) {
    try {
      const docRef = doc(db, 'users', uid);
      await setDoc(docRef, cleanedProfile, { merge: true });
    } catch (err: unknown) {
      console.error('[ProfileService] Firestore save error:', err);
      // Fallback update to local storage
      try {
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${uid}`, JSON.stringify(cleanedProfile));
      } catch {}
      const errMsg = err instanceof Error ? err.message : 'Failed to save profile to Firestore.';
      throw new Error(errMsg);
    }
  }

  // Also cache locally for fast reload / offline resiliency
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${uid}`, JSON.stringify(cleanedProfile));
  } catch {}

  return cleanedProfile;
}
