import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { VERDICT_LABELS, type VerdictId } from '@/domain/entities/Verdict';
import { BackButton } from '@/presentation/components/BackButton';
import { colors, opacity, radius, spacing, typography } from '@/presentation/theme';
import { useScanStore } from '@/stores/scanStore';
import { flaggedItems } from '@/utils/scanInsights';

interface DamageControlScreenProps {
  startItemId: string;
  onClose: () => void;
}

const VERDICT_FG: Record<VerdictId, string> = {
  all_good: colors.verdict.allGood.fg,
  mostly_fine: colors.verdict.mostlyFine.fg,
  eat_less: colors.verdict.eatLess.fg,
  not_ideal: colors.verdict.notIdeal.fg,
  skip_it: colors.verdict.skipIt.fg,
};

const VERDICT_BG: Record<VerdictId, string> = {
  all_good: colors.verdict.allGood.bg,
  mostly_fine: colors.verdict.mostlyFine.bg,
  eat_less: colors.verdict.eatLess.bg,
  not_ideal: colors.verdict.notIdeal.bg,
  skip_it: colors.verdict.skipIt.bg,
};

export function DamageControlScreen({ startItemId, onClose }: DamageControlScreenProps) {
  const scan = useScanStore((s) => s.current);
  const markVisited = useScanStore((s) => s.markDamageControlVisited);

  const flagged = useMemo(() => (scan ? flaggedItems(scan) : []), [scan]);

  const startIndex = Math.max(
    0,
    flagged.findIndex((it) => it.id === startItemId),
  );

  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // If the user opens DamageControl from a different flagged item, sync the cursor.
  useEffect(() => {
    setCurrentIndex(startIndex);
  }, [startIndex]);

  const item = flagged[currentIndex];

  // Mark visited so the LastScanScreen relabels "Eat anyway" → "See damage control".
  useEffect(() => {
    if (item) markVisited(item.id);
  }, [item, markVisited]);

  if (!scan || !item) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.headerRow}>
          <BackButton onPress={onClose} variant="circle" label={null} />
        </View>
        <View style={styles.empty}>
          <Text style={typography.h2}>No flagged items</Text>
        </View>
      </SafeAreaView>
    );
  }

  const total = flagged.length;
  const positionLabel = `Item ${currentIndex + 1} of ${total}`;
  const hasNext = currentIndex < total - 1;

  const handleNext = () => {
    if (!hasNext) return;
    setCurrentIndex(currentIndex + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <BackButton onPress={onClose} variant="circle" label={null} />
          <Text style={styles.position}>{positionLabel}</Text>
          <Pressable
            onPress={hasNext ? handleNext : undefined}
            disabled={!hasNext}
            style={({ pressed }) => [
              styles.nextWrap,
              pressed && hasNext && { opacity: opacity.pressedSoft },
            ]}
            accessibilityRole="button"
          >
            <Text style={[styles.nextLabel, !hasNext && styles.nextDisabled]}>
              Next →
            </Text>
          </Pressable>
        </View>

        <View style={styles.topBlock}>
          <Text style={styles.eyebrow}>Eat anyway?</Text>
          <Text style={styles.title}>{item.name}</Text>

          <View style={styles.metaRow}>
            <View
              style={[
                styles.verdictChip,
                { backgroundColor: VERDICT_BG[item.verdict] },
              ]}
            >
              <Text
                style={[styles.verdictText, { color: VERDICT_FG[item.verdict] }]}
              >
                {VERDICT_LABELS[item.verdict]}
              </Text>
            </View>
            <Text style={styles.scoreText}>{item.score} / 5 for your conditions</Text>
          </View>
        </View>

        <View style={styles.adviceCard}>
          <View style={styles.adviceHeader}>
            <StarIcon />
            <Text style={styles.adviceLabel}>Damage control</Text>
          </View>
          <Text style={styles.adviceText}>
            {item.damageControl ||
              'No specific tips for this one — keep portions small and pair with water.'}
          </Text>
        </View>

        <View style={styles.spacer} />

        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: opacity.pressedSoft },
          ]}
          accessibilityRole="button"
        >
          <Text style={styles.backBtnLabel}>← Back to results</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Not medical advice. Always consult your healthcare provider before changing your diet.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StarIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path
        d="M7 1L8.5 5.5H13L9.5 8.5l1.5 4.5L7 10.5 3 13l1.5-4.5L1 5.5h4.5Z"
        fill={colors.accent}
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg + 2,
    paddingBottom: spacing.lg,
  },
  topBlock: {
    marginTop: spacing.sm,
  },
  spacer: { flex: 1, minHeight: spacing['2xl'] },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.md,
  },
  position: {
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nextWrap: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
  nextLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
  },
  nextDisabled: { color: colors.inkMuted },
  eyebrow: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.h1,
    fontSize: 30,
    lineHeight: 34,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  verdictChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  verdictText: { fontSize: 11, fontWeight: '600', lineHeight: 13 },
  scoreText: {
    ...typography.bodyXs,
  },
  adviceCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  adviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    marginBottom: spacing.sm,
  },
  adviceLabel: {
    ...typography.label,
    color: 'rgba(255,255,255,0.6)',
  },
  adviceText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.92)',
  },
  backBtn: {
    borderWidth: 1,
    borderColor: colors.borderInput,
    borderRadius: 50,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  backBtnLabel: {
    fontSize: 13,
    color: colors.inkChevron,
    fontWeight: '500',
  },
  disclaimer: {
    fontSize: 10,
    color: colors.inkMuted,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 14,
    marginTop: spacing.sm,
  },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
