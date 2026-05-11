import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, radius, spacing, typography } from '@/presentation/theme';
import { useDemoScanStore } from '@/stores/demoScanStore';
import { useOnboardingStore } from '@/stores/onboardingStore';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const PIZZA_PHOTO = require('../../../../../assets/food_photo.webp');

export function DemoIntroScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const name = useOnboardingStore((s) => s.answers.name);
  const runDemoScan = useDemoScanStore((s) => s.run);

  const onScan = () => {
    void runDemoScan();
    goNext();
  };

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        <OnboardingFooter primaryLabel="Scan this meal →" onPrimary={onScan} />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          eyebrow="Quick demo"
          title={name ? `Let’s try one together, ${name}.` : 'Let’s try one together.'}
          subtitle="Here’s a meal someone might eat tonight. We’ll check it against your conditions — same way you would in real life."
        />

        <View style={styles.plateCard}>
          <Image
            source={PIZZA_PHOTO}
            style={styles.photo}
            contentFit="cover"
            transition={150}
          />
          <View style={styles.captionRow}>
            <Text style={styles.caption}>
              Loaded pizza · Cheese · Tomato · Cured meats · Veg
            </Text>
          </View>
        </View>

        <Text style={styles.hint}>
          Takes about 5–10 seconds. Real AI, real verdict — tuned to you.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.xl },
  plateCard: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photo: {
    width: 240,
    height: 240,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
  },
  captionRow: { paddingHorizontal: spacing.sm },
  caption: {
    ...typography.bodyMd,
    color: colors.inkSoft,
    textAlign: 'center',
    fontWeight: '600',
  },
  hint: {
    ...typography.bodySm,
    color: colors.inkMuted,
    textAlign: 'center',
  },
});
