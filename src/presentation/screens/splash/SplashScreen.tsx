import { Image } from 'expo-image';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  LinearGradient as SvgLinearGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { colors, radius, spacing, typography } from '@/presentation/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const LOGO_SIZE = 148;
const BRACKET_SIZE = LOGO_SIZE + 56;
const BRACKET_THICK = 3;
const BRACKET_LEN = 22;

const AnimatedView = Animated.createAnimatedComponent(View);

interface SplashScreenProps {
  onFinish?: () => void;
  duration?: number;
}

export function SplashScreen({ onFinish, duration = 3400 }: SplashScreenProps) {
  // Background orb drifts
  const orbA = useSharedValue(0);
  const orbB = useSharedValue(0);

  // Logo entry + breathing
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.7);
  const logoPulse = useSharedValue(1);

  // Scan frame brackets
  const bracketOpacity = useSharedValue(0);
  const bracketScale = useSharedValue(1.18);

  // Title + slogan
  const titleOpacity = useSharedValue(0);
  const titleTranslate = useSharedValue(14);

  const word1 = useSharedValue(0);
  const word2 = useSharedValue(0);
  const word3 = useSharedValue(0);

  // Loading dots
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    // Background ambient drift
    orbA.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
    orbB.value = withRepeat(
      withTiming(1, { duration: 7500, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );

    // Logo entry
    logoOpacity.value = withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 620, easing: Easing.out(Easing.back(1.4)) });

    // Logo breathing pulse (after entry)
    logoPulse.value = withDelay(
      720,
      withRepeat(
        withSequence(
          withTiming(1.04, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );

    // Scan brackets — "snap into focus"
    bracketOpacity.value = withDelay(
      180,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.quad) }),
    );
    bracketScale.value = withDelay(
      180,
      withTiming(1, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );

    // Title
    titleOpacity.value = withDelay(
      420,
      withTiming(1, { duration: 480, easing: Easing.out(Easing.cubic) }),
    );
    titleTranslate.value = withDelay(
      420,
      withTiming(0, { duration: 520, easing: Easing.out(Easing.cubic) }),
    );

    // Slogan words staggered
    word1.value = withDelay(720, withTiming(1, { duration: 340 }));
    word2.value = withDelay(900, withTiming(1, { duration: 340 }));
    word3.value = withDelay(1080, withTiming(1, { duration: 340 }));

    // Loading dots loop
    const dotCycle = withRepeat(
      withSequence(
        withTiming(1, { duration: 360, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.3, { duration: 360, easing: Easing.inOut(Easing.quad) }),
      ),
      -1,
      false,
    );
    dot1.value = withDelay(1200, dotCycle);
    dot2.value = withDelay(1320, dotCycle);
    dot3.value = withDelay(1440, dotCycle);

    if (!onFinish) return;
    const t = setTimeout(onFinish, duration);
    return () => clearTimeout(t);
  }, [
    bracketOpacity,
    bracketScale,
    dot1,
    dot2,
    dot3,
    duration,
    logoOpacity,
    logoPulse,
    logoScale,
    onFinish,
    orbA,
    orbB,
    titleOpacity,
    titleTranslate,
    word1,
    word2,
    word3,
  ]);

  const orbAStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: -40 + orbA.value * 30 },
      { translateY: -40 + orbA.value * 20 },
    ],
    opacity: 0.55 + orbA.value * 0.15,
  }));

  const orbBStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: 40 - orbB.value * 24 },
      { translateY: 30 - orbB.value * 18 },
    ],
    opacity: 0.4 + orbB.value * 0.2,
  }));

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value * logoPulse.value }],
  }));

  const bracketStyle = useAnimatedStyle(() => ({
    opacity: bracketOpacity.value,
    transform: [{ scale: bracketScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslate.value }],
  }));

  const w1Style = useAnimatedStyle(() => ({
    opacity: word1.value,
    transform: [{ translateY: (1 - word1.value) * 8 }],
  }));
  const w2Style = useAnimatedStyle(() => ({
    opacity: word2.value,
    transform: [{ translateY: (1 - word2.value) * 8 }],
  }));
  const w3Style = useAnimatedStyle(() => ({
    opacity: word3.value,
    transform: [{ translateY: (1 - word3.value) * 8 }],
  }));

  const dot1Style = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const dot2Style = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const dot3Style = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.root}>
      {/* Gradient background */}
      <Svg
        width={SCREEN_W}
        height={SCREEN_H}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      >
        <Defs>
          <SvgLinearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#0F2A20" />
            <Stop offset="45%" stopColor="#234A38" />
            <Stop offset="75%" stopColor="#3A5239" />
            <Stop offset="100%" stopColor="#1E4438" />
          </SvgLinearGradient>
          <SvgLinearGradient id="vignette" x1="50%" y1="0%" x2="50%" y2="100%">
            <Stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.35" />
          </SvgLinearGradient>
        </Defs>
        <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#bg)" />
        <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#vignette)" />
      </Svg>

      {/* Soft accent orbs */}
      <AnimatedView style={[styles.orb, styles.orbTopRight, orbAStyle]}>
        <Svg width={320} height={320}>
          <Defs>
            <SvgLinearGradient id="orbA" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={colors.accent} stopOpacity="0.45" />
              <Stop offset="100%" stopColor={colors.accent} stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
          <Circle cx={160} cy={160} r={160} fill="url(#orbA)" />
        </Svg>
      </AnimatedView>

      <AnimatedView style={[styles.orb, styles.orbBottomLeft, orbBStyle]}>
        <Svg width={360} height={360}>
          <Defs>
            <SvgLinearGradient id="orbB" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor="#7BC3A8" stopOpacity="0.35" />
              <Stop offset="100%" stopColor="#7BC3A8" stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>
          <Circle cx={180} cy={180} r={180} fill="url(#orbB)" />
        </Svg>
      </AnimatedView>

      {/* Center content */}
      <View style={styles.center}>
        <View style={styles.logoWrap}>
          {/* Scan brackets */}
          <AnimatedView style={[styles.brackets, bracketStyle]}>
            <View style={[styles.bracket, styles.bracketTopLeftV]} />
            <View style={[styles.bracket, styles.bracketTopLeftH]} />
            <View style={[styles.bracket, styles.bracketTopRightV]} />
            <View style={[styles.bracket, styles.bracketTopRightH]} />
            <View style={[styles.bracket, styles.bracketBottomLeftV]} />
            <View style={[styles.bracket, styles.bracketBottomLeftH]} />
            <View style={[styles.bracket, styles.bracketBottomRightV]} />
            <View style={[styles.bracket, styles.bracketBottomRightH]} />
          </AnimatedView>

          {/* Glow disc behind logo */}
          <View style={styles.logoGlow} />

          {/* Logo */}
          <Animated.View style={[styles.logoBox, logoStyle]}>
            <Image
              source={require('../../../../assets/onboard.png')}
              style={styles.logoImage}
              contentFit="contain"
              transition={0}
            />
          </Animated.View>
        </View>

        {/* App name */}
        <Animated.View style={[styles.titleRow, titleStyle]}>
          <Text style={styles.titleNutri}>NutriCare</Text>
          <Text style={styles.titleAi}> AI</Text>
        </Animated.View>

        {/* Slogan */}
        <View style={styles.slogan}>
          <AnimatedView style={w1Style}>
            <Text style={styles.sloganWord}>Scan</Text>
          </AnimatedView>
          <Text style={styles.sloganDot}>·</Text>
          <AnimatedView style={w2Style}>
            <Text style={styles.sloganWord}>Know</Text>
          </AnimatedView>
          <Text style={styles.sloganDot}>·</Text>
          <AnimatedView style={w3Style}>
            <Text style={styles.sloganWord}>Eat</Text>
          </AnimatedView>
        </View>
      </View>

      {/* Loading dots */}
      <View style={styles.dotsRow}>
        <AnimatedView style={[styles.dot, dot1Style]} />
        <AnimatedView style={[styles.dot, dot2Style]} />
        <AnimatedView style={[styles.dot, dot3Style]} />
      </View>

      {/* Bottom signature */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Nourish with intelligence</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0F2A20',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
  },
  orbTopRight: {
    top: -60,
    right: -80,
  },
  orbBottomLeft: {
    bottom: -90,
    left: -100,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  logoWrap: {
    width: BRACKET_SIZE,
    height: BRACKET_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brackets: {
    ...StyleSheet.absoluteFillObject,
  },
  bracket: {
    position: 'absolute',
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  bracketTopLeftV: { top: 0, left: 0, width: BRACKET_THICK, height: BRACKET_LEN },
  bracketTopLeftH: { top: 0, left: 0, width: BRACKET_LEN, height: BRACKET_THICK },
  bracketTopRightV: { top: 0, right: 0, width: BRACKET_THICK, height: BRACKET_LEN },
  bracketTopRightH: { top: 0, right: 0, width: BRACKET_LEN, height: BRACKET_THICK },
  bracketBottomLeftV: { bottom: 0, left: 0, width: BRACKET_THICK, height: BRACKET_LEN },
  bracketBottomLeftH: { bottom: 0, left: 0, width: BRACKET_LEN, height: BRACKET_THICK },
  bracketBottomRightV: { bottom: 0, right: 0, width: BRACKET_THICK, height: BRACKET_LEN },
  bracketBottomRightH: { bottom: 0, right: 0, width: BRACKET_LEN, height: BRACKET_THICK },
  logoGlow: {
    position: 'absolute',
    width: LOGO_SIZE + 30,
    height: LOGO_SIZE + 30,
    borderRadius: (LOGO_SIZE + 30) / 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  logoBox: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  titleNutri: {
    ...typography.displayLg,
    fontSize: 38,
    lineHeight: 44,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  titleAi: {
    ...typography.displayLg,
    fontSize: 38,
    lineHeight: 44,
    color: colors.accent,
    letterSpacing: -0.4,
    fontStyle: 'italic',
  },
  slogan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sloganWord: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: 3.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.92)',
  },
  sloganDot: {
    fontSize: 14,
    color: colors.accent,
    marginTop: -2,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 96,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  footer: {
    position: 'absolute',
    bottom: 48,
  },
  footerText: {
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
  },
});
