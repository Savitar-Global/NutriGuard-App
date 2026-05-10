import { updateProfile } from 'firebase/auth';

import { firestoreUserRepository } from '@/data/repositories/FirestoreUserRepository';
import { firebaseAuth } from '@/data/services/firebase';
import type { OnboardingAnswers } from '@/stores/onboardingStore';

/**
 * True when the buffered onboarding answers have enough data to commit a
 * meaningful profile (i.e. the user actually went through the flow rather
 * than logging back in to an existing account).
 */
export const hasCommittableOnboardingAnswers = (
  answers: OnboardingAnswers,
): boolean =>
  Boolean(answers.name) &&
  (answers.conditions.length > 0 || answers.customConditions.length > 0);

/**
 * Push all the data collected during the pre-auth onboarding flow
 * into the freshly seeded `users/{uid}` document.
 *
 * Called by `AuthGate` once Firebase Auth flips the user from null → non-null
 * AND `useOnboardingStore` has buffered answers. This keeps the existing
 * `SignUpScreen` / `LoginScreen` ignorant of the onboarding store — auth
 * screens stay focused on auth, AuthGate orchestrates the post-auth flush.
 *
 * Also writes `displayName` back to the Firebase Auth user object so any
 * code that reads `auth.currentUser.displayName` stays in sync with what
 * Firestore knows.
 */
export const commitOnboardingProfile = async (
  uid: string,
  answers: OnboardingAnswers,
): Promise<void> => {
  const patch = {
    displayName: answers.name,
    conditions: answers.conditions,
    customConditions: answers.customConditions,
    weightKg: answers.weightKg ?? 0,
    heightCm: answers.heightCm ?? 0,
    birthday: answers.birthday ?? new Date(0),
    disclaimerAcknowledgedAt: answers.disclaimerAcknowledged ? new Date() : null,
  };
  await firestoreUserRepository.update(uid, patch);

  if (answers.name && firebaseAuth.currentUser?.uid === uid) {
    try {
      await updateProfile(firebaseAuth.currentUser, {
        displayName: answers.name,
      });
    } catch {
      // Non-fatal — Firestore is the source of truth in the app's UI.
    }
  }
};
