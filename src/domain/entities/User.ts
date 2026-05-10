import type { ConditionId } from './Condition';

export type Plan = 'free' | 'pro';
export type AuthProvider = 'apple' | 'password';

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  authProvider: AuthProvider;
  conditions: ConditionId[];
  customConditions: string[];
  weightKg: number;
  heightCm: number;
  birthday: Date;
  streakCount: number;
  lastScanDate: Date | null;
  plan: Plan;
  lifetimePhotoScansUsed: number;
  disclaimerAcknowledgedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
