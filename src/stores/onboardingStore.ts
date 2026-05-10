import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ConditionId } from '@/domain/entities/Condition';

export type ManagingDuration = 'less_than_year' | 'one_to_three' | 'three_to_ten' | 'over_ten';
export type StrategyAnswer = 'google' | 'doctor' | 'guess' | 'avoid';
export type PainAnswer = 'eating_out' | 'labels' | 'family' | 'cravings';
export type AnxietyAnswer = 'every_meal' | 'few_times' | 'restaurants' | 'flagged_only';
export type GoalAnswer = 'eat_out' | 'enjoy_meals' | 'stop_guessing' | 'stick_plan';
export type CuisineAnswer =
  | 'western'
  | 'mediterranean'
  | 'east_asian'
  | 'south_asian'
  | 'mixed';
export type CookingAnswer = 'daily' | 'weekly' | 'rarely' | 'mixed';
export type CommitmentAnswer = 'extremely' | 'very' | 'somewhat' | 'exploring';

export interface OnboardingAnswers {
  name: string | null;
  birthday: Date | null;

  conditions: ConditionId[];
  customConditions: string[];

  yearsManaging: ManagingDuration | null;

  strategy: StrategyAnswer | null;
  pain: PainAnswer | null;
  anxiety: AnxietyAnswer | null;
  goal: GoalAnswer | null;

  cuisine: CuisineAnswer | null;
  cooking: CookingAnswer | null;

  weightKg: number | null;
  heightCm: number | null;

  disclaimerAcknowledged: boolean;
  notificationsRequested: boolean;
  commitment: CommitmentAnswer | null;
}

const EMPTY_ANSWERS: OnboardingAnswers = {
  name: null,
  birthday: null,
  conditions: [],
  customConditions: [],
  yearsManaging: null,
  strategy: null,
  pain: null,
  anxiety: null,
  goal: null,
  cuisine: null,
  cooking: null,
  weightKg: null,
  heightCm: null,
  disclaimerAcknowledged: false,
  notificationsRequested: false,
  commitment: null,
};

interface OnboardingState {
  answers: OnboardingAnswers;
  patch: (patch: Partial<OnboardingAnswers>) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      answers: EMPTY_ANSWERS,
      patch: (patch) =>
        set((s) => ({ answers: { ...s.answers, ...patch } })),
      reset: () => set({ answers: EMPTY_ANSWERS }),
    }),
    {
      name: 'nutriguard-onboarding',
      storage: createJSONStorage(() => AsyncStorage, {
        reviver: (key, value) => {
          if (key === 'birthday' && typeof value === 'string') {
            const d = new Date(value);
            return Number.isNaN(d.getTime()) ? null : d;
          }
          return value;
        },
      }),
      partialize: (s) => ({ answers: s.answers }),
    },
  ),
);

export const onboardingHasMinimumProfile = (a: OnboardingAnswers): boolean =>
  a.name !== null &&
  a.birthday !== null &&
  (a.conditions.length > 0 || a.customConditions.length > 0) &&
  a.weightKg !== null &&
  a.heightCm !== null &&
  a.disclaimerAcknowledged;
