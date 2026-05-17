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

type DangerButtonVariant = 'solid' | 'outline';

interface DangerButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  variant?: DangerButtonVariant;
}

export function DangerButton({
  label,
  onPress,
  loading = false,
  disabled = false,
  leftIcon,
  variant = 'solid',
}: DangerButtonProps) {
  const isDisabled = disabled || loading;
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.btn,
        isOutline ? styles.btnOutline : styles.btnSolid,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutline ? colors.danger : colors.primaryContrast}
          size="small"
        />
      ) : (
        <View style={styles.row}>
          {leftIcon}
          <Text
            style={[styles.label, isOutline ? styles.labelOutline : styles.labelSolid]}
          >
            {label}
          </Text>
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
  btnSolid: { backgroundColor: colors.danger },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: sizes.borderInput,
    borderColor: colors.danger,
  },
  pressed: { opacity: opacity.pressedSoft },
  disabled: { opacity: opacity.disabled },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  label: { ...typography.button },
  labelSolid: { color: colors.primaryContrast },
  labelOutline: { color: colors.danger },
});
