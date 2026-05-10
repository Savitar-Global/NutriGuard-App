import { StyleSheet, Text, View } from 'react-native';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, radius, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { reflectionForStrategy } from '@/utils/onboarding';

export function ReflectStrategyScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const strategy = useOnboardingStore((s) => s.answers.strategy);

  if (!strategy) {
    return (
      <OnboardingLayout
        step={step}
        totalSteps={totalSteps}
        onBack={canGoBack ? goBack : undefined}
        scrollable={false}
        footer={
          <OnboardingFooter primaryLabel="Continue →" onPrimary={goNext} />
        }
      >
        <View style={styles.body}>
          <OnboardingHero
            title="You deserve a real answer."
            subtitle="Not a panic search or a memory from years ago — a real answer, every time."
          />
        </View>
      </OnboardingLayout>
    );
  }

  const reflection = reflectionForStrategy(strategy);

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      scrollable={false}
      footer={
        <OnboardingFooter primaryLabel="True →" onPrimary={goNext} />
      }
    >
      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>We hear you</Text>
          <Text style={styles.cardTitle}>{reflection.headline}</Text>
          <Text style={styles.cardBody}>{reflection.sub}</Text>
        </View>

        <Text style={styles.kicker}>
          You deserve a real answer — not a panic search or a memory from 2019.
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
  card: {
    backgroundColor: colors.cardAmber,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  cardEyebrow: {
    ...typography.label,
    color: colors.accentDark,
  },
  cardTitle: {
    ...typography.h1,
    color: colors.ink,
  },
  cardBody: {
    ...typography.bodyMd,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  kicker: {
    ...typography.bodyMd,
    color: colors.inkSoft,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
