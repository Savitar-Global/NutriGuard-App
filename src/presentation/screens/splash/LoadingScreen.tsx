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

import { colors, radius, spacing } from '@/presentation/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const AnimatedView = Animated.createAnimatedComponent(View);

export function LoadingScreen() {
  const orbA = useSharedValue(0);
  const orbB = useSharedValue(0);

  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
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

    const cycle = () =>
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.3, { duration: 420, easing: Easing.inOut(Easing.quad) }),
        ),
        -1,
        false,
      );
    dot1.value = cycle();
    dot2.value = withDelay(140, cycle());
    dot3.value = withDelay(280, cycle());
  }, [dot1, dot2, dot3, orbA, orbB]);

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

  const dot1Style = useAnimatedStyle(() => ({
    opacity: dot1.value,
    transform: [{ scale: 0.85 + dot1.value * 0.25 }],
  }));
  const dot2Style = useAnimatedStyle(() => ({
    opacity: dot2.value,
    transform: [{ scale: 0.85 + dot2.value * 0.25 }],
  }));
  const dot3Style = useAnimatedStyle(() => ({
    opacity: dot3.value,
    transform: [{ scale: 0.85 + dot3.value * 0.25 }],
  }));

  return (
    <View style={styles.root}>
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

      <View style={styles.center}>
        <View style={styles.dotsRow}>
          <AnimatedView style={[styles.dot, dot1Style]} />
          <AnimatedView style={[styles.dot, dot2Style]} />
          <AnimatedView style={[styles.dot, dot3Style]} />
        </View>
        <Text style={styles.label}>Loading</Text>
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
  orb: { position: 'absolute' },
  orbTopRight: { top: -60, right: -80 },
  orbBottomLeft: { bottom: -90, left: -100 },
  center: {
    alignItems: 'center',
    gap: spacing.xl,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: radius.full,
    backgroundColor: colors.accent,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.65)',
  },
});
