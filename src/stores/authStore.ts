import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  onAuthStateChanged,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { create } from 'zustand';

import { firestoreScanRepository } from '@/data/repositories/FirestoreScanRepository';
import { firestoreUserRepository } from '@/data/repositories/FirestoreUserRepository';
import { firebaseAuth } from '@/data/services/firebase';
import { requestAppleCredential } from '@/data/services/appleAuth';
import { deleteAvatarLocally } from '@/data/services/avatarStorage';
import { useLocalProfileStore } from '@/stores/localProfileStore';
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
  deleteAccount: (
    getPassword?: () => Promise<string | null>,
  ) => Promise<void>;
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
  'auth/requires-recent-login': 'AUTH_REQUIRES_RECENT_LOGIN',
  ERR_REQUEST_CANCELED: 'AUTH_CANCELLED',
};

const mapFirebaseError = (raw: unknown): AppError => {
  if (raw instanceof AppError) return raw;
  const code = (raw as { code?: string } | null)?.code ?? '';
  const message = (raw as { message?: string } | null)?.message;
  return new AppError(FIREBASE_ERROR_MAP[code] ?? 'UNKNOWN', message ?? code);
};

/**
 * Re-verify the signed-in user in place — no sign-out round trip. Firebase
 * demands a recent login before destructive account ops; this satisfies
 * that requirement transparently:
 *
 * - Apple users → native Apple sheet (Face ID / one tap).
 * - Email users → caller-supplied `getPassword` prompt (the only provider
 *   where a credential can't be re-derived silently).
 */
const reauthenticateCurrentUser = async (
  user: FirebaseUser,
  getPassword?: () => Promise<string | null>,
): Promise<void> => {
  const providerId = user.providerData[0]?.providerId;

  if (providerId === 'apple.com') {
    const apple = await requestAppleCredential();
    await reauthenticateWithCredential(user, apple.credential);
    return;
  }

  if (!getPassword || !user.email) {
    throw new AppError('AUTH_REQUIRES_RECENT_LOGIN');
  }
  const password = await getPassword();
  if (!password) {
    throw new AppError('AUTH_CANCELLED');
  }
  await reauthenticateWithCredential(
    user,
    EmailAuthProvider.credential(user.email, password),
  );
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

  deleteAccount: async (getPassword) => {
    const current = firebaseAuth.currentUser;
    if (!current) return;
    if (get().isSubmitting) return;
    set({ isSubmitting: true, error: null });

    const { uid } = current;
    try {
      // Cloud data must be erased while the user is still authenticated —
      // Firestore security rules reject writes once the auth user is gone.
      // Both deletes are idempotent, so a later retry is safe.
      await firestoreScanRepository.clear(uid);
      await firestoreUserRepository.delete(uid);

      // Device-local artefacts that AuthGate's store resets don't cover.
      await deleteAvatarLocally(uid);
      useLocalProfileStore.getState().clearAvatarUri(uid);

      // Removing the auth user flips onAuthStateChanged → null, which makes
      // AuthGate reset the user/scan/entitlement stores (same path as signOut).
      try {
        await deleteUser(current);
      } catch (err) {
        if ((err as { code?: string } | null)?.code !== 'auth/requires-recent-login') {
          throw err;
        }
        // Stale token — re-verify in place (no sign-out) and finish deleting.
        await reauthenticateCurrentUser(current, getPassword);
        await deleteUser(current);
      }
    } catch (err) {
      const mapped = mapFirebaseError(err);
      set({ error: mapped });
      throw mapped;
    } finally {
      set({ isSubmitting: false });
    }
  },

  clearError: () => set({ error: null }),
}));
