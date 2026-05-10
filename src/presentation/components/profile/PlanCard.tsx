import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { FREE_SCAN_LIMIT } from '@/config/constants';
import type { Plan } from '@/domain/entities/User';
import { colors, opacity, radius, spacing, typography } from '@/presentation/theme';

interface PlanCardProps {
  plan: Plan;
  lifetimePhotoScansUsed: number;
  renewsAt?: Date | null;
  onPressCta?: () => void;
  style?: StyleProp<ViewStyle>;
}

export function PlanCard({
  plan,
  lifetimePhotoScansUsed,
  renewsAt,
  onPressCta,
  style,
}: PlanCardProps) {
  const variant = plan === 'pro' ? styles.cardPro : styles.cardFree;

  return (
    <View style={[styles.card, variant, style]}>
      {plan === 'pro' ? (
        <ProContent renewsAt={renewsAt ?? null} />
      ) : (
        <FreeContent lifetimePhotoScansUsed={lifetimePhotoScansUsed} />
      )}
      <CtaPill
        label={plan === 'pro' ? 'Manage' : 'Upgrade'}
        tone={plan === 'pro' ? 'amber' : 'primary'}
        onPress={onPressCta}
      />
    </View>
  );
}

interface ProContentProps {
  renewsAt: Date | null;
}

function ProContent({ renewsAt }: ProContentProps) {
  const renewsLabel = renewsAt
    ? `Renews ${renewsAt.toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      })}`
    : 'Active subscription';

  return (
    <View style={styles.copy}>
      <Text style={[typography.planLabel, styles.proLabel]}>✨ Pro · Annual</Text>
      <Text style={[typography.planHeading, styles.proHeading]}>{renewsLabel}</Text>
      <Text style={[typography.planSub, styles.proSub]}>Unlimited scans</Text>
    </View>
  );
}

interface FreeContentProps {
  lifetimePhotoScansUsed: number;
}

function FreeContent({ lifetimePhotoScansUsed }: FreeContentProps) {
  const remaining = Math.max(0, FREE_SCAN_LIMIT - lifetimePhotoScansUsed);
  const sub =
    remaining > 0
      ? 'Type-It-In stays unlimited · upgrade for more photos'
      : 'Out of photo scans · upgrade for unlimited';

  return (
    <View style={styles.copy}>
      <Text style={[typography.planLabel, styles.freeLabel]}>Free plan</Text>
      <Text style={[typography.planHeading, styles.freeHeading]}>
        {lifetimePhotoScansUsed} of {FREE_SCAN_LIMIT} photo scans used
      </Text>
      <Text style={[typography.planSub, styles.freeSub]}>{sub}</Text>
    </View>
  );
}

interface CtaPillProps {
  label: string;
  tone: 'amber' | 'primary';
  onPress?: () => void;
}

function CtaPill({ label, tone, onPress }: CtaPillProps) {
  const pillStyle = tone === 'amber' ? styles.pillAmber : styles.pillPrimary;
  const textStyle = tone === 'amber' ? styles.pillAmberText : styles.pillPrimaryText;

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.pill,
        pillStyle,
        pressed && onPress && styles.pillPressed,
      ]}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
    >
      <Text style={[typography.planCta, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    borderRadius: radius.xl,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderWidth: 1,
  },
  cardPro: {
    backgroundColor: colors.cardAmber,
    borderColor: colors.accentBorder,
  },
  cardFree: {
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
  },
  copy: { flex: 1, gap: spacing.xs },

  proLabel: { color: colors.accentDark },
  proHeading: { color: colors.accentInk },
  proSub: { color: colors.accentInkSoft },

  freeLabel: { color: colors.inkMuted },
  freeHeading: { color: colors.ink },
  freeSub: { color: colors.inkSoft },

  pill: {
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    alignSelf: 'center',
  },
  pillAmber: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  pillAmberText: { color: colors.accentDark },
  pillPrimary: {
    backgroundColor: colors.primary,
  },
  pillPrimaryText: { color: colors.primaryContrast },
  pillPressed: { opacity: opacity.pressed },
});
