import { StyleSheet, View } from 'react-native';

import {
  ChoiceList,
  type Choice,
} from '@/presentation/components/onboarding/ChoiceList';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { spacing } from '@/presentation/theme';
import {
  useOnboardingStore,
  type CookingAnswer,
} from '@/stores/onboardingStore';

const CHOICES: ReadonlyArray<Choice<CookingAnswer>> = [
  { value: 'daily', label: 'Almost every day' },
  { value: 'weekly', label: 'A few times a week' },
  { value: 'rarely', label: 'Rarely — I eat out / order in' },
  { value: 'mixed', label: 'About 50/50' },
];

export function CookingScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const value = useOnboardingStore((s) => s.answers.cooking);
  const patch = useOnboardingStore((s) => s.patch);

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        <OnboardingFooter
          primaryLabel="Continue →"
          onPrimary={goNext}
          primaryDisabled={!value}
        />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          title="How often do you cook your own meals?"
        />
        <ChoiceList
          choices={CHOICES}
          value={value}
          onSelect={(v) => patch({ cooking: v })}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
});
