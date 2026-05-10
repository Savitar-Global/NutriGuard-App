import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingFlowStack } from '@/presentation/navigation/OnboardingFlowStack';
import { colors, opacity, radius, sizes, spacing } from '@/presentation/theme';

interface OnboardingPreviewWrapperProps {
  onClose: () => void;
}

/**
 * Dev-only wrapper: renders the full `OnboardingFlowStack` for UI inspection,
 * plus a floating close button so the previewer can exit from any screen.
 *
 * NOTE: this is a temporary dev affordance. The button on `HomeScreen` that
 * navigates here is also marked with the existing TEST styling and should be
 * removed before shipping.
 */
export function OnboardingPreviewWrapper({
  onClose,
}: OnboardingPreviewWrapperProps) {
  return (
    <View style={styles.root}>
      <OnboardingFlowStack />
      <SafeAreaView
        style={styles.closeWrap}
        edges={['top']}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={onClose}
          hitSlop={spacing.sm}
          style={({ pressed }) => [
            styles.closeBtn,
            pressed && { opacity: opacity.pressedSubtle },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Close onboarding preview"
        >
          <Text style={styles.closeGlyph}>×</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  closeWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: spacing.sm,
  },
  closeBtn: {
    width: sizes.circleButton,
    height: sizes.circleButton,
    borderRadius: radius.full,
    backgroundColor: colors.buttonDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeGlyph: {
    color: colors.buttonDarkFg,
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 20,
  },
});
