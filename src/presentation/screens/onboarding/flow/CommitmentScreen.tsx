import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import {
  ChoiceList,
  type Choice,
} from '@/presentation/components/onboarding/ChoiceList';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, radius, spacing, typography } from '@/presentation/theme';
import {
  useOnboardingStore,
  type CommitmentAnswer,
} from '@/stores/onboardingStore';

const CHOICES: ReadonlyArray<Choice<CommitmentAnswer>> = [
  {
    value: 'extremely',
    label: 'Extremely committed',
    description: 'I’m done guessing.',
  },
  {
    value: 'very',
    label: 'Very committed',
    description: 'I’ll scan most meals.',
  },
  {
    value: 'somewhat',
    label: 'Somewhat committed',
    description: 'I’ll see how it goes.',
  },
  {
    value: 'exploring',
    label: 'Just exploring',
    description: 'For now.',
  },
];

const RESPONSES: Record<CommitmentAnswer, string> = {
  extremely:
    'We love that energy. You’ll feel the difference within a week.',
  very: 'That’s the right mindset. Even scanning your dinner is a game-changer.',
  somewhat:
    'Fair enough. Give it 7 days and judge for yourself — that’s all we ask.',
  exploring:
    'No pressure. Try a few scans this week and see how you feel.',
};

export function CommitmentScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const value = useOnboardingStore((s) => s.answers.commitment);
  const name = useOnboardingStore((s) => s.answers.name);
  const patch = useOnboardingStore((s) => s.patch);

  const responseOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (value) {
      responseOpacity.setValue(0);
      Animated.timing(responseOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }
  }, [value, responseOpacity]);

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        <OnboardingFooter
          primaryLabel="Let’s go →"
          onPrimary={goNext}
          primaryDisabled={!value}
        />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          title={
            name
              ? `How committed are you, ${name}?`
              : 'How committed are you?'
          }
          subtitle="Be honest — there’s no wrong answer. We’ll meet you where you are."
        />

        <ChoiceList
          choices={CHOICES}
          value={value}
          onSelect={(v) => patch({ commitment: v })}
        />

        {value ? (
          <Animated.View style={[styles.response, { opacity: responseOpacity }]}>
            <Text style={styles.responseText}>{RESPONSES[value]}</Text>
          </Animated.View>
        ) : null}
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg },
  response: {
    backgroundColor: colors.cardAmber,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  responseText: {
    ...typography.bodyMd,
    color: colors.ink,
    fontStyle: 'italic',
  },
});
