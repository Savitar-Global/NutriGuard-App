import { StyleSheet, Text, View } from 'react-native';

import { colors, sizes, spacing, typography } from '@/presentation/theme';

interface DividerProps {
  label?: string;
}

export function Divider({ label }: DividerProps) {
  return (
    <View style={styles.row}>
      <View style={styles.line} />
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth || sizes.hairline,
    backgroundColor: colors.divider,
  },
  label: typography.label,
});
