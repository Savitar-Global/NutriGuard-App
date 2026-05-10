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

interface SecondaryButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
}

export function SecondaryButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  leftIcon,
}: SecondaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.buttonSecondaryFg} size="small" />
      ) : (
        <View style={styles.row}>
          {leftIcon}
          <Text style={styles.label}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: colors.buttonSecondary,
    borderRadius: radius.pill,
    paddingVertical: spacing.buttonPaddingY,
    paddingHorizontal: spacing.buttonPaddingX,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
  },
  pressed: { opacity: opacity.pressedSoft },
  disabled: { opacity: opacity.disabled },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: {
    ...typography.buttonSm,
    color: colors.buttonSecondaryFg,
  },
});
