import { useMemo, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import {
  EmptyInputAccessory,
  EMPTY_INPUT_ACCESSORY_ID,
} from '@/presentation/components/EmptyInputAccessory';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { TextField } from '@/presentation/components/TextField';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { ageToBirthday, calculateAge, hasValidBirthday } from '@/utils/age';

const MIN_AGE = 13;
const MAX_AGE = 100;

export function BirthdayScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const name = useOnboardingStore((s) => s.answers.name);
  const stored = useOnboardingStore((s) => s.answers.birthday);
  const patch = useOnboardingStore((s) => s.patch);

  const initial = hasValidBirthday(stored) ? String(calculateAge(stored!)) : '';
  const [draft, setDraft] = useState(initial);

  const parsed = Number(draft.trim());
  const isValidAge =
    Number.isFinite(parsed) && parsed >= MIN_AGE && parsed <= MAX_AGE;

  const helperText = useMemo(() => {
    if (!draft.trim()) return null;
    if (!isValidAge) {
      return `Please enter a number between ${MIN_AGE} and ${MAX_AGE}.`;
    }
    return null;
  }, [draft, isValidAge]);

  const onContinue = () => {
    if (!isValidAge) return;
    Keyboard.dismiss();
    patch({ birthday: ageToBirthday(parsed, stored) });
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
          primaryDisabled={!isValidAge}
        />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          eyebrow={name ? `Hey ${name}` : 'Quick one'}
          title="How old are you?"
          subtitle="Age helps us tailor the analysis — diabetes hits a 30-year-old differently than a 60-year-old."
        />

        <TextField
          label="Age"
          value={draft}
          onChangeText={(v) => setDraft(v.replace(/[^0-9]/g, ''))}
          placeholder="35"
          keyboardType="number-pad"
          maxLength={3}
          autoFocus
          inputAccessoryViewID={EMPTY_INPUT_ACCESSORY_ID}
        />

        {helperText ? (
          <Text style={styles.helper}>{helperText}</Text>
        ) : (
          <Text style={styles.privacy}>
            We use age in every meal analysis — never shared, never sold.
          </Text>
        )}
      </View>

      <EmptyInputAccessory />
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.md },
  helper: {
    ...typography.errorText,
    marginTop: spacing.xs,
  },
  privacy: {
    ...typography.bodySm,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
});
