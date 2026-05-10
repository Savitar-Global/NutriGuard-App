import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { HeightUnit, WeightUnit } from '@/utils/units';

interface LocalProfileState {
  avatarUriByUid: Record<string, string>;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  setAvatarUri: (uid: string, uri: string) => void;
  clearAvatarUri: (uid: string) => void;
  setWeightUnit: (unit: WeightUnit) => void;
  setHeightUnit: (unit: HeightUnit) => void;
}

export const useLocalProfileStore = create<LocalProfileState>()(
  persist(
    (set) => ({
      avatarUriByUid: {},
      weightUnit: 'kg',
      heightUnit: 'cm',
      setAvatarUri: (uid, uri) =>
        set((s) => ({
          avatarUriByUid: { ...s.avatarUriByUid, [uid]: uri },
        })),
      clearAvatarUri: (uid) =>
        set((s) => {
          const next = { ...s.avatarUriByUid };
          delete next[uid];
          return { avatarUriByUid: next };
        }),
      setWeightUnit: (unit) => set({ weightUnit: unit }),
      setHeightUnit: (unit) => set({ heightUnit: unit }),
    }),
    {
      name: 'nutriguard-local-profile',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const useLocalAvatarUri = (uid: string | undefined): string | null => {
  const map = useLocalProfileStore((s) => s.avatarUriByUid);
  return uid ? (map[uid] ?? null) : null;
};
