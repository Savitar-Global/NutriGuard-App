import { StyleSheet, Text, View } from 'react-native';

import { VERDICT_LABELS, type VerdictId } from '@/domain/entities/Verdict';
import { colors, radius, spacing, typography } from '@/presentation/theme';

interface IngredientRowProps {
  name: string;
  verdict: VerdictId;
  isLast?: boolean;
}

const PALETTE: Record<VerdictId, { bg: string; fg: string }> = {
  all_good: colors.verdict.allGood,
  mostly_fine: colors.verdict.mostlyFine,
  eat_less: colors.verdict.eatLess,
  not_ideal: colors.verdict.notIdeal,
  skip_it: colors.verdict.skipIt,
};

export function IngredientRow({ name, verdict, isLast = false }: IngredientRowProps) {
  const palette = PALETTE[verdict];
  return (
    <View style={[styles.row, !isLast && styles.divider]}>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
      <View style={[styles.chip, { backgroundColor: palette.bg }]}>
        <Text style={[styles.chipText, { color: palette.fg }]}>
          {VERDICT_LABELS[verdict]}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm + 2,
    paddingVertical: spacing.md,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  name: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  chipText: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
});
