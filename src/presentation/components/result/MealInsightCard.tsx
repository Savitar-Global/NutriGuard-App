import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/presentation/components/Icon';
import { colors, radius, spacing, typography } from '@/presentation/theme';

interface MealInsightCardProps {
  text: string;
}

export function MealInsightCard({ text }: MealInsightCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Icon name="bulb" size={20} color={colors.accentDark} />
      </View>
      <View style={styles.body}>
        <Text style={styles.label}>Meal insight</Text>
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardAmber,
    borderColor: colors.accentBorder,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm + 2,
  },
  iconWrap: { paddingTop: 1 },
  body: { flex: 1, gap: spacing.xxs },
  label: {
    ...typography.label,
    color: colors.accentDark,
  },
  text: { ...typography.body, fontSize: 14, lineHeight: 20 },
});
