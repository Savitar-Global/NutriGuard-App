import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

export interface Choice<T extends string> {
  value: T;
  label: string;
  description?: string;
  emoji?: string;
}

interface ChoiceListProps<T extends string> {
  choices: ReadonlyArray<Choice<T>>;
  value: T | null;
  onSelect: (value: T) => void;
}

export function ChoiceList<T extends string>({
  choices,
  value,
  onSelect,
}: ChoiceListProps<T>) {
  return (
    <View style={styles.list}>
      {choices.map((c) => {
        const isOn = c.value === value;
        return (
          <Pressable
            key={c.value}
            onPress={() => onSelect(c.value)}
            style={({ pressed }) => [
              styles.row,
              isOn && styles.rowOn,
              pressed && styles.pressed,
            ]}
            accessibilityRole="radio"
            accessibilityState={{ selected: isOn }}
            accessibilityLabel={c.label}
          >
            {c.emoji ? <Text style={styles.emoji}>{c.emoji}</Text> : null}
            <View style={styles.copy}>
              <Text style={[styles.label, isOn && styles.labelOn]}>
                {c.label}
              </Text>
              {c.description ? (
                <Text style={styles.description}>{c.description}</Text>
              ) : null}
            </View>
            <View style={[styles.radio, isOn && styles.radioOn]}>
              {isOn ? <View style={styles.radioDot} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
    backgroundColor: colors.card,
    borderWidth: sizes.borderInput,
    borderColor: colors.border,
    borderRadius: radius.lg,
  },
  rowOn: {
    borderColor: colors.primary,
    borderWidth: sizes.borderInputFocused,
    backgroundColor: colors.cardAlt,
  },
  pressed: { opacity: opacity.pressed },
  emoji: { fontSize: 22 },
  copy: { flex: 1, gap: 2 },
  label: {
    ...typography.bodyMd,
    color: colors.ink,
    fontWeight: '600',
  },
  labelOn: { color: colors.primary },
  description: {
    ...typography.bodySm,
    color: colors.inkMuted,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderInput,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
});
