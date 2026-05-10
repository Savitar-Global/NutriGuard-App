import { StyleSheet, View } from 'react-native';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { spacing } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { conditionsSentence } from '@/utils/onboarding';

export function BridgeScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const name = useOnboardingStore((s) => s.answers.name);
  const conditions = useOnboardingStore((s) => s.answers.conditions);
  const customs = useOnboardingStore((s) => s.answers.customConditions);

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      scrollable={false}
      footer={
        <OnboardingFooter
          primaryLabel="Yes, let’s do it →"
          onPrimary={goNext}
        />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          eyebrow="The good news"
          title="It doesn’t have to be guesswork anymore."
          subtitle={
            name
              ? `${name}, NutriGuard was built specifically for people managing ${conditionsSentence(conditions, customs)}. Let’s set up your personal food guide. Takes about 2 minutes.`
              : `NutriGuard was built specifically for people managing ${conditionsSentence(conditions, customs)}. Let’s set up your personal food guide. Takes about 2 minutes.`
          }
        />
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', gap: spacing.lg },
});
