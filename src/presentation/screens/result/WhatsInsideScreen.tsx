import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONDITIONS } from '@/config/constants';
import { BackButton } from '@/presentation/components/BackButton';
import { IngredientBreakdownBody } from '@/presentation/components/result/IngredientBreakdownBody';
import { colors, spacing, typography } from '@/presentation/theme';
import { useScanStore } from '@/stores/scanStore';
import { useUserStore } from '@/stores/userStore';

interface WhatsInsideScreenProps {
  onBack: () => void;
  onEatAnyway: (itemId: string) => void;
}

export function WhatsInsideScreen({ onBack, onEatAnyway }: WhatsInsideScreenProps) {
  const scan = useScanStore((s) => s.current);
  const profile = useUserStore((s) => s.profile);

  if (!scan || scan.items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.headerRow}>
          <BackButton onPress={onBack} variant="circle" label={null} />
          <View style={styles.headerSide} />
        </View>
        <View style={styles.emptyBody}>
          <Text style={styles.emptyTitle}>Nothing to break down yet</Text>
          <Text style={styles.emptyHint}>
            Run a scan first — we&apos;ll list every ingredient here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const conditions = conditionsLabel(profile?.conditions, profile?.customConditions);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <BackButton onPress={onBack} variant="circle" label={null} />
          <Text style={styles.stamp}>WHAT&apos;S INSIDE</Text>
          <View style={styles.headerSide} />
        </View>

        <Text style={styles.title}>
          Let&apos;s check{'\n'}
          what&apos;s inside 
        </Text>
        <Text style={styles.subtitle}>
          {subtitleText(scan.items.length, scan.productName)} · checked against{' '}
          <Text style={styles.subtitleStrong}>{conditions}</Text>
        </Text>

        <IngredientBreakdownBody
          items={scan.items}
          insight={scan.insight}
          onEatAnyway={onEatAnyway}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const subtitleText = (count: number, productName: string | null): string => {
  const head = productName ?? `${count} ${count === 1 ? 'item' : 'items'}`;
  return productName ? `${head} · ${count} ingredients read` : head;
};

const conditionsLabel = (
  ids: string[] | undefined,
  custom: string[] | undefined,
): string => {
  const presets = (ids ?? [])
    .map((id) => CONDITIONS.find((c) => c.id === id)?.label)
    .filter((v): v is string => Boolean(v));
  const all = [...presets, ...(custom ?? [])];
  if (all.length === 0) return 'general healthy eating';
  if (all.length === 1) return all[0]!;
  if (all.length === 2) return `${all[0]} & ${all[1]}`;
  return `${all.slice(0, -1).join(', ')} & ${all[all.length - 1]}`;
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg + 2,
    paddingBottom: spacing['2xl'],
    gap: spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: spacing.sm,
  },
  headerSide: { width: 32 },
  stamp: {
    fontSize: 10,
    color: colors.inkMuted,
    letterSpacing: 0.8,
  },
  title: {
    ...typography.h2,
    fontSize: 26,
    lineHeight: 30,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm + 2,
  },
  subtitleStrong: { color: colors.ink, fontWeight: '700' },
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    gap: spacing.sm,
  },
  emptyTitle: typography.h2,
  emptyHint: { ...typography.bodyMd, textAlign: 'center' },
});
