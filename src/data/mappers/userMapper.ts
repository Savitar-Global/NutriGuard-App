import { Timestamp, type DocumentData } from 'firebase/firestore';

import type { User } from '@/domain/entities/User';

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  if (value instanceof Timestamp) return value.toDate();
  if (value instanceof Date) return value;
  return null;
};

export const userFromDoc = (uid: string, data: DocumentData): User => ({
  uid,
  email: (data['email'] as string | undefined) ?? '',
  displayName: (data['displayName'] as string | null | undefined) ?? null,
  authProvider: (data['authProvider'] as User['authProvider']) ?? 'password',
  conditions: (data['conditions'] as User['conditions']) ?? [],
  customConditions: (data['customConditions'] as string[]) ?? [],
  weightKg: (data['weightKg'] as number) ?? 0,
  heightCm: (data['heightCm'] as number) ?? 0,
  birthday: toDate(data['birthday']) ?? new Date(0),
  streakCount: (data['streakCount'] as number) ?? 0,
  lastScanDate: toDate(data['lastScanDate']),
  plan: (data['plan'] as User['plan']) ?? 'free',
  lifetimePhotoScansUsed: (data['lifetimePhotoScansUsed'] as number) ?? 0,
  disclaimerAcknowledgedAt: toDate(data['disclaimerAcknowledgedAt']),
  createdAt: toDate(data['createdAt']) ?? new Date(),
  updatedAt: toDate(data['updatedAt']) ?? new Date(),
});
