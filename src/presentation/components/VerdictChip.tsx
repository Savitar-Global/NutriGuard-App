import { StyleSheet, Text, View } from 'react-native';

import { VERDICT_LABELS, type VerdictId } from '@/domain/entities/Verdict';
import { colors, radius, spacing, typography } from '@/presentation/theme';

const PALETTE: Record<VerdictId, { bg: string; fg: string }> = {
  all_good: colors.verdict.allGood,
  mostly_fine: colors.verdict.mostlyFine,
  eat_less: colors.verdict.eatLess,
  not_ideal: colors.verdict.notIdeal,
  skip_it: colors.verdict.skipIt,
};

interface VerdictChipProps {
  verdict: VerdictId;
}

export function VerdictChip({ verdict }: VerdictChipProps) {
  const palette = PALETTE[verdict];
  return (
    <View style={[styles.chip, { backgroundColor: palette.bg }]}>
      <Text style={[styles.label, { color: palette.fg }]}>
        {VERDICT_LABELS[verdict]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md - 2,
    borderRadius: radius.pill,
  },
  label: {
    ...typography.chipLabel,
  },
});
