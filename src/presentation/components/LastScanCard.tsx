import { Image } from 'expo-image';
import { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import type { VerdictId } from '@/domain/entities/Verdict';
import { Icon, type IconName } from '@/presentation/components/Icon';
import { VerdictChip } from '@/presentation/components/VerdictChip';
import {
  colors,
  opacity,
  radius,
  shadows,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';

interface LastScanCardProps {
  fallbackIcon: IconName;
  timeLabel: string;
  title: string;
  verdict: VerdictId;
  photoUri?: string | null;
  dishSafetyPct?: number | null;
  itemNames?: string[];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const MAX_VISIBLE_CHIPS = 3;

export function LastScanCard({
  fallbackIcon,
  timeLabel,
  title,
  verdict,
  photoUri,
  dishSafetyPct,
  itemNames = [],
  onPress,
  style,
}: LastScanCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(photoUri) && !imageFailed;

  const visibleChips = itemNames.slice(0, MAX_VISIBLE_CHIPS);
  const overflow = Math.max(0, itemNames.length - MAX_VISIBLE_CHIPS);

  const inner = (
    <>
      <View style={styles.topRow}>
        <View style={styles.thumb}>
          {showImage ? (
            <Image
              source={{ uri: photoUri! }}
              style={styles.thumbImage}
              contentFit="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <Icon name={fallbackIcon} size={28} color={colors.inkSoft} />
          )}
        </View>

        <View style={styles.copy}>
          <Text style={styles.timeLabel}>{timeLabel}</Text>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <View style={styles.metaRow}>
            <VerdictChip verdict={verdict} />
            {typeof dishSafetyPct === 'number' ? (
              <Text style={styles.safety}>{dishSafetyPct}% safe</Text>
            ) : null}
          </View>
        </View>
      </View>

      {visibleChips.length > 0 ? (
        <View style={styles.chipsRow}>
          {visibleChips.map((name) => (
            <View key={name} style={styles.chip}>
              <Text style={styles.chipText} numberOfLines={1}>
                {name}
              </Text>
            </View>
          ))}
          {overflow > 0 ? (
            <View style={styles.chipMuted}>
              <Text style={styles.chipMutedText}>+{overflow}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </>
  );

  if (!onPress) {
    return <View style={[styles.card, style]}>{inner}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Last scan: ${title}, ${timeLabel}`}
    >
      {inner}
    </Pressable>
  );
}

const THUMB_SIZE = 64;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: sizes.borderInput,
    borderColor: colors.border,
    borderRadius: radius.xl,
    padding: spacing.md + 1,
    gap: spacing.sm,
    ...shadows.sm,
  },
  pressed: { opacity: opacity.pressed },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.lg,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbImage: { width: '100%', height: '100%' },
  copy: { flex: 1, gap: spacing.xxs + 1 },
  timeLabel: typography.lastScanLabel,
  title: {
    ...typography.lastScanTitle,
    fontSize: 15,
    lineHeight: 19,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxs + 1,
  },
  safety: {
    ...typography.bodySm,
    color: colors.inkSoft,
    fontWeight: '600',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs + 2,
    paddingTop: spacing.xs,
  },
  chip: {
    backgroundColor: colors.cardAlt,
    borderColor: colors.borderLight,
    borderWidth: 1,
    paddingVertical: spacing.xxs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
    maxWidth: '60%',
  },
  chipText: {
    fontSize: 11,
    color: colors.inkSoft,
    fontWeight: '500',
  },
  chipMuted: {
    backgroundColor: 'transparent',
    borderColor: colors.borderInput,
    borderWidth: 1,
    paddingVertical: spacing.xxs + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  chipMutedText: {
    fontSize: 11,
    color: colors.inkMuted,
    fontWeight: '600',
  },
});
