import { ChoiceList, type Choice } from '@/presentation/components/onboarding/ChoiceList';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { spacing } from '@/presentation/theme';
import {
  useOnboardingStore,
  type ManagingDuration,
} from '@/stores/onboardingStore';
import { conditionsSentence } from '@/utils/onboarding';
import { StyleSheet, View } from 'react-native';

const CHOICES: ReadonlyArray<Choice<ManagingDuration>> = [
  { value: 'less_than_year', label: 'Less than a year' },
  { value: 'one_to_three', label: '1–3 years' },
  { value: 'three_to_ten', label: '3–10 years' },
  { value: 'over_ten', label: 'More than 10 years' },
];

export function DurationScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const conditions = useOnboardingStore((s) => s.answers.conditions);
  const customs = useOnboardingStore((s) => s.answers.customConditions);
  const value = useOnboardingStore((s) => s.answers.yearsManaging);
  const patch = useOnboardingStore((s) => s.patch);

  const onContinue = () => {
    if (value) goNext();
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
          primaryDisabled={!value}
        />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          title={`How long have you been\nmanaging ${conditionsSentence(conditions, customs)}?`}
        />
        <ChoiceList
          choices={CHOICES}
          value={value}
          onSelect={(v) => patch({ yearsManaging: v })}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
});
