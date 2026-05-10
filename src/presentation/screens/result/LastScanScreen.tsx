import { Image } from 'expo-image';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONDITIONS } from '@/config/constants';
import type { Scan, ScanType } from '@/domain/entities/Scan';
import { BackButton } from '@/presentation/components/BackButton';
import { DishSafetyCard } from '@/presentation/components/result/DishSafetyCard';
import { MealInsightCard } from '@/presentation/components/result/MealInsightCard';
import { SafeChip } from '@/presentation/components/result/SafeChip';
import { ScanItemCard } from '@/presentation/components/result/ScanItemCard';
import { SectionDivider } from '@/presentation/components/result/SectionDivider';
import { UnrecognisedScreen } from '@/presentation/screens/result/UnrecognisedScreen';
import { colors, opacity, spacing, typography } from '@/presentation/theme';
import { useScanStore } from '@/stores/scanStore';
import { useUserStore } from '@/stores/userStore';
import { splitItemsBySafety } from '@/utils/scanInsights';

interface LastScanScreenProps {
  onBack?: () => void;
  onEatAnyway: (itemId: string) => void;
  onScanAgain: () => void;
  onSeeIngredients?: () => void;
}

export function LastScanScreen({
  onBack,
  onEatAnyway,
  onScanAgain,
  onSeeIngredients,
}: LastScanScreenProps) {
  const scan = useScanStore((s) => s.current);
  const profile = useUserStore((s) => s.profile);

  if (!scan) {
    return <EmptyState />;
  }

  if (scan.scanType === 'unrecognised') {
    return (
      <UnrecognisedScreen
        onBack={onBack}
        onScanAgain={onScanAgain}
      />
    );
  }

  return (
    <MealView
      scan={scan}
      onBack={onBack}
      onEatAnyway={onEatAnyway}
      onSeeIngredients={onSeeIngredients}
      conditionsLabel={conditionsLabel(profile?.conditions, profile?.customConditions)}
    />
  );
}

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

const headerCopy = (scanType: ScanType): { line1: string; line2: string } => {
  switch (scanType) {
    case 'ingredients':
      return { line1: "Let's check", line2: "what's inside!" };
    case 'text':
      return { line1: "Here's the", line2: 'breakdown! ' };
    case 'meal':
    default:
      return { line1: "Here's what's", line2: 'on your plate! ' };
  }
};

const formatTimeStamp = (date: Date): string => {
  const time = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${time.toUpperCase()} · TODAY`;
};

interface MealViewProps {
  scan: Scan;
  conditionsLabel: string;
  onBack?: () => void;
  onEatAnyway: (itemId: string) => void;
  onSeeIngredients?: () => void;
}

function MealView({
  scan,
  conditionsLabel,
  onBack,
  onEatAnyway,
  onSeeIngredients,
}: MealViewProps) {
  const { safe, flagged } = splitItemsBySafety(scan.items);
  const header = headerCopy(scan.scanType);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResultHeader
          stamp={formatTimeStamp(scan.createdAt)}
          onBack={onBack}
          rightSlot={null}
        />

        <Text style={styles.title}>
          {header.line1}
          {'\n'}
          {header.line2}
        </Text>
        <Text style={styles.subtitle}>
          {scan.items.length} {scan.items.length === 1 ? 'item' : 'items'} · checked against{' '}
          <Text style={styles.subtitleStrong}>{conditionsLabel}</Text>
        </Text>

        <DishSafetyCard percent={scan.dishSafetyPct} />

        {scan.photoLocalUri && scan.scanType !== 'text' ? (
          <View style={styles.photoWrap}>
            <Image source={{ uri: scan.photoLocalUri }} style={styles.photo} contentFit="cover" />
          </View>
        ) : null}

        {onSeeIngredients ? (
          <Pressable
            onPress={onSeeIngredients}
            style={({ pressed }) => [
              styles.whatsInsideBtn,
              pressed && styles.btnPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="See ingredient breakdown"
          >
            <Text style={styles.whatsInsideLabel}>What&apos;s inside? →</Text>
          </Pressable>
        ) : null}

        {scan.insight ? <MealInsightCard text={scan.insight} /> : null}

        {scan.scanType !== 'ingredients' && safe.length > 0 ? (
          <>
            <SectionDivider label="Safe to enjoy" />
            <View style={styles.safeChipRow}>
              {safe.map((item) => (
                <SafeChip
                  key={item.id}
                  verdict={item.verdict === 'mostly_fine' ? 'mostly_fine' : 'all_good'}
                  label={item.name}
                />
              ))}
            </View>
          </>
        ) : null}

        {scan.scanType !== 'ingredients' && flagged.length > 0 ? (
          <>
            <SectionDivider label="Worth a closer look" />
            <View style={styles.flaggedList}>
              {flagged.map((item) => (
                <ScanItemCard
                  key={item.id}
                  item={item}
                  visited={scan.damageControlVisited.includes(item.id)}
                  onEatAnyway={onEatAnyway}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

interface ResultHeaderProps {
  stamp: string;
  onBack?: () => void;
  rightSlot: React.ReactNode;
}

function ResultHeader({ stamp, onBack, rightSlot }: ResultHeaderProps) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerSide}>
        {onBack ? (
          <BackButton onPress={onBack} variant="circle" label={null} />
        ) : null}
      </View>
      <Text style={styles.stamp}>{stamp}</Text>
      <View style={styles.headerSide}>{rightSlot}</View>
    </View>
  );
}

function EmptyState() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.emptyBody}>
        <Text style={styles.emptyTitle}>Last Scan</Text>
        <Text style={styles.emptyHint}>
          Your most recent scan result will appear here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

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
  headerSide: { width: 32, alignItems: 'flex-start', justifyContent: 'center' },
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
  photoWrap: {
    marginTop: spacing.sm,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.bg,
  },
  photo: { flex: 1, width: '100%', height: '100%' },
  safeChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
  },
  flaggedList: { gap: spacing.sm },
  ingredientList: {
    backgroundColor: colors.card,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  eatAnywayBtn: {
    marginTop: spacing.md,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 50,
    alignItems: 'center',
  },
  eatAnywayBtnLabel: {
    color: colors.primaryContrast,
    fontWeight: '600',
    fontSize: 13,
  },
  btnPressed: { opacity: opacity.pressedSoft },
  whatsInsideBtn: {
    marginTop: spacing.sm,
    backgroundColor: colors.cardAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 2,
    borderRadius: 50,
    alignItems: 'center',
  },
  whatsInsideLabel: {
    color: colors.ink,
    fontWeight: '600',
    fontSize: 13,
  },
  // Empty
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
