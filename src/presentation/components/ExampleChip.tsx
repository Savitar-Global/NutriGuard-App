import { Pressable, StyleSheet, Text } from 'react-native';

import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

interface ExampleChipProps {
  label: string;
  onPress: () => void;
}

export function ExampleChip({ label, onPress }: ExampleChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Try example: ${label}`}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.card,
    borderWidth: sizes.borderInput,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md + 2,
  },
  pressed: { opacity: opacity.pressed },
  label: {
    ...typography.body,
  },
});
