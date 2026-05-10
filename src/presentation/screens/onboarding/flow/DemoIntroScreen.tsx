import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingHero } from '@/presentation/components/onboarding/OnboardingHero';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import { colors, radius, spacing, typography } from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';

export function DemoIntroScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const name = useOnboardingStore((s) => s.answers.name);

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        <OnboardingFooter primaryLabel="Scan this meal →" onPrimary={goNext} />
      }
    >
      <View style={styles.body}>
        <OnboardingHero
          eyebrow="Quick demo"
          title={name ? `Let’s try one together, ${name}.` : 'Let’s try one together.'}
          subtitle="Here’s a meal someone might eat tonight. We’ll check it the same way you would — and you’ll see exactly how NutriGuard works."
        />

        <View style={styles.plateCard}>
          <PlateIllustration />
          <View style={styles.captionRow}>
            <Text style={styles.caption}>Grilled chicken · White rice · Mixed salad</Text>
          </View>
        </View>

        <Text style={styles.hint}>
          Takes about 5 seconds. No data sent anywhere — this one’s a demo.
        </Text>
      </View>
    </OnboardingLayout>
  );
}

function PlateIllustration() {
  return (
    <View style={styles.plateWrap}>
      <Svg width={220} height={180} viewBox="0 0 220 180">
        {/* Plate shadow */}
        <Ellipse cx={110} cy={150} rx={92} ry={10} fill="rgba(0,0,0,0.06)" />
        {/* Plate */}
        <Circle cx={110} cy={92} r={86} fill={colors.card} stroke={colors.border} strokeWidth={1.5} />
        <Circle cx={110} cy={92} r={70} fill="#FAF6EE" stroke={colors.borderLight} strokeWidth={1} />

        {/* Chicken — golden/brown blob */}
        <Path
          d="M58 70 Q70 50 95 60 Q120 65 110 95 Q98 110 75 100 Q55 90 58 70 Z"
          fill="#C28A4A"
          stroke="#9B6A2C"
          strokeWidth={1.2}
        />
        <Path
          d="M68 75 Q78 70 86 78"
          stroke="#8B5A1F"
          strokeWidth={1}
          fill="none"
          strokeLinecap="round"
        />

        {/* Rice — pile of grains */}
        <Path
          d="M120 60 Q140 55 158 70 Q165 90 145 96 Q125 100 118 80 Z"
          fill="#F8F0E0"
          stroke="#D9C9A8"
          strokeWidth={1}
        />
        {[...Array(7)].map((_, i) => (
          <Ellipse
            key={i}
            cx={128 + (i * 5) % 32}
            cy={70 + ((i * 4) % 18)}
            rx={2.5}
            ry={1.4}
            fill="#FFFFFF"
            stroke="#D9C9A8"
            strokeWidth={0.4}
          />
        ))}

        {/* Salad — green leaves + tomato */}
        <Path
          d="M70 110 Q90 100 115 108 Q140 116 145 130 Q120 142 90 138 Q70 132 70 110 Z"
          fill="#9DBE7C"
          stroke="#6F8E54"
          strokeWidth={1}
        />
        <Circle cx={92} cy={120} r={5} fill="#E07A5F" stroke="#B85A40" strokeWidth={0.8} />
        <Circle cx={120} cy={128} r={4.5} fill="#E07A5F" stroke="#B85A40" strokeWidth={0.8} />
        <Path
          d="M85 115 Q90 108 96 114"
          stroke="#5C7B45"
          strokeWidth={1}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d="M110 122 Q116 115 124 121"
          stroke="#5C7B45"
          strokeWidth={1}
          fill="none"
          strokeLinecap="round"
        />

        {/* Steam */}
        <Path d="M88 35 Q92 28 88 22" stroke={colors.inkMuted} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.5} />
        <Path d="M115 35 Q119 28 115 20" stroke={colors.inkMuted} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.4} />
        <Path d="M132 38 Q136 31 132 25" stroke={colors.inkMuted} strokeWidth={1.2} fill="none" strokeLinecap="round" opacity={0.45} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.xl },
  plateCard: {
    backgroundColor: colors.cardAlt,
    borderRadius: radius.xl,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  plateWrap: { alignItems: 'center', justifyContent: 'center' },
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
