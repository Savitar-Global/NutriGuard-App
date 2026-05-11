import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FadeInLines } from '@/presentation/components/onboarding/FadeInLines';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  conditionsSentence,
  labelForAnxiety,
  labelForGoal,
} from '@/utils/onboarding';

const STRATEGY_PARAPHRASE = {
  google: 'you’re Googling answers on the spot',
  doctor: 'you’re relying on advice from years ago',
  guess: 'you’re guessing and hoping it turns out fine',
  avoid: 'you’re avoiding anything you’re unsure about',
} as const;

export function MirrorScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const a = useOnboardingStore((s) => s.answers);
  const [readyForCta, setReadyForCta] = useState(false);

  const lines = useMemo(() => {
    const conditionsCopy = conditionsSentence(a.conditions, a.customConditions);
    const strategy = a.strategy ? STRATEGY_PARAPHRASE[a.strategy] : 'you’re doing your best';
    const anxiety = a.anxiety ? labelForAnxiety(a.anxiety) : 'often';
    const goal = a.goal ? labelForGoal(a.goal) : 'eat with confidence';

    return [
      `You’re managing ${conditionsCopy}.`,
      `Right now, ${strategy}.`,
      `Food stresses you out ${anxiety}.`,
      `What you really want is to ${goal}.`,
      'We hear you. Nutricare Ai was built for exactly this.',
    ];
  }, [a]);

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        readyForCta ? (
          <OnboardingFooter primaryLabel="I’m in →" onPrimary={goNext} />
        ) : null
      }
    >
      <View style={styles.body}>
        <Text style={styles.eyebrow}>HERE’S WHAT WE HEARD</Text>
        <Text style={styles.title}>
          {a.name ? `${a.name},` : 'Here’s what we heard,'}
        </Text>

        <View style={styles.linesWrap}>
          <FadeInLines
            lines={lines}
            intervalMs={750}
            startDelayMs={300}
            italicLastLine
            textStyle={styles.line}
            onComplete={() => setReadyForCta(true)}
          />
        </View>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  eyebrow: {
    ...typography.label,
    color: colors.accentDark,
  },
  title: {
    ...typography.h1,
    fontSize: 32,
    lineHeight: 38,
  },
  linesWrap: { marginTop: spacing.md },
  line: {
    ...typography.bodyMd,
    fontSize: 17,
    lineHeight: 25,
    color: colors.ink,
  },
});
