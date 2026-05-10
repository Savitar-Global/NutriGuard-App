import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { firestoreUserRepository } from '@/data/repositories/FirestoreUserRepository';
import type { ConditionId } from '@/domain/entities/Condition';
import type { User } from '@/domain/entities/User';
import type { SeedUserInput } from '@/domain/repositories/UserRepository';
import { AppError } from '@/types/global';

interface ConditionsPatch {
  conditions: ConditionId[];
  customConditions: string[];
}

type ProfilePatch = Partial<
  Pick<User, 'displayName' | 'weightKg' | 'heightCm' | 'birthday'>
>;

interface UserState {
  profile: User | null;
  isLoading: boolean;
  isSaving: boolean;
  error: AppError | null;

  ensure: (input: SeedUserInput) => Promise<void>;
  saveConditions: (uid: string, patch: ConditionsPatch) => Promise<void>;
  updateProfile: (uid: string, patch: ProfilePatch) => Promise<void>;
  reset: () => void;
  clearError: () => void;
}

const wrapError = (raw: unknown): AppError => {
  if (raw instanceof AppError) return raw;
  const message = (raw as { message?: string } | null)?.message;
  return new AppError('UNKNOWN', message ?? 'Something went wrong');
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      profile: null,
      isLoading: false,
      isSaving: false,
      error: null,

      ensure: async (input) => {
        if (get().isLoading) return;
        set({ isLoading: true, error: null });
        try {
          const profile = await firestoreUserRepository.seedIfMissing(input);
          set({ profile });
        } catch (err) {
          console.error('[userStore] failed to load/seed user doc', err);
          set({ error: wrapError(err) });
        } finally {
          set({ isLoading: false });
        }
      },

      saveConditions: async (uid, patch) => {
        if (get().isSaving) return;
        set({ isSaving: true, error: null });
        try {
          await firestoreUserRepository.update(uid, patch);
          const current = get().profile;
          if (current) {
            set({ profile: { ...current, ...patch, updatedAt: new Date() } });
          } else {
            const fresh = await firestoreUserRepository.get(uid);
            set({ profile: fresh });
          }
        } catch (err) {
          console.error('[userStore] failed to save conditions', err);
          const mapped = wrapError(err);
          set({ error: mapped });
          throw mapped;
        } finally {
          set({ isSaving: false });
        }
      },

      updateProfile: async (uid, patch) => {
        if (get().isSaving) return;
        set({ isSaving: true, error: null });
        try {
          await firestoreUserRepository.update(uid, patch);
          const current = get().profile;
          if (current) {
            set({ profile: { ...current, ...patch, updatedAt: new Date() } });
          } else {
            const fresh = await firestoreUserRepository.get(uid);
            set({ profile: fresh });
          }
        } catch (err) {
          console.error('[userStore] failed to update profile', err);
          const mapped = wrapError(err);
          set({ error: mapped });
          throw mapped;
        } finally {
          set({ isSaving: false });
        }
      },

      reset: () => set({ profile: null, error: null, isLoading: false, isSaving: false }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'nutriguard-user',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ profile: state.profile }),
    },
  ),
);
