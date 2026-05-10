import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  computeBombshellMeals,
  conditionsSentence,
  labelForDuration,
} from '@/utils/onboarding';

const COUNT_DURATION_MS = 1500;
const REVEAL_DELAY_MS = 2200;

const formatNumber = (n: number) => n.toLocaleString('en-US');

export function BombshellScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const yearsManaging = useOnboardingStore((s) => s.answers.yearsManaging);
  const conditions = useOnboardingStore((s) => s.answers.conditions);
  const customs = useOnboardingStore((s) => s.answers.customConditions);

  const totalMeals = useMemo(
    () => (yearsManaging ? computeBombshellMeals(yearsManaging) : 0),
    [yearsManaging],
  );

  const counter = useRef(new Animated.Value(0)).current;
  const [displayed, setDisplayed] = useState(0);
  const [showCta, setShowCta] = useState(false);

  useEffect(() => {
    const listener = counter.addListener(({ value }) => {
      setDisplayed(Math.round(value));
    });

    Animated.timing(counter, {
      toValue: totalMeals,
      duration: COUNT_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const timeout = setTimeout(() => setShowCta(true), REVEAL_DELAY_MS);

    return () => {
      counter.removeListener(listener);
      clearTimeout(timeout);
    };
  }, [counter, totalMeals]);

  const conditionsCopy = conditionsSentence(conditions, customs);
  const durationCopy = yearsManaging ? labelForDuration(yearsManaging) : '';

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      scrollable={false}
      footer={
        showCta ? (
          <OnboardingFooter
            primaryLabel="I see what you mean →"
            onPrimary={goNext}
          />
        ) : null
      }
    >
      <View style={styles.body}>
        <Text style={styles.bigNumber}>{formatNumber(displayed)}</Text>
        <Text style={styles.bigUnit}>meals.</Text>

        <Text style={styles.subtitle}>
          That’s roughly how many times you’ve sat down to eat in the past{' '}
          <Text style={styles.strong}>{durationCopy}</Text> — without a clear
          answer on whether each one was safe for{' '}
          <Text style={styles.strong}>{conditionsCopy}</Text>.
        </Text>

        <Text style={styles.kicker}>
          Every wrong guess nudges your condition the wrong way. It quietly adds
          up.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.md,
  },
  bigNumber: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 88,
    lineHeight: 92,
    color: colors.primary,
    fontWeight: '700',
  },
  bigUnit: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 32,
    lineHeight: 36,
    color: colors.ink,
    marginBottom: spacing.lg,
  },
  subtitle: {
    ...typography.bodyMd,
    fontSize: 16,
    lineHeight: 24,
    color: colors.inkSoft,
  },
  strong: { color: colors.ink, fontWeight: '700' },
  kicker: {
    ...typography.bodyMd,
    color: colors.accentDark,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
});
