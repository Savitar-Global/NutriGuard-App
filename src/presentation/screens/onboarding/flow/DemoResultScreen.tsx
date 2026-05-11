import { useMemo, useState } from 'react';
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
import { useDemoScanStore } from '@/stores/demoScanStore';
import type { VerdictId } from '@/domain/entities/Verdict';

interface DemoItem {
  name: string;
  verdict: VerdictId;
  reasoning: string;
  damageControl: string;
  flagged: boolean;
}

// Pizza-themed general fallback — used only when the live AI call fails.
const FALLBACK_ITEMS: ReadonlyArray<DemoItem> = [
  {
    name: 'Tomato sauce',
    verdict: 'all_good',
    reasoning: 'Cooked tomato — natural lycopene, low calorie.',
    damageControl: '',
    flagged: false,
  },
  {
    name: 'Cherry tomatoes & herbs',
    verdict: 'all_good',
    reasoning: 'Fresh produce — antioxidants, fibre, almost no calories.',
    damageControl: '',
    flagged: false,
  },
  {
    name: 'Melted cheese',
    verdict: 'mostly_fine',
    reasoning: 'Good protein and calcium, but high in fat and sodium.',
    damageControl: '',
    flagged: false,
  },
  {
    name: 'Pizza crust',
    verdict: 'eat_less',
    reasoning: 'Refined flour — spikes blood sugar and adds empty carbs.',
    damageControl:
      'Take a 15-minute walk after eating — it blunts the carb spike for hours. A side salad first slows absorption too.',
    flagged: true,
  },
  {
    name: 'Cured meat toppings',
    verdict: 'eat_less',
    reasoning: 'Processed meat — high sodium and saturated fat.',
    damageControl:
      'Drink an extra glass of water and add greens to balance the sodium load. Cap it at one slice with meat.',
    flagged: true,
  },
];

const FALLBACK_DISH_SAFETY_PCT = 58;
const FALLBACK_INSIGHT =
  'A balanced indulgence — fresh tomato and cheese pull their weight, but the crust and cured meats are where it tips. Smaller slices, a side salad, and water do most of the work.';

export function DemoResultScreen() {
  const { step, totalSteps, goNext, goBack, canGoBack } = useOnboardingNav();
  const scan = useDemoScanStore((s) => s.result);
  const status = useDemoScanStore((s) => s.status);

  const view = useMemo(() => buildView(scan, status), [scan, status]);

  const [activeDamage, setActiveDamage] = useState<DemoItem | null>(null);

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
          <Text style={styles.safetyPct}>{view.dishSafetyPct}%</Text>
          <View style={styles.safetyBar}>
            <View
              style={[styles.safetyFill, { width: `${view.dishSafetyPct}%` }]}
            />
          </View>
        </View>

        <View style={styles.insightCard}>
          <Text style={styles.insightLabel}>Insight</Text>
          <Text style={styles.insightBody}>{view.insight}</Text>
        </View>

        {view.safe.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Safe to enjoy</Text>
            {view.safe.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </>
        )}

        {view.flagged.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Worth a closer look</Text>
            {view.flagged.map((item) => (
              <ItemCard
                key={item.name}
                item={item}
                onEatAnyway={
                  item.damageControl
                    ? () => setActiveDamage(item)
                    : undefined
                }
              />
            ))}
          </>
        )}

        <Text style={styles.disclaimer}>
          Nutricare Ai gives general wellness info, not medical advice.
        </Text>
      </View>

      <Modal
        visible={activeDamage !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setActiveDamage(null)}
      >
        {activeDamage && (
          <DamageControlSheet
            item={activeDamage}
            onClose={() => setActiveDamage(null)}
          />
        )}
      </Modal>
    </OnboardingLayout>
  );
}

interface ViewModel {
  dishSafetyPct: number;
  insight: string;
  safe: DemoItem[];
  flagged: DemoItem[];
}

const buildView = (
  scan: ReturnType<typeof useDemoScanStore.getState>['result'],
  status: ReturnType<typeof useDemoScanStore.getState>['status'],
): ViewModel => {
  if (status === 'done' && scan && scan.items.length > 0) {
    const items: DemoItem[] = scan.items.map((it) => ({
      name: it.name,
      verdict: it.verdict,
      reasoning: it.reasoning,
      damageControl: it.damageControl,
      flagged: it.score <= 3,
    }));
    return {
      dishSafetyPct: scan.dishSafetyPct,
      insight: scan.insight,
      safe: items.filter((i) => !i.flagged),
      flagged: items.filter((i) => i.flagged),
    };
  }
  return {
    dishSafetyPct: FALLBACK_DISH_SAFETY_PCT,
    insight: FALLBACK_INSIGHT,
    safe: FALLBACK_ITEMS.filter((i) => !i.flagged),
    flagged: FALLBACK_ITEMS.filter((i) => i.flagged),
  };
};

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
  item: DemoItem;
  onClose: () => void;
}

function DamageControlSheet({ item, onClose }: DamageControlSheetProps) {
  return (
    <SafeAreaView style={styles.sheetSafe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.sheetBody}>
        <Text style={styles.sheetEyebrow}>Damage control</Text>
        <Text style={styles.sheetTitle}>{item.name}</Text>
        <Text style={styles.sheetAdvice}>{item.damageControl}</Text>
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
