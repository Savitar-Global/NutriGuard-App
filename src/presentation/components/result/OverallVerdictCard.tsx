import { StyleSheet, Text, View } from 'react-native';

import { VERDICT_LABELS, type VerdictId } from '@/domain/entities/Verdict';
import { colors, radius, spacing, typography } from '@/presentation/theme';

interface OverallVerdictCardProps {
  verdict: VerdictId;
  insight: string;
}

const VERDICT_FG: Record<VerdictId, string> = {
  all_good: colors.verdict.allGood.fg,
  mostly_fine: colors.verdict.mostlyFine.fg,
  eat_less: colors.verdict.eatLess.fg,
  not_ideal: colors.verdict.notIdeal.fg,
  skip_it: colors.verdict.skipIt.fg,
};

export function OverallVerdictCard({ verdict, insight }: OverallVerdictCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Overall verdict</Text>
      <Text style={[styles.headline, { color: VERDICT_FG[verdict] }]}>
        {VERDICT_LABELS[verdict]} for you
      </Text>
      <Text style={styles.insight}>{insight}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardOrange,
    borderColor: '#F0D9A8',
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  label: typography.label,
  headline: {
    fontFamily: typography.h2.fontFamily,
    fontSize: 24,
    lineHeight: 28,
  },
  insight: { ...typography.body, fontSize: 14, lineHeight: 20 },
});
