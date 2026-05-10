export type VerdictId = 'all_good' | 'mostly_fine' | 'eat_less' | 'not_ideal' | 'skip_it';

export type VerdictScore = 0 | 1 | 2 | 3 | 4 | 5;

export const SCORE_TO_VERDICT: Record<VerdictScore, VerdictId> = {
  5: 'all_good',
  4: 'mostly_fine',
  3: 'eat_less',
  2: 'not_ideal',
  1: 'skip_it',
  0: 'skip_it',
};

export const VERDICT_LABELS: Record<VerdictId, string> = {
  all_good: 'All Good!',
  mostly_fine: 'Mostly Fine',
  eat_less: 'Eat Less',
  not_ideal: 'Not Ideal',
  skip_it: 'Skip It',
};
