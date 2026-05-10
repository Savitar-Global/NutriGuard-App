import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Icon, type IconName } from '@/presentation/components/Icon';
import {
  colors,
  opacity,
  radius,
  spacing,
  typography,
} from '@/presentation/theme';

export type ScanActionVariant = 'standard' | 'accent';

interface ScanActionRowProps {
  icon: IconName;
  title: string;
  description: string;
  variant?: ScanActionVariant;
  badge?: string;
  onPress: () => void;
}

export function ScanActionRow({
  icon,
  title,
  description,
  variant = 'standard',
  badge,
  onPress,
}: ScanActionRowProps) {
  const palette = PALETTES[variant];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: palette.bg, borderColor: palette.border },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
    >
      <View style={[styles.iconWrap, { backgroundColor: palette.iconBg }]}>
        <Icon name={icon} size={22} color={palette.icon} />
      </View>

      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: palette.title }]} numberOfLines={1}>
            {title}
          </Text>
          {badge ? (
            <View style={[styles.badge, { backgroundColor: palette.badgeBg }]}>
              <Text style={[styles.badgeText, { color: palette.badgeFg }]}>
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.desc, { color: palette.desc }]} numberOfLines={2}>
          {description}
        </Text>
      </View>

      <Svg width={8} height={14} viewBox="0 0 8 14" style={styles.chevron}>
        <Path
          d="M1 1l6 6-6 6"
          stroke={palette.chevron}
          strokeWidth={1.6}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}

interface Palette {
  bg: string;
  border: string;
  iconBg: string;
  icon: string;
  title: string;
  desc: string;
  chevron: string;
  badgeBg: string;
  badgeFg: string;
}

const PALETTES: Record<ScanActionVariant, Palette> = {
  standard: {
    bg: colors.onPrimary.surface,
    border: colors.onPrimary.border,
    iconBg: colors.onPrimary.surfaceElevated,
    icon: colors.onPrimary.text,
    title: colors.onPrimary.text,
    desc: colors.onPrimary.textSoft,
    chevron: colors.onPrimary.textSoft,
    badgeBg: colors.onPrimary.surfaceElevated,
    badgeFg: colors.onPrimary.text,
  },
  accent: {
    bg: colors.accentTint.surface,
    border: colors.accentTint.border,
    iconBg: colors.accentTint.surfaceElevated,
    icon: colors.onPrimary.text,
    title: colors.onPrimary.text,
    desc: colors.onPrimary.textSoft,
    chevron: colors.onPrimary.textSoft,
    badgeBg: colors.onPrimary.surfaceElevated,
    badgeFg: colors.onPrimary.text,
  },
};

const ICON_SIZE = 44;

const styles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 72,
  },
  pressed: { opacity: opacity.pressed },
  iconWrap: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: { flex: 1, gap: spacing.xxs + 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
  },
  title: {
    ...typography.scanTileTitle,
    fontSize: 15,
    lineHeight: 18,
  },
  desc: {
    ...typography.scanTileDesc,
    fontSize: 12,
    lineHeight: 16,
  },
  chevron: { flexShrink: 0 },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm - 2,
    borderRadius: radius.pill,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
});
