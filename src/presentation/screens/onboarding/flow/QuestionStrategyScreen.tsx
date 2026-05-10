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
  type StrategyAnswer,
} from '@/stores/onboardingStore';

const CHOICES: ReadonlyArray<Choice<StrategyAnswer>> = [
  { value: 'google', label: 'I Google it on the spot' },
  { value: 'doctor', label: 'I rely on advice my doctor gave me years ago' },
  { value: 'guess', label: 'I just guess and hope for the best' },
  {
    value: 'avoid',
    label: 'I avoid anything I’m not 100% sure about',
  },
];

export function QuestionStrategyScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const value = useOnboardingStore((s) => s.answers.strategy);
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
          eyebrow="Question 1 of 4"
          title="When you’re about to eat — how do you decide if it’s okay?"
        />
        <ChoiceList
          choices={CHOICES}
          value={value}
          onSelect={(v) => patch({ strategy: v })}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
});
