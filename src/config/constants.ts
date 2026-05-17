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

// Entitlement identifier configured in RevenueCat dashboard.
export const REVENUECAT_ENTITLEMENT = 'NutriCare_AI Pro';

// App Store Connect product IDs.
export const PRODUCT_IDS = {
  monthly: 'NutriCareAI_M1',
  annual: 'NutriCareAI_Y1',
} as const;

// Apple subscription management deep link (App Store).
export const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';

export const LEGAL_URLS = {
  privacyPolicy: 'https://dklochana.github.io/NutriCare-AI/privacy-policy/',
  termsAndConditions: 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/',
} as const;
