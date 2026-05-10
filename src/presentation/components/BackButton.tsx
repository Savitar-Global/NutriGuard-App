import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

type BackButtonVariant = 'text' | 'circle';

interface BackButtonProps {
  onPress: () => void;
  label?: string | null;
  variant?: BackButtonVariant;
}

export function BackButton({
  onPress,
  label = 'Back',
  variant = 'text',
}: BackButtonProps) {
  const a11yLabel = label ?? 'Back';

  if (variant === 'circle') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        hitSlop={spacing.sm}
        accessibilityRole="button"
        accessibilityLabel={a11yLabel}
      >
        <View style={styles.circle}>
          <Svg width={10} height={10} viewBox="0 0 10 10">
            <Path
              d="M7 1L3 5l4 4"
              stroke={colors.inkChevron}
              strokeWidth={1.4}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        {label ? <Text style={styles.circleLabel}>{label}</Text> : null}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      hitSlop={spacing.sm}
      accessibilityRole="button"
      accessibilityLabel={a11yLabel}
    >
      <Text style={styles.chevron}>←</Text>
      {label ? <Text style={styles.label}>{label}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    alignSelf: 'flex-start',
  },
  pressed: { opacity: opacity.pressedSubtle },
  chevron: typography.chevron,
  label: typography.backLabel,
  circle: {
    width: sizes.circleButton,
    height: sizes.circleButton,
    borderRadius: radius.full,
    backgroundColor: colors.overlayLight,
    borderWidth: sizes.borderInput,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleLabel: {
    ...typography.body,
    color: colors.inkSoft,
  },
});
