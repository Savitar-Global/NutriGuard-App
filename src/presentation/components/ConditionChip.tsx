import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, opacity, radius, spacing, typography } from '@/presentation/theme';

type ChipIcon = 'check' | 'cross' | 'none';

interface ConditionChipProps {
  label: string;
  selected?: boolean;
  icon?: ChipIcon;
  onPress?: () => void;
  accessibilityLabel?: string;
}

export function ConditionChip({
  label,
  selected = false,
  icon = 'none',
  onPress,
  accessibilityLabel,
}: ConditionChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipOn : styles.chipOff,
        pressed && onPress && styles.pressed,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected }}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <Text style={selected ? styles.labelOn : styles.labelOff}>{label}</Text>
      {icon === 'check' && <Text style={styles.iconCheck}>✓</Text>}
      {icon === 'cross' && <Text style={styles.iconCross}>✕</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radius.pill,
  },
  chipOn: {
    backgroundColor: colors.primary,
  },
  chipOff: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: opacity.pressed },
  labelOn: {
    ...typography.chipLabel,
    color: colors.primaryContrast,
  },
  labelOff: {
    ...typography.chipLabel,
    color: colors.primary,
  },
  iconCheck: {
    ...typography.chipIcon,
    color: colors.accent,
  },
  iconCross: {
    ...typography.chipIcon,
    color: colors.primaryContrast,
  },
});
