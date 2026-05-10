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
  type GoalAnswer,
} from '@/stores/onboardingStore';

const CHOICES: ReadonlyArray<Choice<GoalAnswer>> = [
  { value: 'eat_out', label: 'I’d eat out without the anxiety' },
  { value: 'enjoy_meals', label: 'I’d actually enjoy meals again' },
  { value: 'stop_guessing', label: 'I’d stop second-guessing every plate' },
  { value: 'stick_plan', label: 'I’d stick to my plan way better' },
];

export function QuestionGoalScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const value = useOnboardingStore((s) => s.answers.goal);
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
          eyebrow="Question 4 of 4"
          title="What would change if you knew every meal was safe?"
        />
        <ChoiceList
          choices={CHOICES}
          value={value}
          onSelect={(v) => patch({ goal: v })}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
});
