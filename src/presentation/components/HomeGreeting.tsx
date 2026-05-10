import { format } from 'date-fns';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/presentation/theme';

interface HomeGreetingProps {
  displayName: string | null;
}

const FALLBACK_NAME = 'there';

const firstNameOf = (full: string | null): string => {
  const trimmed = full?.trim();
  if (!trimmed) return FALLBACK_NAME;
  return trimmed.split(/\s+/)[0] ?? FALLBACK_NAME;
};

export function HomeGreeting({ displayName }: HomeGreetingProps) {
  const formattedDate = useMemo(() => format(new Date(), 'EEEE, MMMM d'), []);
  const firstName = firstNameOf(displayName);

  return (
    <View>
      <Text style={styles.date}>{formattedDate}</Text>
      <Text style={styles.greeting}>Hi, {firstName}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    ...typography.bodySm,
    color: colors.inkMuted,
  },
  greeting: {
    ...typography.greeting,
    marginTop: spacing.xxs,
  },
});
