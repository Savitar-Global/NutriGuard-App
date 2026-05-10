import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/presentation/theme';

interface OnboardingProgressBarProps {
  step: number;
  total: number;
}

export function OnboardingProgressBar({
  step,
  total,
}: OnboardingProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const ratio = Math.min(Math.max(step / safeTotal, 0), 1);

  return (
    <View style={styles.track} accessibilityRole="progressbar">
      <View style={[styles.fill, { width: `${ratio * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginHorizontal: spacing.screenPaddingX,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
