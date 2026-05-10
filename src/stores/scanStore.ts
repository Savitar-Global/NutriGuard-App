import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { firestoreScanRepository } from '@/data/repositories/FirestoreScanRepository';
import { firebaseAuth } from '@/data/services/firebase';
import {
  analyseMealUseCase,
  type AnalyseMealInput,
} from '@/domain/usecases/AnalyseMealUseCase';
import type { Scan } from '@/domain/entities/Scan';
import { AppError } from '@/types/global';

interface ScanState {
  current: Scan | null;
  isAnalysing: boolean;
  error: AppError | null;

  analyse: (input: AnalyseMealInput) => Promise<Scan>;
  markDamageControlVisited: (itemId: string) => void;
  hydrateFromCloud: (uid: string) => Promise<void>;
  clearError: () => void;
  reset: () => void;
}

const wrapError = (raw: unknown): AppError => {
  if (raw instanceof AppError) return raw;
  const message = (raw as { message?: string } | null)?.message;
  return new AppError('UNKNOWN', message ?? 'Something went wrong');
};

const persistToCloud = (scan: Scan): void => {
  const uid = firebaseAuth.currentUser?.uid;
  if (!uid) return;
  void firestoreScanRepository.save(uid, scan).catch((err) => {
    // Cloud is best-effort — local persist still has the scan.
    console.error('[scanStore] cloud save failed', err);
  });
};

export const useScanStore = create<ScanState>()(
  persist(
    (set, get) => ({
      current: null,
      isAnalysing: false,
      error: null,

      analyse: async (input) => {
        set({ isAnalysing: true, error: null });
        try {
          const scan = await analyseMealUseCase(input);
          set({ current: scan });
          persistToCloud(scan);
          return scan;
        } catch (err) {
          const mapped = wrapError(err);
          console.error('[scanStore] analyse failed', mapped);
          set({ error: mapped });
          throw mapped;
        } finally {
          set({ isAnalysing: false });
        }
      },

      markDamageControlVisited: (itemId) => {
        const current = get().current;
        if (!current) return;
        if (current.damageControlVisited.includes(itemId)) return;
        const next: Scan = {
          ...current,
          damageControlVisited: [...current.damageControlVisited, itemId],
        };
        set({ current: next });
        persistToCloud(next);
      },

      hydrateFromCloud: async (uid) => {
        try {
          const cloud = await firestoreScanRepository.load(uid);
          if (!cloud) return;
          const local = get().current;
          // Prefer whichever scan is newer — local may have just been written.
          if (!local || cloud.createdAt.getTime() > local.createdAt.getTime()) {
            set({ current: cloud });
          }
        } catch (err) {
          console.error('[scanStore] hydrateFromCloud failed', err);
        }
      },

      clearError: () => set({ error: null }),

      reset: () =>
        set({ current: null, isAnalysing: false, error: null }),
    }),
    {
      name: 'nutriguard-scan',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ current: state.current }),
      onRehydrateStorage: () => (state) => {
        if (state?.current) {
          // JSON.parse leaves dates as ISO strings — revive them.
          state.current.createdAt = new Date(state.current.createdAt);
        }
      },
    },
  ),
);
