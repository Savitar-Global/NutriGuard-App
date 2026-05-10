import { StyleSheet, Text, View } from 'react-native';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, radius, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  conditionsSentence,
  labelForCooking,
  labelForCuisine,
  labelForGoal,
} from '@/utils/onboarding';

export function PlanSummaryScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const a = useOnboardingStore((s) => s.answers);

  const conditionsCopy = conditionsSentence(a.conditions, a.customConditions);
  const goalCopy = a.goal ? labelForGoal(a.goal) : 'eat with confidence';
  const styleCopy =
    a.cuisine && a.cooking
      ? `Mostly ${labelForCuisine(a.cuisine)} — you ${labelForCooking(a.cooking)}.`
      : 'Tailored to what you actually eat.';

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        <OnboardingFooter
          primaryLabel="This looks right →"
          onPrimary={goNext}
        />
      }
    >
      <View style={styles.body}>
        <Text style={styles.eyebrow}>YOUR FOOD PLAN</Text>
        <Text style={styles.title}>
          {a.name ? `${a.name}’s plan 🍽️` : 'Your plan 🍽️'}
        </Text>

        <View style={styles.cards}>
          <SummaryCard label="Your conditions" value={conditionsCopy} />
          <SummaryCard label="Your goal" value={`To ${goalCopy}.`} />
          <SummaryCard label="Your style" value={styleCopy} />
          <SummaryCard
            label="Your timeline"
            value="30 days to confidence with every meal."
            highlighted
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

interface SummaryCardProps {
  label: string;
  value: string;
  highlighted?: boolean;
}

function SummaryCard({ label, value, highlighted = false }: SummaryCardProps) {
  return (
    <View style={[styles.card, highlighted && styles.cardHighlight]}>
      <Text style={[styles.cardLabel, highlighted && styles.cardLabelHighlight]}>
        {label}
      </Text>
      <Text style={[styles.cardValue, highlighted && styles.cardValueHighlight]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
  eyebrow: {
    ...typography.label,
    color: colors.accentDark,
  },
  title: { ...typography.displayLg },
  cards: { gap: spacing.sm + 2 },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHighlight: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  cardLabel: { ...typography.label, color: colors.inkMuted },
  cardLabelHighlight: { color: colors.onPrimary.label },
  cardValue: { ...typography.bodyMd, color: colors.ink, fontWeight: '600' },
  cardValueHighlight: { color: colors.primaryContrast },
});
