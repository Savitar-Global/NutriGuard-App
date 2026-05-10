import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/presentation/theme';

interface OnboardingHeroProps {
  eyebrow?: string;
  title: string;
  italicTail?: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function OnboardingHero({
  eyebrow,
  title,
  italicTail,
  subtitle,
  align = 'left',
}: OnboardingHeroProps) {
  const textAlign = align;
  return (
    <View style={[styles.wrap, align === 'center' && styles.center]}>
      {eyebrow ? (
        <Text style={[styles.eyebrow, { textAlign }]}>{eyebrow}</Text>
      ) : null}
      <Text style={[styles.title, { textAlign }]}>
        {title}
        {italicTail ? (
          <Text style={styles.italic}> {italicTail}</Text>
        ) : null}
      </Text>
      {subtitle ? (
        <Text style={[styles.subtitle, { textAlign }]}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm + 2 },
  center: { alignItems: 'stretch' },
  eyebrow: {
    ...typography.label,
    color: colors.accentDark,
  },
  title: typography.displayLg,
  italic: {
    ...typography.italic,
    color: colors.inkSoft,
  },
  subtitle: {
    ...typography.bodyMd,
    marginTop: spacing.xs,
  },
});
