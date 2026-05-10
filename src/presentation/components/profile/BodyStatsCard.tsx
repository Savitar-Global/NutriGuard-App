import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { PencilIcon } from '@/presentation/components/profile/PencilIcon';
import { colors, opacity, radius, sizes, spacing, typography } from '@/presentation/theme';
import {
  formatHeight,
  formatWeight,
  type HeightUnit,
  type WeightUnit,
} from '@/utils/units';

export type BodyStatField = 'weight' | 'height' | 'age';

interface BodyStatsCardProps {
  weightKg: number;
  heightCm: number;
  ageYears: number;
  weightUnit: WeightUnit;
  heightUnit: HeightUnit;
  onEdit: (field: BodyStatField) => void;
  style?: StyleProp<ViewStyle>;
}

export function BodyStatsCard({
  weightKg,
  heightCm,
  ageYears,
  weightUnit,
  heightUnit,
  onEdit,
  style,
}: BodyStatsCardProps) {
  const weight = formatWeight(weightKg, weightUnit);
  const height = formatHeight(heightCm, heightUnit);

  return (
    <View style={[styles.card, style]}>
      <Stat
        label="Weight"
        valueText={weight.text}
        unit={weight.unit}
        placeholder="Add"
        onPress={() => onEdit('weight')}
      />
      <Divider />
      <Stat
        label="Height"
        valueText={height.text}
        unit={height.unit}
        placeholder="Add"
        onPress={() => onEdit('height')}
      />
      <Divider />
      <Stat
        label="Age"
        valueText={ageYears > 0 ? String(ageYears) : ''}
        unit="yrs"
        placeholder="Add"
        onPress={() => onEdit('age')}
      />
    </View>
  );
}

interface StatProps {
  label: string;
  valueText: string;
  unit: string;
  placeholder: string;
  onPress: () => void;
}

function Stat({ label, valueText, unit, placeholder, onPress }: StatProps) {
  const hasValue = valueText.length > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cell, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Edit ${label.toLowerCase()}`}
    >
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <PencilIcon size={11} color={colors.inkMuted} />
      </View>
      {hasValue ? (
        <Text style={styles.value} numberOfLines={1}>
          {valueText}
          {unit ? <Text style={styles.unit}> {unit}</Text> : null}
        </Text>
      ) : (
        <Text style={styles.placeholder}>{placeholder}</Text>
      )}
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderWidth: sizes.borderInput,
    borderColor: colors.border,
    borderRadius: radius.xl,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  pressed: { opacity: opacity.pressed },
  divider: {
    width: sizes.hairline,
    alignSelf: 'stretch',
    backgroundColor: colors.borderLight,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: typography.statLabel,
  value: typography.statValue,
  unit: typography.statUnit,
  placeholder: {
    ...typography.statValue,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
});
