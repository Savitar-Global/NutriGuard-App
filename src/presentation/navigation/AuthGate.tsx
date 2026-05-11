import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { firestoreUserRepository } from '@/data/repositories/FirestoreUserRepository';
import { MainTabs } from '@/presentation/navigation/MainTabs';
import { OnboardingFlowStack } from '@/presentation/navigation/OnboardingFlowStack';
import { colors } from '@/presentation/theme';
import { useAuthStore } from '@/stores/authStore';
import { useDemoScanStore } from '@/stores/demoScanStore';
import { useEntitlementStore } from '@/stores/entitlementStore';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { useScanStore } from '@/stores/scanStore';
import { useUserStore } from '@/stores/userStore';
import {
  commitOnboardingProfile,
  hasCommittableOnboardingAnswers,
} from '@/utils/commitOnboardingProfile';
import type { AuthProvider } from '@/domain/entities/User';

const resolveAuthProvider = (providerId: string | undefined): AuthProvider =>
  providerId === 'apple.com' ? 'apple' : 'password';

/**
 * Top-level routing gate.
 *
 * - No Firebase user → `OnboardingFlowStack` (full conversion flow + auth at end)
 * - User present     → `MainTabs`
 *
 * On the user-becomes-non-null transition we also flush any buffered
 * onboarding answers to Firestore via `commitOnboardingProfile`. This keeps
 * the auth screens (`SignUpScreen`, `LoginScreen`) ignorant of the
 * onboarding store and means a successful sign-up — by any auth path —
 * automatically persists conditions, body details, name, birthday, and the
 * disclaimer ack to Firestore + Firebase Auth's `displayName`.
 */
export function AuthGate() {
  const user = useAuthStore((s) => s.user);
  const isInitialising = useAuthStore((s) => s.isInitialising);
  const initAuth = useAuthStore((s) => s.init);

  const profile = useUserStore((s) => s.profile);
  const isLoadingProfile = useUserStore((s) => s.isLoading);
  const ensureUser = useUserStore((s) => s.ensure);
  const resetUser = useUserStore((s) => s.reset);

  const hydrateScan = useScanStore((s) => s.hydrateFromCloud);
  const resetScan = useScanStore((s) => s.reset);

  const initEntitlement = useEntitlementStore((s) => s.init);
  const resetEntitlement = useEntitlementStore((s) => s.reset);

  useEffect(() => initAuth(), [initAuth]);

  useEffect(() => {
    if (!user) {
      resetUser();
      resetScan();
      void resetEntitlement();
      return;
    }

    let cancelled = false;

    void (async () => {
      await ensureUser({
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName,
        authProvider: resolveAuthProvider(user.providerData[0]?.providerId),
      });
      if (cancelled) return;

      const answers = useOnboardingStore.getState().answers;
      if (!hasCommittableOnboardingAnswers(answers)) return;

      try {
        await commitOnboardingProfile(user.uid, answers);
        if (cancelled) return;
        // Pull the freshly-committed doc back so EVERY field — including
        // conditions, customConditions, and disclaimer ack — is mirrored to
        // the in-memory profile. This is what HomeGreeting and ProfileScreen
        // read; without this read-back the local store would be missing the
        // arrays that `userStore.updateProfile` doesn't accept in its patch.
        const fresh = await firestoreUserRepository.get(user.uid);
        if (cancelled) return;
        if (fresh) useUserStore.setState({ profile: fresh });
        useOnboardingStore.getState().reset();
        useDemoScanStore.getState().reset();
      } catch (err) {
        // Leave the onboarding store intact so the next app open can retry.
        console.error('[AuthGate] failed to commit onboarding profile', err);
      }
    })();

    void hydrateScan(user.uid);
    void initEntitlement(user.uid);

    return () => {
      cancelled = true;
    };
  }, [
    user,
    ensureUser,
    resetUser,
    hydrateScan,
    resetScan,
    initEntitlement,
    resetEntitlement,
  ]);

  if (isInitialising) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return <OnboardingFlowStack />;
  }

  const profileMatchesUser = profile?.uid === user.uid;
  if (!profileMatchesUser && isLoadingProfile) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <MainTabs />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
