import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ChevronRight } from '@/presentation/components/profile/ChevronRight';
import { colors, opacity, radius, sizes, spacing, typography } from '@/presentation/theme';

interface SettingsRowProps {
  label: string;
  onPress: () => void;
  isLast?: boolean;
}

export function SettingsRow({ label, onPress, isLast = false }: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.divider,
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={styles.label}>{label}</Text>
      <ChevronRight />
    </Pressable>
  );
}

interface SettingsListProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function SettingsList({ children, style }: SettingsListProps) {
  return <View style={[styles.list, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.card,
    borderWidth: sizes.borderInput,
    borderColor: colors.border,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
  },
  divider: {
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.borderLight,
  },
  pressed: { opacity: opacity.pressed },
  label: typography.settingsRow,
});
