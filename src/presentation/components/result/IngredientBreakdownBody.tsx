import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ScanItem } from '@/domain/entities/Scan';
import { IngredientRow } from '@/presentation/components/result/IngredientRow';
import { OverallVerdictCard } from '@/presentation/components/result/OverallVerdictCard';
import { SectionDivider } from '@/presentation/components/result/SectionDivider';
import { colors, opacity, radius, spacing, typography } from '@/presentation/theme';
import { overallVerdict } from '@/utils/scanInsights';

interface IngredientBreakdownBodyProps {
  items: ScanItem[];
  insight: string | null;
  onEatAnyway?: (itemId: string) => void;
  sectionLabel?: string;
}

export function IngredientBreakdownBody({
  items,
  insight,
  onEatAnyway,
  sectionLabel = 'Ingredient breakdown',
}: IngredientBreakdownBodyProps) {
  const verdict = overallVerdict(items);
  const firstFlagged = items.find(
    (it) => it.verdict !== 'all_good' && it.verdict !== 'mostly_fine',
  );

  return (
    <>
      <OverallVerdictCard verdict={verdict} insight={insight ?? ''} />

      <SectionDivider label={sectionLabel} />

      <View style={styles.list}>
        {items.map((item, i) => (
          <IngredientRow
            key={item.id}
            name={item.name}
            verdict={item.verdict}
            isLast={i === items.length - 1}
          />
        ))}
      </View>

      {firstFlagged && onEatAnyway ? (
        <Pressable
          onPress={() => onEatAnyway(firstFlagged.id)}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.ctaLabel}>Eat anyway →</Text>
        </Pressable>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cta: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 50,
    alignItems: 'center',
  },
  ctaLabel: {
    color: colors.primaryContrast,
    fontWeight: '600',
    fontSize: 13,
  },
  pressed: { opacity: opacity.pressedSoft },
});
