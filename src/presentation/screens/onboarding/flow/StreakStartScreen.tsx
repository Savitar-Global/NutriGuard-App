import * as Haptics from 'expo-haptics';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { requestStoreReview } from '@/data/services/storeReview';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

const REVIEW_DELAY_MS = 1200;

export function StreakStartScreen() {
  const { goNext } = useOnboardingNav();
  const name = useOnboardingStore((s) => s.answers.name);

  const flameScale = useRef(new Animated.Value(0.4)).current;
  const flameRotate = useRef(new Animated.Value(0)).current;
  const dayOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(flameScale, {
        toValue: 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(dayOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(flameRotate, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(flameRotate, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const reviewTimer = setTimeout(() => {
      void requestStoreReview();
    }, REVIEW_DELAY_MS);

    return () => clearTimeout(reviewTimer);
  }, [flameScale, flameRotate, dayOpacity]);

  return (
    <OnboardingLayout
      scrollable={false}
      footer={
        <OnboardingFooter primaryLabel="Keep going →" onPrimary={goNext} />
      }
    >
      <View style={styles.body}>
        <Animated.Text
          style={[
            styles.flame,
            {
              transform: [
                { scale: flameScale },
                {
                  rotate: flameRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['-4deg', '4deg'],
                  }),
                },
              ],
            },
          ]}
        >
          🔥
        </Animated.Text>

        <Animated.View style={[styles.dayWrap, { opacity: dayOpacity }]}>
          <Text style={styles.dayLabel}>DAY</Text>
          <Text style={styles.dayNumber}>1</Text>
        </Animated.View>

        <Text style={styles.title}>
          {name ? `${name}, you just did your first scan.` : 'You just did your first scan.'}
        </Text>
        <Text style={styles.subtitle}>
          Your streak starts today. One scan a day keeps the guesswork away.
        </Text>
        <Text style={styles.hint}>
          Miss a day and it resets — but we’ll nudge you at 8pm before that
          happens.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  flame: { fontSize: 84, lineHeight: 96 },
  dayWrap: { alignItems: 'center', gap: 4 },
  dayLabel: { ...typography.label, color: colors.streak, letterSpacing: 2 },
  dayNumber: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 96,
    lineHeight: 100,
    fontWeight: '700',
    color: colors.streak,
  },
  title: {
    ...typography.h1,
    fontSize: 26,
    lineHeight: 32,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  subtitle: {
    ...typography.bodyMd,
    textAlign: 'center',
    color: colors.inkSoft,
  },
  hint: {
    ...typography.bodySm,
    color: colors.inkMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});
