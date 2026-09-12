import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../lib/firebase';
import { getAuthErrorMessage } from '../lib/authErrors';
import { recordSignupEvent, recordLoginEvent } from '../lib/eventService';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: 'user' | 'admin';
}

export interface AuthContextType {
  user: AppUser | null;
  rawUser: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
  isFirebaseConfigured: boolean;
  // Auth Operations
  signUpWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
  // Dev & Boundary Simulator Helpers (Preserved for route validation)
  setSimulatedAuth: (auth: boolean) => void;
  setSimulatedAdmin: (admin: boolean) => void;
  resetSimulatedState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Known Admin email addresses for initial admin claim verification
const ADMIN_EMAILS = [
  'singhdesires@gmail.com',
  'admin@wfh-ai-jobs.internal',
  'admin@example.com'
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [rawUser, setRawUser] = useState<User | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [simulatedAdmin, setSimulatedAdminState] = useState<boolean>(false);
  const [simulatedUser, setSimulatedUserState] = useState<AppUser | null>(null);

  // Synchronize with Firebase Auth state
  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      // If Firebase is not yet configured, finish loading state immediately
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        if (firebaseUser) {
          const userEmail = firebaseUser.email || '';
          const isUserAdmin = ADMIN_EMAILS.includes(userEmail.toLowerCase());
          
          const mappedUser: AppUser = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Job Seeker'),
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
            role: isUserAdmin ? 'admin' : 'user',
          };
          
          setRawUser(firebaseUser);
          setUser(mappedUser);
          setSimulatedUserState(null); // Clear simulated state on real auth
        } else {
          setRawUser(null);
          setUser(null);
        }
        setLoading(false);
      },
      (authError) => {
        console.error('[Auth State Error]:', authError);
        setError(getAuthErrorMessage(authError));
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  // Email & Password Registration
  const signUpWithEmail = async (email: string, password: string, displayName?: string) => {
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      // Offline / Local Simulation Mode
      const simulated: AppUser = {
        uid: `local-${Date.now()}`,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
        emailVerified: true,
        role: ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user',
      };
      setSimulatedUserState(simulated);
      setUser(simulated);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      // Record telemetry for successful signup
      recordSignupEvent({ method: 'email', role: 'user' }).catch(() => {});
      // onAuthStateChanged will handle setting the state
    } catch (err) {
      const friendlyMessage = getAuthErrorMessage(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  // Email & Password Sign In
  const signInWithEmail = async (email: string, password: string) => {
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      // Offline / Local Simulation Mode
      const simulated: AppUser = {
        uid: `local-${Date.now()}`,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
        emailVerified: true,
        role: ADMIN_EMAILS.includes(email.toLowerCase()) ? 'admin' : 'user',
      };
      setSimulatedUserState(simulated);
      setUser(simulated);
      recordLoginEvent({ method: 'email' }).catch(() => {});
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Record telemetry for successful login
      recordLoginEvent({ method: 'email' }).catch(() => {});
      // onAuthStateChanged will handle setting the state
    } catch (err) {
      const friendlyMessage = getAuthErrorMessage(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  // Google Sign In via Popup
  const signInWithGoogle = async () => {
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      // Offline / Local Simulation Mode
      const simulated: AppUser = {
        uid: `google-${Date.now()}`,
        email: 'singhdesires@gmail.com',
        displayName: 'Google Job Seeker',
        photoURL: null,
        emailVerified: true,
        role: 'admin',
      };
      setSimulatedUserState(simulated);
      setUser(simulated);
      recordLoginEvent({ method: 'google' }).catch(() => {});
      return;
    }

    try {
      await signInWithPopup(auth, googleProvider);
      // Record telemetry for Google login
      recordLoginEvent({ method: 'google' }).catch(() => {});
      // onAuthStateChanged will handle setting the state
    } catch (err) {
      const friendlyMessage = getAuthErrorMessage(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  // Password Reset Email
  const sendPasswordReset = async (email: string) => {
    setError(null);
    if (!auth || !isFirebaseConfigured) {
      console.info('[Auth Simulation] Password reset requested for:', email);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
    } catch (err) {
      const friendlyMessage = getAuthErrorMessage(err);
      setError(friendlyMessage);
      throw new Error(friendlyMessage);
    }
  };

  // Sign Out
  const signOutUser = async () => {
    setError(null);
    setSimulatedUserState(null);
    setSimulatedAdminState(false);
    setUser(null);
    setRawUser(null);

    if (auth && isFirebaseConfigured) {
      try {
        await signOut(auth);
      } catch (err) {
        console.error('[Sign Out Error]:', err);
      }
    }
  };

  // Simulator helper methods (for route boundary tests)
  const setSimulatedAuth = (isAuth: boolean) => {
    if (isAuth) {
      const simUser: AppUser = {
        uid: 'simulated-jobseeker-1',
        email: 'jobseeker@example.com',
        displayName: 'Simulated Job Seeker',
        photoURL: null,
        emailVerified: true,
        role: 'user',
      };
      setSimulatedUserState(simUser);
      setUser(simUser);
    } else {
      setSimulatedUserState(null);
      setSimulatedAdminState(false);
      setUser(null);
      setRawUser(null);
    }
  };

  const setSimulatedAdmin = (isAdminVal: boolean) => {
    if (isAdminVal) {
      const simAdmin: AppUser = {
        uid: 'simulated-admin-1',
        email: 'admin@wfh-ai-jobs.internal',
        displayName: 'System Administrator',
        photoURL: null,
        emailVerified: true,
        role: 'admin',
      };
      setSimulatedUserState(simAdmin);
      setUser(simAdmin);
      setSimulatedAdminState(true);
    } else {
      setSimulatedAdminState(false);
    }
  };

  const resetSimulatedState = () => {
    setSimulatedUserState(null);
    setSimulatedAdminState(false);
    setUser(null);
    setRawUser(null);
  };

  // Calculated properties
  const activeUser = user || simulatedUser;
  const isAuthenticated = Boolean(activeUser);
  const isAdmin = Boolean(activeUser?.role === 'admin' || simulatedAdmin);

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        rawUser,
        isAuthenticated,
        isAdmin,
        loading,
        error,
        isFirebaseConfigured,
        signUpWithEmail,
        signInWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        signOutUser,
        clearError,
        setSimulatedAuth,
        setSimulatedAdmin,
        resetSimulatedState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
