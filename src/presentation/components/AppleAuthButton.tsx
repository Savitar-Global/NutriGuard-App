import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

type AppleAuthVariant = 'dark' | 'light';

interface AppleAuthButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: AppleAuthVariant;
}

const variantTheme: Record<
  AppleAuthVariant,
  { bg: string; fg: string; pressedOpacity: number }
> = {
  dark: {
    bg: colors.buttonDark,
    fg: colors.buttonDarkFg,
    pressedOpacity: opacity.pressed,
  },
  light: {
    bg: colors.buttonSecondary,
    fg: colors.buttonSecondaryFg,
    pressedOpacity: opacity.pressedSoft,
  },
};

export function AppleAuthButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  variant = 'dark',
}: AppleAuthButtonProps) {
  const isDisabled = disabled || loading;
  const theme = variantTheme[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: theme.bg },
        isDisabled && styles.disabled,
        pressed && !isDisabled && { opacity: theme.pressedOpacity },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={theme.fg} size="small" />
      ) : (
        <View style={styles.row}>
          <Text style={[styles.glyph, { color: theme.fg }]}></Text>
          <Text style={[styles.label, { color: theme.fg }]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: radius.pill,
    paddingVertical: spacing.buttonPaddingY,
    paddingHorizontal: spacing.buttonPaddingX,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
  },
  disabled: { opacity: opacity.disabled },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  glyph: typography.appleGlyph,
  label: typography.button,
});
