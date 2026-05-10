import type { Scan, ScanItem } from '@/domain/entities/Scan';
import { SCORE_TO_VERDICT, type VerdictId } from '@/domain/entities/Verdict';

const SAFE_VERDICTS: VerdictId[] = ['all_good', 'mostly_fine'];

export const isSafeVerdict = (verdict: VerdictId): boolean =>
  SAFE_VERDICTS.includes(verdict);

export const splitItemsBySafety = (items: ScanItem[]) => {
  const safe: ScanItem[] = [];
  const flagged: ScanItem[] = [];
  for (const item of items) {
    if (isSafeVerdict(item.verdict)) safe.push(item);
    else flagged.push(item);
  }
  return { safe, flagged };
};

// For ingredient labels we surface the harshest verdict as the headline.
export const overallVerdict = (items: ScanItem[]): VerdictId => {
  if (items.length === 0) return 'all_good';
  const minScore = items.reduce((m, it) => Math.min(m, it.score), 5);
  return SCORE_TO_VERDICT[minScore as 0 | 1 | 2 | 3 | 4 | 5];
};

export const flaggedItems = (scan: Scan): ScanItem[] =>
  scan.items.filter((it) => !isSafeVerdict(it.verdict));
