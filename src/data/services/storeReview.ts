/**
 * Native App Store review prompt — wraps `expo-store-review`.
 *
 * iOS limits this to ~3 prompts / 365 days, so we time it to the
 * onboarding climax (StreakStart) when emotional engagement peaks.
 *
 * NOTE: install with `npx expo install expo-store-review` and rebuild the
 * Dev Client before this fires for real. While the package is missing the
 * helper resolves to a no-op so the flow keeps moving.
 */
interface StoreReviewModule {
  isAvailableAsync: () => Promise<boolean>;
  requestReview: () => Promise<void>;
}

let reviewModule: StoreReviewModule | null = null;
let triedToLoad = false;

const tryLoad = (): StoreReviewModule | null => {
  if (reviewModule) return reviewModule;
  if (triedToLoad) return null;
  triedToLoad = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    reviewModule = require('expo-store-review') as StoreReviewModule;
    return reviewModule;
  } catch {
    return null;
  }
};

export const requestStoreReview = async (): Promise<void> => {
  const mod = tryLoad();
  if (!mod) {
    if (__DEV__) {
      console.warn(
        '[storeReview] expo-store-review not installed — install via `npx expo install expo-store-review` to enable native review prompts.',
      );
    }
    return;
  }

  try {
    const isAvailable = await mod.isAvailableAsync();
    if (!isAvailable) return;
    await mod.requestReview();
  } catch (err) {
    if (__DEV__) {
      console.warn('[storeReview] requestReview failed', err);
    }
  }
};
