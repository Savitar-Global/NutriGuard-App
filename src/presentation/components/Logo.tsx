import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { colors, sizes, spacing, typography } from '@/presentation/theme';

interface LogoProps {
  size?: number;
  showWordmark?: boolean;
  variant?: 'inline' | 'stacked';
}

export function Logo({
  size,
  showWordmark = true,
  variant = 'inline',
}: LogoProps) {
  const stacked = variant === 'stacked';
  const markSize = size ?? (stacked ? 110 : sizes.logoBox);

  return (
    <View style={stacked ? styles.col : styles.row}>
      <Image
        source={require('../../../assets/onboard.png')}
        style={{ width: markSize, height: markSize }}
        contentFit="contain"
        accessibilityLabel="Nutricare Ai logo"
      />
      {showWordmark && (
        <Text style={stacked ? styles.wordmarkStacked : styles.wordmark}>
          Nutricare Ai
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  col: { alignItems: 'center', gap: spacing.sm },
  wordmark: typography.wordmark,
  wordmarkStacked: {
    ...typography.h1,
    fontSize: 24,
    lineHeight: 28,
    color: colors.ink,
    letterSpacing: -0.3,
  },
});
