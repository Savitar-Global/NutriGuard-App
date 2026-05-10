import { StyleSheet, Text, View } from 'react-native';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';

export function ProblemScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      scrollable={false}
      footer={
        <OnboardingFooter primaryLabel="That’s me →" onPrimary={goNext} />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          eyebrow="The problem"
          title={'Ever finished a meal\nand thought…'}
        />
        <Text style={styles.quote}>
          “Was that even okay for me to eat?”
        </Text>
        <Text style={styles.body2}>
          If you’re managing a condition, every plate is a question. And the
          answer is usually a guess.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.lg,
  },
  quote: {
    ...typography.h2,
    fontStyle: 'italic',
    color: colors.inkSoft,
    fontSize: 22,
    lineHeight: 28,
  },
  body2: {
    ...typography.bodyMd,
    color: colors.inkSoft,
  },
});
