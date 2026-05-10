import { useCallback } from 'react';

import type { AnalyseMealInput } from '@/domain/usecases/AnalyseMealUseCase';
import { useUserStore } from '@/stores/userStore';
import { calculateAge } from '@/utils/age';

interface BuildArgs {
  photoUri?: string;
  text?: string;
}

type Builder = (args: BuildArgs) => AnalyseMealInput | null;

export const useBuildAnalyseInput = (): Builder => {
  const profile = useUserStore((s) => s.profile);

  return useCallback(
    ({ photoUri, text }: BuildArgs) => {
      if (!profile) return null;
      return {
        photoUri,
        text,
        conditions: profile.conditions,
        customConditions: profile.customConditions,
        ageYears: calculateAge(profile.birthday),
        weightKg: profile.weightKg,
      };
    },
    [profile],
  );
};
