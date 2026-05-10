import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ScanItem } from '@/domain/entities/Scan';
import { VERDICT_LABELS, type VerdictId } from '@/domain/entities/Verdict';
import { colors, opacity, radius, spacing, typography } from '@/presentation/theme';

interface ScanItemCardProps {
  item: ScanItem;
  visited: boolean;
  onEatAnyway: (itemId: string) => void;
}

const SCORE_BADGE: Record<VerdictId, { bg: string; fg: string }> = {
  all_good: colors.verdict.allGood,
  mostly_fine: colors.verdict.mostlyFine,
  eat_less: colors.verdict.eatLess,
  not_ideal: colors.verdict.notIdeal,
  skip_it: colors.verdict.skipIt,
};

export function ScanItemCard({ item, visited, onEatAnyway }: ScanItemCardProps) {
  const palette = SCORE_BADGE[item.verdict];

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.scoreBubble, { backgroundColor: palette.bg }]}>
          <Text style={[styles.scoreText, { color: palette.fg }]}>{item.score}</Text>
        </View>
        <View style={styles.headerBody}>
          <Text style={styles.name}>{item.name}</Text>
          <View style={[styles.verdictChip, { backgroundColor: palette.bg }]}>
            <Text style={[styles.verdictText, { color: palette.fg }]}>
              {VERDICT_LABELS[item.verdict]}
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.reasoning}>{item.reasoning}</Text>

      <Pressable
        onPress={() => onEatAnyway(item.id)}
        style={({ pressed }) => [
          styles.cta,
          pressed && styles.ctaPressed,
        ]}
        accessibilityRole="button"
      >
        <Text style={styles.ctaLabel}>
          {visited ? 'See damage control →' : 'Eat anyway →'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    gap: spacing.sm + 2,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm + 2 },
  scoreBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: { fontSize: 16, fontWeight: '700' },
  headerBody: { flex: 1, gap: spacing.xxs },
  name: { fontSize: 15, fontWeight: '600', color: colors.ink },
  verdictChip: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  verdictText: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
  reasoning: { ...typography.body, fontSize: 13, lineHeight: 19, paddingLeft: 48 },
  cta: {
    borderColor: colors.borderInput,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  ctaPressed: { opacity: opacity.pressedSoft },
  ctaLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.inkChevron,
  },
});
