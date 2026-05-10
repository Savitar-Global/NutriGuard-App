import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import type { AnalyseMealInput } from '@/domain/usecases/AnalyseMealUseCase';
import { PrimaryButton } from '@/presentation/components/PrimaryButton';
import { SecondaryButton } from '@/presentation/components/SecondaryButton';
import { colors, spacing, typography } from '@/presentation/theme';
import { useScanStore } from '@/stores/scanStore';
import { AppError } from '@/types/global';

export type AnalyseMode = 'photo' | 'text';

interface AnalysingScreenProps {
  mode: AnalyseMode;
  input: AnalyseMealInput;
  onSuccess: () => void;
  onCancel: () => void;
}

const PHOTO_STEPS = [
  'Reading the photo',
  'Identifying food items',
  'Checking against your conditions',
  'Writing your verdict',
];

const TEXT_STEPS = [
  'Reading your description',
  'Identifying food items',
  'Checking against your conditions',
  'Writing your verdict',
];

const STEP_INTERVAL_MS = 1100;
const TYPE_INTERVAL_MS = 28;

const HERO_MIN = 200;
const HERO_MAX = 280;

export function AnalysingScreen({
  mode,
  input,
  onSuccess,
  onCancel,
}: AnalysingScreenProps) {
  const analyse = useScanStore((s) => s.analyse);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState<AppError | null>(null);
  const startedRef = useRef(false);

  const steps = mode === 'photo' ? PHOTO_STEPS : TEXT_STEPS;

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const interval = setInterval(() => {
      setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
    }, STEP_INTERVAL_MS);

    let cancelled = false;
    void (async () => {
      try {
        await analyse(input);
        if (!cancelled) {
          setActiveStep(steps.length);
          onSuccess();
        }
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof AppError ? err : new AppError('UNKNOWN'));
      } finally {
        clearInterval(interval);
      }
    })();

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (error) {
    return <ErrorState error={error} onCancel={onCancel} />;
  }

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.body}>
          <View style={styles.hero}>
            <HeroScene />
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

function HeroScene() {
  const { width, height } = useWindowDimensions();
  const size = Math.max(
    HERO_MIN,
    Math.min(HERO_MAX, Math.min(width * 0.7, height * 0.34)),
  );

  const lensY = useRef(new Animated.Value(0)).current;
  const ripple1 = useRef(new Animated.Value(0)).current;
  const ripple2 = useRef(new Animated.Value(0)).current;
  const ripple3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const swing = Animated.loop(
      Animated.sequence([
        Animated.timing(lensY, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(lensY, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    swing.start();

    const startRipple = (val: Animated.Value, delay: number) => {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, {
            toValue: 1,
            duration: 2200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(val, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();
      return loop;
    };

    const r1 = startRipple(ripple1, 0);
    const r2 = startRipple(ripple2, 700);
    const r3 = startRipple(ripple3, 1400);

    return () => {
      swing.stop();
      r1.stop();
      r2.stop();
      r3.stop();
    };
  }, [lensY, ripple1, ripple2, ripple3]);

  const docSize = size * 0.5;
  const lensSize = size * 0.26;
  const swingRange = docSize * 0.28;

  const rippleStyle = (val: Animated.Value) => ({
    position: 'absolute' as const,
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: 2.5,
    borderStyle: 'dashed' as const,
    borderColor: colors.accent,
    opacity: val.interpolate({ inputRange: [0, 1], outputRange: [0.65, 0] }),
    transform: [
      {
        scale: val.interpolate({
          inputRange: [0, 1],
          outputRange: [0.72, 1.2],
        }),
      },
    ],
  });

  return (
    <View style={[styles.heroScene, { width: size, height: size }]}>
      <Animated.View style={rippleStyle(ripple1)} />
      <Animated.View style={rippleStyle(ripple2)} />
      <Animated.View style={rippleStyle(ripple3)} />

      <View style={styles.docWrap}>
        <DocIcon size={docSize} />
      </View>

      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          styles.orbitFrame,
          {
            transform: [
              {
                translateY: lensY.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-swingRange, swingRange],
                }),
              },
            ],
          },
        ]}
      >
        <LensIcon size={lensSize} />
      </Animated.View>
    </View>
  );
}

interface DocIconProps {
  size: number;
}

