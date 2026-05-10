import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { conditionsSentence } from '@/utils/onboarding';

const STEP_INTERVAL_MS = 950;
const FINAL_HOLD_MS = 700;

export function PersonalisingScreen() {
  const { goNext } = useOnboardingNav();
  const conditions = useOnboardingStore((s) => s.answers.conditions);
  const customs = useOnboardingStore((s) => s.answers.customConditions);

  const steps = [
    'Saving your conditions',
    `Mapping safe foods for ${conditionsSentence(conditions, customs)}`,
    'Tailoring damage control advice',
    'Personalising your food guide',
  ];

  const [activeStep, setActiveStep] = useState(0);
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    const interval = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, steps.length));
    }, STEP_INTERVAL_MS);

    const finishTimer = setTimeout(
      () => goNext(),
      STEP_INTERVAL_MS * steps.length + FINAL_HOLD_MS,
    );

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <OnboardingLayout scrollable={false}>
      <View style={styles.body}>
        <Animated.View
          style={[
            styles.spinner,
            {
              transform: [
                {
                  rotate: spin.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Svg width={64} height={64} viewBox="0 0 64 64">
            <Circle cx={32} cy={32} r={28} stroke={colors.border} strokeWidth={4} fill="none" />
            <Path
              d="M32 4 a28 28 0 0 1 28 28"
              stroke={colors.primary}
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
        </Animated.View>

        <Text style={styles.title}>Personalising your guide…</Text>

        <View style={styles.steps}>
          {steps.map((label, i) => (
            <Text
              key={label}
              style={[
                styles.step,
                i < activeStep && styles.stepDone,
                i === activeStep && styles.stepActive,
              ]}
            >
              {i < activeStep ? '✓' : i === activeStep ? '•' : '○'}  {label}
            </Text>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  spinner: { width: 64, height: 64 },
  title: { ...typography.h1, textAlign: 'center' },
  steps: { gap: spacing.sm + 2, alignSelf: 'stretch', paddingHorizontal: spacing.lg },
  step: { ...typography.bodyMd, color: colors.inkMuted },
  stepActive: { color: colors.ink, fontWeight: '600' },
  stepDone: { color: colors.primary },
});
