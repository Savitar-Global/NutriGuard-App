import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

interface UnitOption<T extends string> {
  value: T;
  label: string;
}

interface UnitToggleProps<T extends string> {
  options: ReadonlyArray<UnitOption<T>>;
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}

export function UnitToggle<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: UnitToggleProps<T>) {
  return (
    <View
      style={styles.track}
      accessibilityRole="tablist"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((opt) => {
        const isOn = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={({ pressed }) => [
              styles.pill,
              isOn && styles.pillOn,
              pressed && !isOn && styles.pressed,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected: isOn }}
            accessibilityLabel={opt.label}
          >
            <Text style={[styles.label, isOn && styles.labelOn]}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    backgroundColor: colors.buttonSecondary,
    borderRadius: radius.full,
    padding: 3,
    borderWidth: sizes.borderInput,
    borderColor: colors.border,
    alignSelf: 'flex-start',
  },
  pill: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  pillOn: {
    backgroundColor: colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  pressed: { opacity: opacity.pressedSubtle },
  label: {
    ...typography.chipLabel,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  labelOn: { color: colors.primary, fontWeight: '700' },
});
