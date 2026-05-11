import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Icon, type IconName } from '@/presentation/components/Icon';
import { ChevronRight } from '@/presentation/components/profile/ChevronRight';
import { colors, opacity, radius, sizes, spacing, typography } from '@/presentation/theme';

interface SettingsRowProps {
  label: string;
  onPress: () => void;
  icon?: IconName;
  iconColor?: string;
  destructive?: boolean;
  isLast?: boolean;
}

export function SettingsRow({
  label,
  onPress,
  icon,
  iconColor,
  destructive = false,
  isLast = false,
}: SettingsRowProps) {
  const resolvedIconColor = iconColor ?? (destructive ? colors.danger : colors.ink);
  const labelStyle = destructive ? [styles.label, styles.labelDestructive] : styles.label;

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
      <View style={styles.leftGroup}>
        {icon ? (
          <View style={styles.iconWrap}>
            <Icon name={icon} size={20} color={resolvedIconColor} />
          </View>
        ) : null}
        <Text style={labelStyle}>{label}</Text>
      </View>
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
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconWrap: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.borderLight,
  },
  pressed: { opacity: opacity.pressed },
  label: typography.settingsRow,
  labelDestructive: { color: colors.danger },
});
