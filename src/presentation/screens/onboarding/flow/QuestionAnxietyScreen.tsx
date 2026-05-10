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
  type AnxietyAnswer,
} from '@/stores/onboardingStore';

const CHOICES: ReadonlyArray<Choice<AnxietyAnswer>> = [
  { value: 'every_meal', label: 'Every single meal' },
  { value: 'few_times', label: 'A few times a week' },
  { value: 'restaurants', label: 'Mostly when I’m eating out' },
  { value: 'flagged_only', label: 'Only when something feels off' },
];

export function QuestionAnxietyScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const value = useOnboardingStore((s) => s.answers.anxiety);
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
          eyebrow="Question 3 of 4"
          title="How often does food stress you out?"
        />
        <ChoiceList
          choices={CHOICES}
          value={value}
          onSelect={(v) => patch({ anxiety: v })}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
});
