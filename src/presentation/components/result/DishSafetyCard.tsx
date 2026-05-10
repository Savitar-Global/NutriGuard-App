import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/presentation/theme';

interface DishSafetyCardProps {
  percent: number;
}

export function DishSafetyCard({ percent }: DishSafetyCardProps) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.label}>Dish safety</Text>
        <Text style={styles.value}>{percent}%</Text>
      </View>
      <Text style={styles.caption}>safe for your{'\n'}conditions</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    ...typography.label,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: spacing.xs,
  },
  value: {
    fontFamily: typography.h1.fontFamily,
    fontSize: 36,
    fontWeight: '700',
    lineHeight: 38,
    color: colors.accent,
  },
  caption: {
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.78)',
    textAlign: 'right',
  },
});
