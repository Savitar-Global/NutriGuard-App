import { StyleSheet, Switch, Text, View } from 'react-native';

import { Icon, type IconName } from '@/presentation/components/Icon';
import { colors, sizes, spacing, typography } from '@/presentation/theme';

interface SwitchRowProps {
  label: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  icon?: IconName;
  iconColor?: string;
  description?: string;
  isLast?: boolean;
  disabled?: boolean;
}

export function SwitchRow({
  label,
  value,
  onValueChange,
  icon,
  iconColor,
  description,
  isLast = false,
  disabled = false,
}: SwitchRowProps) {
  return (
    <View
      style={[styles.row, !isLast && styles.divider]}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
    >
      <View style={styles.leftGroup}>
        {icon ? (
          <View style={styles.iconWrap}>
            <Icon name={icon} size={20} color={iconColor ?? colors.ink} />
          </View>
        ) : null}
        <View style={styles.copy}>
          <Text style={styles.label}>{label}</Text>
          {description ? (
            <Text style={styles.description}>{description}</Text>
          ) : null}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.primaryContrast}
        ios_backgroundColor={colors.border}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md - 1,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
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
  copy: { flex: 1, gap: 2 },
  divider: {
    borderBottomWidth: sizes.hairline,
    borderBottomColor: colors.borderLight,
  },
  label: typography.settingsRow,
  description: {
    ...typography.bodySm,
    color: colors.inkMuted,
  },
});
