import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PrimaryButton } from '@/presentation/components/PrimaryButton';
import { colors, opacity, spacing, typography } from '@/presentation/theme';

interface OnboardingFooterProps {
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

export function OnboardingFooter({
  primaryLabel,
  onPrimary,
  primaryDisabled = false,
  primaryLoading = false,
  secondaryLabel,
  onSecondary,
}: OnboardingFooterProps) {
  return (
    <View style={styles.wrap}>
      <PrimaryButton
        label={primaryLabel}
        onPress={onPrimary}
        disabled={primaryDisabled}
        loading={primaryLoading}
      />
      {secondaryLabel && onSecondary ? (
        <Pressable
          onPress={onSecondary}
          hitSlop={spacing.sm}
          style={({ pressed }) => pressed && styles.pressed}
          accessibilityRole="button"
        >
          <Text style={styles.secondary}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm, alignItems: 'stretch' },
  pressed: { opacity: opacity.pressedSubtle },
  secondary: {
    ...typography.bodySm,
    color: colors.inkMuted,
    textAlign: 'center',
    paddingVertical: spacing.xs,
  },
});
