import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OnboardingFooter } from '@/presentation/components/onboarding/OnboardingFooter';
import { OnboardingLayout } from '@/presentation/components/onboarding/OnboardingLayout';
import { VerdictChip } from '@/presentation/components/VerdictChip';
import { useOnboardingNav } from '@/presentation/hooks/useOnboardingNav';
import {
  colors,
  opacity,
  radius,
  spacing,
  typography,
} from '@/presentation/theme';
import { useOnboardingStore } from '@/stores/onboardingStore';
import {
  demoDamageControlForUser,
  demoInsightForUser,
} from '@/utils/onboarding';
import type { VerdictId } from '@/domain/entities/Verdict';

interface DemoItem {
  name: string;
  verdict: VerdictId;
  reasoning: string;
  flagged: boolean;
}

const DEMO_ITEMS: ReadonlyArray<DemoItem> = [
  {
    name: 'Grilled chicken',
    verdict: 'all_good',
    reasoning: 'Lean protein, low fat, no aggravators.',
    flagged: false,
  },
  {
    name: 'Mixed salad',
    verdict: 'all_good',
    reasoning: 'Fresh veg — keep dressings light.',
    flagged: false,
  },
  {
    name: 'White rice',
    verdict: 'eat_less',
    reasoning: 'High glycaemic — keep portions small.',
    flagged: true,
  },
];

const DISH_SAFETY_PCT = 78;

export function DemoResultScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const conditions = useOnboardingStore((s) => s.answers.conditions);
  const customs = useOnboardingStore((s) => s.answers.customConditions);

  const insight = demoInsightForUser(conditions, customs);
  const damageControl = demoDamageControlForUser(conditions, customs);

  const [showDamageControl, setShowDamageControl] = useState(false);

  return (
    <OnboardingLayout
      step={step}
      totalSteps={totalSteps}
      onBack={canGoBack ? goBack : undefined}
      footer={
        <OnboardingFooter
          primaryLabel="That’s how easy it is →"
          onPrimary={goNext}
        />
      }
    >
      <View style={styles.body}>
        <Text style={styles.eyebrow}>Demo result</Text>
        <Text style={styles.title}>Here’s what’s on your plate 🍽️</Text>

        <View style={styles.safetyCard}>
          <Text style={styles.safetyLabel}>Dish safety for you</Text>
          <Text style={styles.safetyPct}>{DISH_SAFETY_PCT}%</Text>
          <View style={styles.safetyBar}>
            <View style={[styles.safetyFill, { width: `${DISH_SAFETY_PCT}%` }]} />
          </View>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Insight</Text>
          <Text style={styles.insightBody}>{insight}</Text>
        </View>

        <Text style={styles.sectionLabel}>Safe to enjoy</Text>
        {DEMO_ITEMS.filter((i) => !i.flagged).map((item) => (
          <ItemCard key={item.name} item={item} />
        ))}

        <Text style={styles.sectionLabel}>Worth a closer look</Text>
        {DEMO_ITEMS.filter((i) => i.flagged).map((item) => (
          <ItemCard
            key={item.name}
            item={item}
            onEatAnyway={() => setShowDamageControl(true)}
          />
        ))}

        <Text style={styles.disclaimer}>
          Nutricare Ai gives general wellness info, not medical advice.
        </Text>
      </View>

      <Modal
        visible={showDamageControl}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDamageControl(false)}
      >
        <DamageControlSheet
          advice={damageControl}
          onClose={() => setShowDamageControl(false)}
        />
      </Modal>
    </OnboardingLayout>
  );
}

interface ItemCardProps {
  item: DemoItem;
  onEatAnyway?: () => void;
}

function ItemCard({ item, onEatAnyway }: ItemCardProps) {
  return (
    <View style={styles.itemCard}>
      <View style={styles.itemHeader}>
        <Text style={styles.itemName}>{item.name}</Text>
        <VerdictChip verdict={item.verdict} />
      </View>
      <Text style={styles.itemReason}>{item.reasoning}</Text>
      {onEatAnyway ? (
        <Pressable
          onPress={onEatAnyway}
          style={({ pressed }) => [
            styles.eatAnywayBtn,
            pressed && { opacity: opacity.pressed },
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.eatAnywayLabel}>Eat anyway →</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface DamageControlSheetProps {
  advice: string;
  onClose: () => void;
}

function DamageControlSheet({ advice, onClose }: DamageControlSheetProps) {
  return (
    <SafeAreaView style={styles.sheetSafe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.sheetBody}>
        <Text style={styles.sheetEyebrow}>Damage control</Text>
        <Text style={styles.sheetTitle}>White rice</Text>
        <Text style={styles.sheetAdvice}>{advice}</Text>
      </ScrollView>
      <View style={styles.sheetFooter}>
        <OnboardingFooter primaryLabel="Got it" onPrimary={onClose} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: { gap: spacing.lg, paddingBottom: spacing.lg },
  eyebrow: {
    ...typography.label,
    color: colors.accentDark,
  },
  title: { ...typography.h1, fontSize: 26, lineHeight: 32 },

  safetyCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  safetyLabel: {
    ...typography.label,
    color: colors.onPrimary.label,
  },
  safetyPct: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 56,
    lineHeight: 60,
    fontWeight: '700',
    color: colors.primaryContrast,
  },
  safetyBar: {
    height: 6,
    backgroundColor: colors.onPrimary.surface,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  safetyFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.full,
  },

  insightCard: {
    backgroundColor: colors.cardAmber,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  insightLabel: {
    ...typography.label,
    color: colors.accentDark,
  },
  insightBody: {
    ...typography.bodyMd,
    color: colors.ink,
    fontStyle: 'italic',
  },

  sectionLabel: {
    ...typography.label,
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  itemCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  itemName: { ...typography.bodyMd, color: colors.ink, fontWeight: '600' },
  itemReason: { ...typography.bodySm, color: colors.inkSoft },
  eatAnywayBtn: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    marginTop: spacing.xs,
  },
  eatAnywayLabel: {
    ...typography.link,
    color: colors.primary,
  },

  disclaimer: {
    ...typography.bodySm,
    fontStyle: 'italic',
    color: colors.inkMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },

  sheetSafe: { flex: 1, backgroundColor: colors.surface },
  sheetBody: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  sheetEyebrow: { ...typography.label, color: colors.accentDark },
  sheetTitle: { ...typography.h1 },
  sheetAdvice: { ...typography.bodyMd, color: colors.ink },
  sheetFooter: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingBottom: spacing.lg,
  },
});
