import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import type { VerdictId } from '@/domain/entities/Verdict';
import { colors, radius, spacing, typography } from '@/presentation/theme';

const PALETTE: Record<VerdictId, { bg: string; fg: string }> = {
  all_good: colors.verdict.allGood,
  mostly_fine: colors.verdict.mostlyFine,
  eat_less: colors.verdict.eatLess,
  not_ideal: colors.verdict.notIdeal,
  skip_it: colors.verdict.skipIt,
};

interface SafeChipProps {
  verdict: 'all_good' | 'mostly_fine';
  label: string;
}

export function SafeChip({ verdict, label }: SafeChipProps) {
  const palette = PALETTE[verdict];
  return (
    <View style={[styles.chip, { backgroundColor: palette.bg }]}>
      <Svg width={9} height={7} viewBox="0 0 9 7">
        <Path
          d="M1 3.5L3.5 6 8 1"
          stroke={palette.fg}
          strokeWidth={1.3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
      <Text style={[styles.label, { color: palette.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
  },
  label: { ...typography.chipLabel, fontSize: 13, lineHeight: 16 },
});
