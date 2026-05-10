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
  type CuisineAnswer,
} from '@/stores/onboardingStore';

const CHOICES: ReadonlyArray<Choice<CuisineAnswer>> = [
  { value: 'western', label: 'Western (American / European)', emoji: '🍔' },
  { value: 'mediterranean', label: 'Mediterranean', emoji: '🥗' },
  { value: 'east_asian', label: 'East Asian', emoji: '🍜' },
  { value: 'south_asian', label: 'South Asian', emoji: '🍛' },
  { value: 'mixed', label: 'A mix — varies day to day', emoji: '🌮' },
];

export function CuisineScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const value = useOnboardingStore((s) => s.answers.cuisine);
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
          title="What kind of food do you eat most often?"
          subtitle="Helps us tailor the analysis to what’s actually on your plate."
        />
        <ChoiceList
          choices={CHOICES}
          value={value}
          onSelect={(v) => patch({ cuisine: v })}
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
});
