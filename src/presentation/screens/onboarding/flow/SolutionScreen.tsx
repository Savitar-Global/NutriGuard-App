import { StyleSheet, Text, View } from 'react-native';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, radius, spacing, typography } from '@/presentation/theme';

const VERDICTS = [
  { label: 'All Good!', bg: colors.verdict.allGood.bg, fg: colors.verdict.allGood.fg },
  { label: 'Mostly Fine', bg: colors.verdict.mostlyFine.bg, fg: colors.verdict.mostlyFine.fg },
  { label: 'Eat Less', bg: colors.verdict.eatLess.bg, fg: colors.verdict.eatLess.fg },
  { label: 'Not Ideal', bg: colors.verdict.notIdeal.bg, fg: colors.verdict.notIdeal.fg },
  { label: 'Skip It', bg: colors.verdict.skipIt.bg, fg: colors.verdict.skipIt.fg },
] as const;

export function SolutionScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      scrollable={false}
      footer={
        <OnboardingFooter primaryLabel="Show me how →" onPrimary={goNext} />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          eyebrow="The solution"
          title={'NutriGuard checks every meal\nagainst your conditions —'}
          italicTail="in 10 seconds."
          subtitle="Snap it. Scan the label. Or just type what you’re eating. We’ll tell you straight."
        />

        <View style={styles.chipRow}>
          {VERDICTS.map((v) => (
            <View
              key={v.label}
              style={[styles.chip, { backgroundColor: v.bg }]}
            >
              <Text style={[styles.chipLabel, { color: v.fg }]}>{v.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing['2xl'],
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  chipLabel: {
    ...typography.chipLabel,
    fontWeight: '700',
  },
});
