import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

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
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brand}>
          <Image
            source={require('../../../../../assets/onboard.png')}
            style={styles.logo}
            contentFit="contain"
            accessibilityLabel="Nutricare Ai logo"
          />
          <View style={styles.nameRow}>
            <Text style={styles.name}>NutriCare</Text>
            <Text style={styles.nameAi}> AI</Text>
          </View>
          <View style={styles.slogan}>
            <Text style={styles.sloganWord}>Scan</Text>
            <Text style={styles.sloganDot}>·</Text>
            <Text style={styles.sloganWord}>Know</Text>
            <Text style={styles.sloganDot}>·</Text>
            <Text style={styles.sloganWord}>Eat</Text>
          </View>
        </View>

        <View style={styles.copy}>
          <OnboardingHero
            align="center"
            title={'Hey.'}
            italicTail={'Glad you’re here.'}
            subtitle="We’ll set up a food guide that fits your conditions — together."
          />
          <Text style={styles.tagline}>
            Nutricare Ai checks every meal, every label, every craving — against
            your conditions.
          </Text>
        </View>
      </ScrollView>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    paddingTop: spacing['5xl'] + spacing.xl,
    paddingBottom: spacing['2xl'],
    gap: spacing['2xl'],
  },
  brand: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logo: {
    width: 140,
    height: 140,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  name: {
    ...typography.displayLg,
    fontSize: 34,
    lineHeight: 40,
    color: colors.ink,
    letterSpacing: -0.4,
  },
  nameAi: {
    ...typography.displayLg,
    fontSize: 34,
    lineHeight: 40,
    color: colors.accentDark,
    fontStyle: 'italic',
    letterSpacing: -0.4,
  },
  slogan: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sloganWord: {
    fontSize: 11.5,
    fontWeight: '700',
    letterSpacing: 3.2,
    textTransform: 'uppercase',
    color: colors.inkSoft,
  },
  sloganDot: {
    fontSize: 14,
    color: colors.accent,
    marginTop: -2,
  },
  copy: {
    gap: spacing.xl,
  },
  tagline: {
    ...typography.bodyMd,
    color: colors.inkSoft,
    textAlign: 'center',
  },
});
