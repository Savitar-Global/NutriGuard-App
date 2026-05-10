import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
}

export function Checkbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, checked && styles.boxOn]}>
        {checked && <Text style={styles.tick}>✓</Text>}
      </View>
      <View style={styles.copy}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: sizes.borderInput,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  pressed: { opacity: opacity.pressed },
  box: {
    width: sizes.checkbox,
    height: sizes.checkbox,
    borderRadius: radius.xs,
    borderWidth: sizes.borderCheckbox,
    borderColor: colors.inkMuted,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  tick: typography.tick,
  copy: { flex: 1 },
});
