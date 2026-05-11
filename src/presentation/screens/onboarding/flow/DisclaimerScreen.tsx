import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Checkbox } from '@/presentation/components/Checkbox';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, radius, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

const DISCLAIMER_BODY =
  'Nutricare Ai gives general wellness info based on widely accepted dietary guidelines. This isn’t medical advice — always check with your doctor before changing what you eat.';

export function DisclaimerScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const stored = useOnboardingStore((s) => s.answers.disclaimerAcknowledged);
  const patch = useOnboardingStore((s) => s.patch);

  const [acknowledged, setAcknowledged] = useState(stored);

  const onContinue = () => {
    if (!acknowledged) return;
    patch({ disclaimerAcknowledged: true });
    goNext();
  };

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        <OnboardingFooter
          primaryLabel="Continue →"
          onPrimary={onContinue}
          primaryDisabled={!acknowledged}
        />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          eyebrow="Important"
          title="Quick note before we go."
        />

        <View style={styles.card}>
          <Text style={styles.disclaimer}>{DISCLAIMER_BODY}</Text>
        </View>

        <Checkbox checked={acknowledged} onChange={setAcknowledged}>
          <Text style={styles.checkboxText}>
            I understand Nutricare Ai is{' '}
            <Text style={styles.checkboxBold}>not medical advice</Text>.
          </Text>
        </Checkbox>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
  card: {
    backgroundColor: colors.cardAmber,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  disclaimer: {
    ...typography.bodyMd,
    fontStyle: 'italic',
    color: colors.ink,
    fontSize: 15,
    lineHeight: 22,
  },
  checkboxText: typography.checkboxLabel,
  checkboxBold: typography.linkInline,
});
