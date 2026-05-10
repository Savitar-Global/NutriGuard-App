import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { TextField } from '@/presentation/components/TextField';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

const MIN_NAME = 2;
const MAX_NAME = 24;

export function NameScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const stored = useOnboardingStore((s) => s.answers.name);
  const patch = useOnboardingStore((s) => s.patch);

  const [value, setValue] = useState(stored ?? '');

  const trimmed = value.trim();
  const canContinue = trimmed.length >= MIN_NAME && trimmed.length <= MAX_NAME;

  const onContinue = () => {
    if (!canContinue) return;
    patch({ name: trimmed });
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
          primaryDisabled={!canContinue}
        />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          eyebrow="First things first"
          title="What should we call you?"
          subtitle="We’ll use your first name to make this feel less like an app and more like a plan made for you."
        />

        <TextField
          label="First name"
          value={value}
          onChangeText={setValue}
          placeholder="e.g. Alex"
          autoCapitalize="words"
          autoComplete="given-name"
          textContentType="givenName"
          autoCorrect={false}
          maxLength={MAX_NAME}
          returnKeyType="done"
          autoFocus
        />

        <Text style={styles.privacy}>
          Just your first name. Stays on your device until you create an
          account.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
  privacy: {
    ...typography.bodySm,
    color: colors.inkMuted,
  },
});
