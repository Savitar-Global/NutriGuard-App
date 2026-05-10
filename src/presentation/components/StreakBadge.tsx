import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/presentation/theme';

interface StreakBadgeProps {
  count: number;
}

export function StreakBadge({ count }: StreakBadgeProps) {
  if (count <= 0) return null;
  return (
    <View
      style={styles.chip}
      accessibilityLabel={`${count} day streak`}
      accessibilityRole="text"
    >
      <Text style={styles.flame}>🔥</Text>
      <Text style={styles.label}>{count} day streak</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 1,
    backgroundColor: colors.streakBg,
    borderWidth: sizes.borderInput,
    borderColor: colors.streakBorder,
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md - 2,
  },
  flame: {
    ...typography.chipLabel,
  },
  label: {
    ...typography.chipLabel,
    fontWeight: '700',
    color: colors.streak,
  },
});