function DocIcon({ size }: DocIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      <Path
        d="M14 6 H42 L52 16 V56 a2 2 0 0 1 -2 2 H14 a2 2 0 0 1 -2 -2 V8 a2 2 0 0 1 2 -2 z"
        fill="none"
        stroke="#ababab"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Path
        d="M42 6 V16 H52"
        fill="none"
        stroke="#ababab"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <Line
        x1={20}
        y1={26}
        x2={44}
        y2={26}
        stroke="#ababab"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.7}
      />
      <Line
        x1={20}
        y1={34}
        x2={44}
        y2={34}
        stroke="#ababab"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.55}
      />
      <Line
        x1={20}
        y1={42}
        x2={36}
        y2={42}
        stroke="#ababab"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={0.55}
      />
    </Svg>
  );
}

interface LensIconProps {
  size: number;
}

function LensIcon({ size }: LensIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 36 36">
      <Circle
        cx={15}
        cy={15}
        r={9}
        fill="rgba(255,255,255,0.18)"
        stroke={colors.accent}
        strokeWidth={2.5}
      />
      <Line
        x1={22}
        y1={22}
        x2={31}
        y2={31}
        stroke={colors.accent}
        strokeWidth={3}
        strokeLinecap="round"
      />
      <Circle cx={12} cy={12} r={2.5} fill="rgba(255,255,255,0.7)" />
    </Svg>
  );
}

interface StepRowProps {
  label: string;
  state: 'done' | 'active' | 'pending';
}

function StepRow({ label, state }: StepRowProps) {
  const [shown, setShown] = useState(state === 'done' ? label : '');
  const tickScale = useRef(
    new Animated.Value(state === 'done' ? 1 : 0),
  ).current;
  const rowOpacity = useRef(
    new Animated.Value(state === 'pending' ? 0.25 : 1),
  ).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(rowOpacity, {
      toValue: state === 'pending' ? 0.25 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [state, rowOpacity]);

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

  useEffect(() => {
    if (state === 'pending') {
      setShown('');
      return;
    }
    if (state === 'done') {
      setShown(label);
      Animated.spring(tickScale, {
        toValue: 1,
        friction: 5,
        tension: 110,
        useNativeDriver: true,
      }).start();
      return;
    }
    // active: typewriter
    setShown('');
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setShown(label.slice(0, i));
      if (i >= label.length) clearInterval(timer);
    }, TYPE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [state, label, tickScale]);

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
              <Circle
                cx={11}
                cy={11}
                r={9}
                stroke="rgba(255,255,255,0.25)"
                strokeWidth={2}
                fill="none"
              />
              <Path
                d="M11 2 a9 9 0 0 1 9 9"
                stroke={colors.accent}
                strokeWidth={2}
                fill="none"
                strokeLinecap="round"
              />
            </Svg>
          </Animated.View>
        ) : (
          <View style={styles.stepBadgePending} />
        )}
      </View>
      <Text style={styles.stepLabel} numberOfLines={1}>
        {state === 'pending' ? label : shown}
        {state === 'active' && shown.length < label.length ? (
          <Text style={styles.caret}>|</Text>
        ) : null}
      </Text>
    </Animated.View>
  );
}

interface ErrorStateProps {
  error: AppError;
  onCancel: () => void;
}

function ErrorState({ error, onCancel }: ErrorStateProps) {
  const message =
    error.code === 'AI_TIMEOUT'
      ? 'That took too long. Check your connection and try again.'
      : error.code === 'NETWORK'
        ? "No connection. Try again when you're back online."
        : error.message || 'Something went wrong analysing your meal.';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.errorBody}>
          <Text style={styles.errorTitle}>We couldn't finish that scan</Text>
          <Text style={styles.errorMessage}>{message}</Text>
          <View style={styles.errorActions}>
            <PrimaryButton label="Back" onPress={onCancel} />
            <SecondaryButton label="Try again" onPress={onCancel} />
          </View>
        </View>
      </SafeAreaView>
    </View>
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
    gap: spacing.lg,
  },
  hero: {
    width: '100%',
    alignItems: 'center',
    gap: spacing.md,
  },
  heroScene: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  docWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  orbitFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  steps: {
    width: '100%',
    maxWidth: 320,
    gap: spacing.md,
    alignSelf: 'center',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  stepBadgeWrap: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeDone: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeActive: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgePending: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  stepLabel: {
    fontSize: 14,
    color: colors.primaryContrast,
    fontWeight: '500',
    flexShrink: 1,
  },
  caret: {
    color: colors.accent,
    fontWeight: '700',
  },
  errorBody: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  errorTitle: {
    ...typography.h1,
    color: colors.primaryContrast,
    textAlign: 'center',
  },
  errorMessage: {
    ...typography.bodyMd,
    color: 'rgba(255,255,255,0.75)',
    textAlign: 'center',
  },
  errorActions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
