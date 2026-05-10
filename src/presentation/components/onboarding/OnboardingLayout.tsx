import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackButton } from '@/presentation/components/BackButton';
import { OnboardingProgressBar } from '@/presentation/components/onboarding/OnboardingProgressBar';
import { colors, spacing } from '@/presentation/theme';

interface OnboardingLayoutProps {
  step?: number;
  totalSteps?: number;
  onBack?: () => void;
  scrollable?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  footer?: React.ReactNode;
  children: React.ReactNode;
}

export function OnboardingLayout({
  step,
  totalSteps,
  onBack,
  scrollable = true,
  contentStyle,
  footer,
  children,
}: OnboardingLayoutProps) {
  const showProgress = typeof step === 'number' && typeof totalSteps === 'number';

  const body = scrollable ? (
    <ScrollView
      contentContainerStyle={[styles.scroll, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.staticBody, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <View style={styles.topRow}>
          {onBack ? (
            <BackButton onPress={onBack} label={null} variant="circle" />
          ) : (
            <View style={styles.backPlaceholder} />
          )}
        </View>
        {showProgress && (
          <OnboardingProgressBar step={step!} total={totalSteps!} />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        {body}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  flex: { flex: 1 },
  topBar: {
    paddingTop: spacing.xs,
    gap: spacing.sm,
  },
  topRow: {
    paddingHorizontal: spacing.screenPaddingX,
    minHeight: 32,
    justifyContent: 'center',
  },
  backPlaceholder: { height: 28 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  staticBody: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  footer: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
});
