import type { VerdictId, VerdictScore } from './Verdict';

export type ScanType = 'meal' | 'ingredients' | 'text' | 'unrecognised';

export interface ScanItem {
  id: string;
  name: string;
  score: VerdictScore;
  verdict: VerdictId;
  reasoning: string;
  damageControl: string;
}

export interface Scan {
  scanType: ScanType;
  inputText: string | null;
  photoLocalUri: string | null;
  productName: string | null;
  items: ScanItem[];
  dishSafetyPct: number;
  insight: string;
  damageControlVisited: string[];
  createdAt: Date;
}
