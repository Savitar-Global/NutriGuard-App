import { CONDITIONS } from '@/config/constants';
import type { ConditionId } from '@/domain/entities/Condition';
import type {
  AnxietyAnswer,
  CookingAnswer,
  CuisineAnswer,
  GoalAnswer,
  ManagingDuration,
  PainAnswer,
  StrategyAnswer,
} from '@/stores/onboardingStore';

/** Average meals per day used for the bombshell calculation. */
const MEALS_PER_DAY = 3;
const DAYS_PER_YEAR = 365;

/** Mid-point years used in the bombshell math for each duration bucket. */
const DURATION_MID_YEARS: Record<ManagingDuration, number> = {
  less_than_year: 0.5,
  one_to_three: 2,
  three_to_ten: 6,
  over_ten: 15,
};

const DURATION_LABEL: Record<ManagingDuration, string> = {
  less_than_year: 'less than a year',
  one_to_three: '1–3 years',
  three_to_ten: '3–10 years',
  over_ten: 'more than a decade',
};

const STRATEGY_REFLECTION: Record<
  StrategyAnswer,
  { headline: string; sub: string }
> = {
  google: {
    headline: 'Googling every meal is exhausting.',
    sub: "And the answer is rarely tailored to *you* — it's generic advice for a generic person.",
  },
  doctor: {
    headline: 'Old advice goes stale.',
    sub: "What your doctor said two years ago doesn't always match what's on your plate today.",
  },
  guess: {
    headline: 'Guessing is what makes the condition worse.',
    sub: 'Every wrong guess nudges your body in the wrong direction. It quietly adds up.',
  },
  avoid: {
    headline: 'Avoiding good food is no way to live.',
    sub: 'Some of the foods you skip are probably perfectly safe — you just never knew.',
  },
};

const PAIN_LABEL: Record<PainAnswer, string> = {
  eating_out: 'Eating out is a black box',
  labels: 'Reading labels is overwhelming',
  family: 'Family meals are hard to control',
  cravings: 'Cravings are hard to navigate',
};

const ANXIETY_LABEL: Record<AnxietyAnswer, string> = {
  every_meal: 'every single meal',
  few_times: 'a few times a week',
  restaurants: 'mostly when eating out',
  flagged_only: 'when something feels off',
};

const GOAL_LABEL: Record<GoalAnswer, string> = {
  eat_out: 'eat out without anxiety',
  enjoy_meals: 'actually enjoy meals again',
  stop_guessing: 'stop second-guessing every plate',
  stick_plan: 'stick to your plan with confidence',
};

const CUISINE_LABEL: Record<CuisineAnswer, string> = {
  western: 'Western (American / European)',
  mediterranean: 'Mediterranean',
  east_asian: 'East Asian',
  south_asian: 'South Asian',
  mixed: 'a mix of cuisines',
};

const COOKING_LABEL: Record<CookingAnswer, string> = {
  daily: 'cook for yourself most days',
  weekly: 'cook a few times a week',
  rarely: 'eat out or order in most of the time',
  mixed: 'split between cooking and ordering in',
};

export const yearsForDuration = (d: ManagingDuration): number =>
  DURATION_MID_YEARS[d];

export const labelForDuration = (d: ManagingDuration): string =>
  DURATION_LABEL[d];

export const computeBombshellMeals = (d: ManagingDuration): number =>
  Math.round(yearsForDuration(d) * DAYS_PER_YEAR * MEALS_PER_DAY);

const PRESET_LABELS: Record<ConditionId, string> = CONDITIONS.reduce(
  (acc, c) => {
    acc[c.id] = c.label;
    return acc;
  },
  {} as Record<ConditionId, string>,
);

/** Friendly first label to use in copy when only one condition slot fits. */
export const primaryConditionLabel = (
  ids: ConditionId[],
  customs: string[],
): string => {
  if (ids.length > 0) return PRESET_LABELS[ids[0]!] ?? 'your condition';
  if (customs.length > 0) return customs[0]!;
  return 'your condition';
};

/** Joined human-friendly list ("Diabetes & Gastritis", "Diabetes, Gastritis & gout"). */
export const conditionsSentence = (
  ids: ConditionId[],
  customs: string[],
): string => {
  const parts = [
    ...ids.map((id) => PRESET_LABELS[id] ?? id),
    ...customs,
  ];
  if (parts.length === 0) return 'your condition';
  if (parts.length === 1) return parts[0]!;
  if (parts.length === 2) return `${parts[0]} & ${parts[1]}`;
  const head = parts.slice(0, -1).join(', ');
  return `${head} & ${parts[parts.length - 1]}`;
};

export const reflectionForStrategy = (s: StrategyAnswer) =>
  STRATEGY_REFLECTION[s];

export const labelForPain = (p: PainAnswer): string => PAIN_LABEL[p];
export const labelForAnxiety = (a: AnxietyAnswer): string => ANXIETY_LABEL[a];
export const labelForGoal = (g: GoalAnswer): string => GOAL_LABEL[g];
export const labelForCuisine = (c: CuisineAnswer): string => CUISINE_LABEL[c];
export const labelForCooking = (c: CookingAnswer): string => COOKING_LABEL[c];
