import { create } from 'zustand';

import { getDemoMealPhotoBase64 } from '@/data/services/demoMealPhoto';
import { analyseMeal, type AnalyseResult } from '@/data/services/openai';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { calculateAge } from '@/utils/age';

type DemoScanStatus = 'idle' | 'loading' | 'done' | 'failed';

interface DemoScanState {
  status: DemoScanStatus;
  result: AnalyseResult | null;
  run: () => Promise<void>;
  reset: () => void;
}

const DEFAULT_WEIGHT_KG = 70;
const DEFAULT_AGE_YEARS = 30;

export const useDemoScanStore = create<DemoScanState>((set, get) => ({
  status: 'idle',
  result: null,
  run: async () => {
    const current = get().status;
    if (current === 'loading' || current === 'done') return;

    set({ status: 'loading', result: null });
    try {
      const answers = useOnboardingStore.getState().answers;
      const photoBase64 = await getDemoMealPhotoBase64();
      const ageYears = answers.birthday
        ? calculateAge(answers.birthday)
        : DEFAULT_AGE_YEARS;

      const result = await analyseMeal({
        photoBase64,
        conditions: answers.conditions,
        customConditions: answers.customConditions,
        ageYears,
        weightKg: answers.weightKg ?? DEFAULT_WEIGHT_KG,
      });

      if (result.scanType === 'unrecognised' || result.items.length === 0) {
        set({ status: 'failed', result: null });
        return;
      }
      set({ status: 'done', result });
    } catch {
      set({ status: 'failed', result: null });
    }
  },
  reset: () => set({ status: 'idle', result: null }),
}));
