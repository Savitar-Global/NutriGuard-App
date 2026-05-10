import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { ChevronRight } from '@/presentation/components/profile/ChevronRight';
import { colors, opacity, radius, sizes, spacing, typography } from '@/presentation/theme';

interface AddConditionRowProps {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export function AddConditionRow({ onPress, style }: AddConditionRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed, style]}
      accessibilityRole="button"
      accessibilityLabel="Add another condition"
    >
      <View style={styles.icon}>
        <Svg width={12} height={12} viewBox="0 0 10 10">
          <Path
            d="M5 2v6M2 5h6"
            stroke={colors.primaryContrast}
            strokeWidth={1.5}
            strokeLinecap="round"
          />
        </Svg>
      </View>
      <View style={styles.copy}>
        <Text style={typography.addConditionTitle}>Add another condition</Text>
        <Text style={styles.sub}>Thyroid, IBS, PCOS and more…</Text>
      </View>
      <ChevronRight />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderDashed,
    borderStyle: 'dashed',
    borderRadius: radius.lg,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.md + 2,
  },
  pressed: { opacity: opacity.pressed },
  icon: {
    width: sizes.addConditionIcon,
    height: sizes.addConditionIcon,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  copy: { flex: 1, gap: spacing.xxs },
  sub: typography.addConditionSub,
});
