import * as Notifications from 'expo-notifications';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, radius, sizes, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

export function NotificationsScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const patch = useOnboardingStore((s) => s.patch);
  const [requesting, setRequesting] = useState(false);

  const onEnable = async () => {
    if (requesting) return;
    setRequesting(true);
    try {
      await Notifications.requestPermissionsAsync();
    } catch {
      // ignore — user can enable later from Settings
    } finally {
      patch({ notificationsRequested: true });
      setRequesting(false);
      goNext();
    }
  };

  const onSkip = () => {
    patch({ notificationsRequested: true });
    goNext();
  };

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        <OnboardingFooter
          primaryLabel="Turn on reminders"
          onPrimary={onEnable}
          primaryLoading={requesting}
          secondaryLabel="Maybe later"
          onSecondary={onSkip}
        />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          eyebrow="Don’t lose your streak"
          title="One quick reminder a day."
          subtitle="If you forget to scan, we’ll ping you once at 8 pm. That’s it. No spam, no marketing."
        />

        <View style={styles.preview}>
          <View style={styles.previewIcon}>
            <Text style={styles.previewIconGlyph}>🍽️</Text>
          </View>
          <View style={styles.previewCopy}>
            <Text style={styles.previewTitle}>Nutricare Ai</Text>
            <Text style={styles.previewBody}>
              Your 1-day streak ends tonight — scan your dinner to keep it
              alive 🍽️
            </Text>
          </View>
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing['2xl'] },
  preview: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewIconGlyph: { fontSize: sizes.iconSm },
  previewCopy: { flex: 1, gap: 2 },
  previewTitle: { ...typography.bodySm, color: colors.ink, fontWeight: '700' },
  previewBody: { ...typography.bodySm, color: colors.inkSoft },
});
