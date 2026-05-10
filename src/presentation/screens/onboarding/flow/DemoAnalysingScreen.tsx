import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { conditionsSentence } from '@/utils/onboarding';

const STEP_DURATION_MS = 900;
const FINAL_HOLD_MS = 600;

const BASE_STEPS = [
  'Reading the meal',
  'Identifying food items',
  'Checking against your conditions',
  'Writing your verdict',
];

export function DemoAnalysingScreen() {
  const { goNext } = useOnboardingNav();
  const conditions = useOnboardingStore((s) => s.answers.conditions);
  const customs = useOnboardingStore((s) => s.answers.customConditions);

  const steps = [...BASE_STEPS];
  steps[2] = `Checking against ${conditionsSentence(conditions, customs)}`;

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, steps.length));
    }, STEP_DURATION_MS);

    const finishTimer = setTimeout(
      () => goNext(),
      STEP_DURATION_MS * steps.length + FINAL_HOLD_MS,
    );

    return () => {
      clearInterval(interval);
      clearTimeout(finishTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.body}>
          <View style={styles.hero}>
            <RippleScene />
            <Text style={styles.title}>Checking{'\n'}your meal…</Text>
            <Text style={styles.lead}>
              Identifying items and checking each one against your conditions.
            </Text>
          </View>

          <View style={styles.steps}>
            {steps.map((label, index) => (
              <StepRow
                key={label}
                label={label}
                state={
                  index < activeStep
                    ? 'done'
                    : index === activeStep
                      ? 'active'
                      : 'pending'
                }
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

function RippleScene() {
  const ripples = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    const loops = ripples.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 700),
          Animated.timing(v, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [ripples]);

  return (
    <View style={styles.scene}>
      {ripples.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.ripple,
            {
              opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
              transform: [
                {
                  scale: v.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1.25],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      <View style={styles.lensWrap}>
        <Svg width={48} height={48} viewBox="0 0 36 36">
          <Circle
            cx={15}
            cy={15}
            r={9}
            fill="rgba(255,255,255,0.18)"
            stroke={colors.accent}
            strokeWidth={2.5}
          />
          <Path
            d="M22 22 L31 31"
            stroke={colors.accent}
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Circle cx={12} cy={12} r={2.5} fill="rgba(255,255,255,0.7)" />
        </Svg>
      </View>
    </View>
  );
}

interface StepRowProps {
  label: string;
  state: 'done' | 'active' | 'pending';
}

function StepRow({ label, state }: StepRowProps) {
  const tickScale = useRef(
    new Animated.Value(state === 'done' ? 1 : 0),
  ).current;
  const rowOpacity = useRef(
    new Animated.Value(state === 'pending' ? 0.3 : 1),
  ).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rowOpacity, {
      toValue: state === 'pending' ? 0.3 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [state, rowOpacity]);

  useEffect(() => {
    if (state === 'done') {
      Animated.spring(tickScale, {
        toValue: 1,
        friction: 5,
        tension: 110,
        useNativeDriver: true,
      }).start();
    }
  }, [state, tickScale]);

  useEffect(() => {
    if (state !== 'active') return;
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1100,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [state, spin]);

  return (
    <Animated.View style={[styles.stepRow, { opacity: rowOpacity }]}>
      <View style={styles.stepBadgeWrap}>
        {state === 'done' ? (
          <Animated.View
            style={[styles.stepBadgeDone, { transform: [{ scale: tickScale }] }]}
          >
            <Svg width={11} height={9} viewBox="0 0 11 9">
              <Path
                d="M1 4.5 L4 7.5 L10 1.5"
                stroke={colors.primary}
                strokeWidth={1.8}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </Animated.View>
        ) : state === 'active' ? (
          <Animated.View
            style={[
              styles.stepBadgeActive,
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
            <Svg width={22} height={22} viewBox="0 0 22 22">
              <Circle cx={11} cy={11} r={9} stroke="rgba(255,255,255,0.25)" strokeWidth={2} fill="none" />
              <Path d="M11 2 a9 9 0 0 1 9 9" stroke={colors.accent} strokeWidth={2} fill="none" strokeLinecap="round" />
            </Svg>
          </Animated.View>
        ) : (
          <View style={styles.stepBadgePending} />
        )}
      </View>
      <Text style={styles.stepLabel} numberOfLines={1}>
        {label}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  safe: { flex: 1 },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
  },
  hero: { width: '100%', alignItems: 'center', gap: spacing.md },
  scene: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 2.5,
    borderStyle: 'dashed',
    borderColor: colors.accent,
  },
  lensWrap: { position: 'absolute' },
  title: {
    ...typography.h1,
    color: colors.primaryContrast,
    textAlign: 'center',
    fontSize: 30,
    lineHeight: 34,
  },
  lead: {
    ...typography.bodyMd,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
  steps: { width: '100%', maxWidth: 320, gap: spacing.md, alignSelf: 'center' },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  stepBadgeWrap: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  stepBadgeDone: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  stepBadgeActive: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  stepBadgePending: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.25)',
  },
  stepLabel: {
    fontSize: 14, color: colors.primaryContrast, fontWeight: '500', flexShrink: 1,
  },
});
