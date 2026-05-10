import { StyleSheet, Text, View } from 'react-native';

import { Logo } from '@/presentation/components/Logo';
import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, spacing, typography } from '@/presentation/theme';

export function WelcomeScreen() {
  const { goNext } = useOnboardingNav();

  return (
    <OnboardingLayout
      scrollable={false}
      footer={
        <OnboardingFooter primaryLabel="Let’s start →" onPrimary={goNext} />
      }
    >
      <View style={styles.body}>
        <View style={styles.logo}>
          <Logo />
        </View>
        <OnboardingHero
          title={'Hey.'}
          italicTail={'Glad you’re here.'}
          subtitle="We’ll set up a food guide that fits your conditions — together."
        />
        <Text style={styles.tagline}>
          NutriGuard checks every meal, every label, every craving — against your
          conditions.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  logo: { alignItems: 'flex-start' },
  tagline: {
    ...typography.bodyMd,
    color: colors.inkSoft,
  },
});
