import type { ConditionId } from '@/domain/entities/Condition';

export const FREE_SCAN_LIMIT = 3;

export const NOTIFICATION_HOUR = 20; // 8pm local

export const STREAK_MILESTONES = [7, 14, 30] as const;

export const CONDITIONS: Array<{ id: ConditionId; label: string; emoji: string }> = [
  { id: 'diabetes', label: 'Diabetes', emoji: '🩸' },
  { id: 'gastritis', label: 'Gastritis', emoji: '🔥' },
  { id: 'hypertension', label: 'Hypertension', emoji: '❤️' },
  { id: 'gerd', label: 'GERD / Acid reflux', emoji: '⚡' },
  { id: 'high_cholesterol', label: 'High cholesterol', emoji: '🫀' },
  { id: 'gout', label: 'Gout', emoji: '🦶' },
  { id: 'celiac', label: 'Celiac / Gluten-free', emoji: '🌾' },
  { id: 'lactose_intolerance', label: 'Lactose intolerance', emoji: '🥛' },
];

export const REVENUECAT_ENTITLEMENT = 'pro';

export const PRODUCT_IDS = {
  monthly: 'nutriguard_pro_monthly_999',
  annual: 'nutriguard_pro_annual_4999',
} as const;

export const LEGAL_URLS = {
  privacyPolicy: 'https://nutriguard.app/privacy',
  termsAndConditions: 'https://nutriguard.app/terms',
} as const;
