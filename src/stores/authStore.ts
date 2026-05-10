import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { create } from 'zustand';

import { firestoreUserRepository } from '@/data/repositories/FirestoreUserRepository';
import { firebaseAuth } from '@/data/services/firebase';
import { requestAppleCredential } from '@/data/services/appleAuth';
import { AppError, type AppErrorCode } from '@/types/global';

interface AuthState {
  user: FirebaseUser | null;
  isInitialising: boolean;
  isSubmitting: boolean;
  error: AppError | null;

  init: () => () => void;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signInWithApple: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const FIREBASE_ERROR_MAP: Record<string, AppErrorCode> = {
  'auth/invalid-email': 'AUTH_INVALID',
  'auth/invalid-credential': 'AUTH_WRONG_PASSWORD',
  'auth/user-not-found': 'AUTH_USER_NOT_FOUND',
  'auth/wrong-password': 'AUTH_WRONG_PASSWORD',
  'auth/email-already-in-use': 'AUTH_EMAIL_IN_USE',
  'auth/weak-password': 'AUTH_WEAK_PASSWORD',
  'auth/network-request-failed': 'AUTH_NETWORK',
  'auth/too-many-requests': 'AUTH_RATE_LIMITED',
  ERR_REQUEST_CANCELED: 'AUTH_CANCELLED',
};

const mapFirebaseError = (raw: unknown): AppError => {
  if (raw instanceof AppError) return raw;
  const code = (raw as { code?: string } | null)?.code ?? '';
  const message = (raw as { message?: string } | null)?.message;
  return new AppError(FIREBASE_ERROR_MAP[code] ?? 'UNKNOWN', message ?? code);
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isInitialising: true,
  isSubmitting: false,
  error: null,

  init: () =>
    onAuthStateChanged(firebaseAuth, (u) => {
      set({ user: u, isInitialising: false });
    }),

  signUpWithEmail: async (email, password) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true, error: null });
    try {
      const { user } = await createUserWithEmailAndPassword(
        firebaseAuth,
        email.trim(),
        password,
      );
      try {
        await firestoreUserRepository.seedIfMissing({
          uid: user.uid,
          email: user.email ?? email.trim(),
          displayName: user.displayName,
          authProvider: 'password',
        });
      } catch (seedErr) {
        // Seed failure isn't fatal — AuthGate's ensure() will retry on next render.
        console.error('[authStore] seedIfMissing failed after signup', seedErr);
      }
    } catch (err) {
      set({ error: mapFirebaseError(err) });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  signInWithEmail: async (email, password) => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true, error: null });
    try {
      await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
    } catch (err) {
      set({ error: mapFirebaseError(err) });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  signInWithApple: async () => {
    if (get().isSubmitting) return;
    set({ isSubmitting: true, error: null });
    try {
      const apple = await requestAppleCredential();
      const { user } = await signInWithCredential(firebaseAuth, apple.credential);
      try {
        await firestoreUserRepository.seedIfMissing({
          uid: user.uid,
          email: user.email ?? apple.email ?? '',
          displayName: user.displayName ?? apple.fullName,
          authProvider: 'apple',
        });
      } catch (seedErr) {
        console.error('[authStore] seedIfMissing failed after Apple sign-in', seedErr);
      }
    } catch (err) {
      const mapped = mapFirebaseError(err);
      if (mapped.code !== 'AUTH_CANCELLED') {
        set({ error: mapped });
        throw err;
      }
    } finally {
      set({ isSubmitting: false });
    }
  },

  sendPasswordReset: async (email) => {
    set({ error: null });
    try {
      await sendPasswordResetEmail(firebaseAuth, email.trim());
    } catch (err) {
      set({ error: mapFirebaseError(err) });
      throw err;
    }
  },

  signOut: async () => {
    await firebaseSignOut(firebaseAuth);
  },

  clearError: () => set({ error: null }),
}));
