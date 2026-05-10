import { Timestamp, type DocumentData } from 'firebase/firestore';

import type { Scan, ScanItem, ScanType } from '@/domain/entities/Scan';
import {
  SCORE_TO_VERDICT,
  type VerdictId,
  type VerdictScore,
} from '@/domain/entities/Verdict';

const SCAN_TYPES: ScanType[] = ['meal', 'ingredients', 'text', 'unrecognised'];

const VERDICT_IDS: VerdictId[] = [
  'all_good',
  'mostly_fine',
  'eat_less',
  'not_ideal',
  'skip_it',
];

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
};

const isScore = (n: unknown): n is VerdictScore =>
  typeof n === 'number' && n >= 0 && n <= 5 && Number.isInteger(n);

const itemFromDoc = (data: DocumentData): ScanItem => {
  const score = isScore(data['score']) ? data['score'] : 5;
  const rawVerdict = data['verdict'];
  const verdict: VerdictId = VERDICT_IDS.includes(rawVerdict as VerdictId)
    ? (rawVerdict as VerdictId)
    : SCORE_TO_VERDICT[score];

  return {
    id: (data['id'] as string) ?? '',
    name: (data['name'] as string) ?? '',
    score,
    verdict,
    reasoning: (data['reasoning'] as string) ?? '',
    damageControl: (data['damageControl'] as string) ?? '',
  };
};

export const scanFromDoc = (data: DocumentData): Scan => {
  const rawType = data['scanType'];
  const scanType: ScanType = SCAN_TYPES.includes(rawType as ScanType)
    ? (rawType as ScanType)
    : 'unrecognised';

  const items = Array.isArray(data['items'])
    ? (data['items'] as DocumentData[]).map(itemFromDoc)
    : [];

  return {
    scanType,
    inputText: (data['inputText'] as string | null | undefined) ?? null,
    photoLocalUri: (data['photoLocalUri'] as string | null | undefined) ?? null,
    productName: (data['productName'] as string | null | undefined) ?? null,
    items,
    dishSafetyPct: (data['dishSafetyPct'] as number) ?? 0,
    insight: (data['insight'] as string) ?? '',
    damageControlVisited: Array.isArray(data['damageControlVisited'])
      ? (data['damageControlVisited'] as string[])
      : [],
    createdAt: toDate(data['createdAt']) ?? new Date(),
  };
};

export const scanToDoc = (scan: Scan): DocumentData => ({
  scanType: scan.scanType,
  inputText: scan.inputText,
  // Photo URI is device-local — keep it for same-device restores; it's harmless on other devices.
  photoLocalUri: scan.photoLocalUri,
  productName: scan.productName,
  items: scan.items.map((it) => ({
    id: it.id,
    name: it.name,
    score: it.score,
    verdict: it.verdict,
    reasoning: it.reasoning,
    damageControl: it.damageControl,
  })),
  dishSafetyPct: scan.dishSafetyPct,
  insight: scan.insight,
  damageControlVisited: scan.damageControlVisited,
  createdAt: Timestamp.fromDate(scan.createdAt),
});
