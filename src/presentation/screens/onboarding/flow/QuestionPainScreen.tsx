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
  type PainAnswer,
} from '@/stores/onboardingStore';
import { conditionsSentence } from '@/utils/onboarding';

const CHOICES: ReadonlyArray<Choice<PainAnswer>> = [
  { value: 'eating_out', label: 'Eating out — restaurant food is a black box' },
  { value: 'labels', label: 'Reading labels and not understanding them' },
  { value: 'family', label: 'Family meals — I can’t always control what’s cooked' },
  { value: 'cravings', label: 'Cravings — I want it but worry I’ll regret it' },
];

export function QuestionPainScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const conditions = useOnboardingStore((s) => s.answers.conditions);
  const customs = useOnboardingStore((s) => s.answers.customConditions);
  const value = useOnboardingStore((s) => s.answers.pain);
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
          eyebrow="Question 2 of 4"
          title={`What’s the hardest part of eating with ${conditionsSentence(conditions, customs)}?`}
        />
        <ChoiceList
          choices={CHOICES}
          value={value}
          onSelect={(v) => patch({ pain: v })}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
});
