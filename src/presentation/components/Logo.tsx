import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, sizes, spacing, typography } from '@/presentation/theme';

interface LogoProps {
  showWordmark?: boolean;
}

export function Logo({ showWordmark = true }: LogoProps) {
  return (
    <View style={styles.row}>
      <View style={styles.box}>
        <Text style={styles.glyph}>🌿</Text>
      </View>
      {showWordmark && <Text style={styles.wordmark}>NutriGuard</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  box: {
    width: sizes.logoBox,
    height: sizes.logoBox,
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyph: { fontSize: sizes.iconSm },
  wordmark: typography.wordmark,
});
