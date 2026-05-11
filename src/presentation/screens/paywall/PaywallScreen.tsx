import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LEGAL_URLS, PRODUCT_IDS } from '@/config/constants';
import type { RcPackage } from '@/data/services/revenuecat';
import { Icon } from '@/presentation/components/Icon';
import type { RootStackParamList } from '@/presentation/navigation/RootNavigator';
import {
  colors,
  opacity,
  radius,
  sizes,
  spacing,
  typography,
} from '@/presentation/theme';
import { useEntitlementStore } from '@/stores/entitlementStore';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Paywall'>;

type PackageType = 'monthly' | 'annual';

/**
 * Pre-auth & post-auth paywall, presented as a root-level modal.
 * Layout adapted from mock 13 — Annual highlighted by default with a
 * "SAVE %" badge, monthly tile on the left.
 */
export function PaywallScreen() {
  const navigation = useNavigation<Nav>();

  const offering = useEntitlementStore((s) => s.offering);
  const isLoadingOffering = useEntitlementStore((s) => s.isLoadingOffering);
  const isPurchasing = useEntitlementStore((s) => s.isPurchasing);
  const isRestoring = useEntitlementStore((s) => s.isRestoring);
  const purchase = useEntitlementStore((s) => s.purchase);
  const restore = useEntitlementStore((s) => s.restore);
  const refreshOffering = useEntitlementStore((s) => s.refreshOffering);
  const error = useEntitlementStore((s) => s.error);
  const clearError = useEntitlementStore((s) => s.clearError);
  const isPro = useEntitlementStore((s) => s.isPro);
  const entitlement = useEntitlementStore((s) => s.entitlement);

  // Plan currently owned by the user, if any. Derived once per render from
  // the entitlement's product identifier so the picker can mark it.
  const currentPlan: PackageType | null = useMemo(() => {
    if (entitlement.productIdentifier === PRODUCT_IDS.annual) return 'annual';
    if (entitlement.productIdentifier === PRODUCT_IDS.monthly) return 'monthly';
    return null;
  }, [entitlement.productIdentifier]);

  // Snapshot of whether the user was Pro at mount time. Used to:
  //   1. Skip the new-purchase auto-dismiss effect (isPro stays true throughout
  //      a change-plan flow, so we need an explicit dismiss after `purchase`).
  //   2. Switch CTA copy from "Start with" → "Switch to" and disable the
  //      current plan tile in the picker.
  const wasInitiallyProRef = useRef(isPro && currentPlan !== null);
  const isChangePlanMode = wasInitiallyProRef.current;

  // In change-plan mode, default-select the plan the user is NOT on.
  // Otherwise default to Annual (matches the highlighted tile in the mock).
  const [selected, setSelected] = useState<PackageType>(() => {
    if (isChangePlanMode && currentPlan === 'annual') return 'monthly';
    if (isChangePlanMode && currentPlan === 'monthly') return 'annual';
    return 'annual';
  });

  useEffect(() => {
    if (!offering && !isLoadingOffering) {
      void refreshOffering();
    }
  }, [offering, isLoadingOffering, refreshOffering]);

  // Auto-dismiss when the user becomes Pro during this screen's lifetime
  // (a fresh purchase). Skipped in change-plan mode, where `isPro` stays
  // true the whole time — that path dismisses explicitly in `onSubscribe`.
  useEffect(() => {
    if (isPro && !wasInitiallyProRef.current) {
      navigation.goBack();
    }
  }, [isPro, navigation]);

  useEffect(() => {
    if (!error) return;
    if (error.code === 'PURCHASE_CANCELLED') {
      clearError();
      return;
    }
    Alert.alert(
      error.code === 'PURCHASE_FAILED' ? 'Purchase failed' : 'Something went wrong',
      error.message,
      [{ text: 'OK', onPress: clearError }],
    );
  }, [error, clearError]);

  const monthly = offering?.monthly ?? null;
  const annual = offering?.annual ?? null;

  const savings = useMemo(() => computeSavingsPct(monthly, annual), [monthly, annual]);
  const selectedPkg: RcPackage | null = selected === 'annual' ? annual : monthly;

  const onSubscribe = async () => {
    if (!selectedPkg) return;
    const ok = await purchase(selectedPkg);
    if (ok && isChangePlanMode) {
      // isPro didn't transition, so the auto-dismiss effect won't fire —
      // dismiss explicitly so the user lands back on the Manage screen.
      navigation.goBack();
    }
  };

  const onRestore = async () => {
    const restored = await restore();
    if (!restored) {
      Alert.alert(
        'No active subscription',
        'We couldn’t find an active subscription on this Apple ID.',
      );
    }
  };

  const verb = isChangePlanMode ? 'Switch to' : 'Start with';
  const ctaLabel = selected === 'annual'
    ? `${verb} Annual${annual ? ` · ${annual.product.priceString}` : ''}`
    : `${verb} Monthly${monthly ? ` · ${monthly.product.priceString}` : ''}`;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.headerRow}>
        <View style={styles.headerSpacer} />
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={spacing.hitSlop}
          accessibilityRole="button"
          accessibilityLabel="Close"
          style={({ pressed }) => [
            styles.closeButton,
            pressed && { opacity: opacity.pressed },
          ]}
        >
          <Icon name="close" size={sizes.iconMd - 4} color={colors.ink} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroIconCircle}>
            <Icon name="sparkle" size={28} color={colors.accent} />
          </View>
          <Text style={[typography.h1, styles.heroTitle]}>
            Unlock unlimited{'\n'}scans
          </Text>
          <Text style={[typography.bodyMd, styles.heroSub]}>
            Go Pro and never wonder if a meal is safe.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureRow
            iconName="camera"
            iconBg={colors.bg}
            iconColor={colors.primary}
            title="Unlimited meal & label scans"
            subtitle="Every meal, every day. No 3-scan ceiling."
          />
          <FeatureRow
            iconName="keyboard"
            iconBg={colors.cardAmber}
            iconColor={colors.accentDark}
            title="Type It In is always free"
            subtitle="No limits on text scans — for everyone, forever."
          />
          <FeatureRow
            iconName="infinity"
            iconBg={colors.bg}
            iconColor={colors.primary}
            title="Personalised damage control"
            subtitle="Practical advice tailored to your conditions."
          />
        </View>

        {isLoadingOffering && !offering ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <View style={styles.plansRow}>
            <PlanTile
              kind="monthly"
              selected={selected === 'monthly'}
              isCurrent={currentPlan === 'monthly'}
              priceLabel={monthly?.product.priceString ?? '—'}
              perLabel="per month"
              onPress={() => setSelected('monthly')}
            />
            <PlanTile
              kind="annual"
              selected={selected === 'annual'}
              isCurrent={currentPlan === 'annual'}
              priceLabel={annual?.product.priceString ?? '—'}
              perLabel={annualPerMonthLabel(annual)}
              savingsPct={savings}
              onPress={() => setSelected('annual')}
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={onSubscribe}
          disabled={!selectedPkg || isPurchasing}
          style={({ pressed }) => [
            styles.cta,
            (!selectedPkg || isPurchasing) && styles.ctaDisabled,
            pressed && selectedPkg && !isPurchasing && { opacity: opacity.pressed },
          ]}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
        >
          {isPurchasing ? (
            <ActivityIndicator color={colors.primaryContrast} />
          ) : (
            <Text style={styles.ctaLabel}>{ctaLabel}</Text>
          )}
        </Pressable>

        <View style={styles.linksRow}>
          <Pressable
            onPress={onRestore}
            disabled={isRestoring || isPurchasing}
            hitSlop={spacing.hitSlop}
            accessibilityRole="button"
            accessibilityLabel="Restore purchases"
          >
            <Text style={styles.linkText}>
              {isRestoring ? 'Restoring…' : 'Restore Purchases'}
            </Text>
          </Pressable>

          <View style={styles.linkDivider} />

          <Pressable
            onPress={() => Linking.openURL(LEGAL_URLS.termsAndConditions).catch(() => undefined)}
            hitSlop={spacing.hitSlop}
            accessibilityRole="link"
            accessibilityLabel="Terms & Conditions"
          >
            <Text style={styles.linkText}>Terms</Text>
          </Pressable>

          <View style={styles.linkDivider} />

          <Pressable
            onPress={() => Linking.openURL(LEGAL_URLS.privacyPolicy).catch(() => undefined)}
            hitSlop={spacing.hitSlop}
            accessibilityRole="link"
            accessibilityLabel="Privacy Policy"
          >
            <Text style={styles.linkText}>Privacy</Text>
          </Pressable>
        </View>

        <Text style={styles.footnote}>
          Subscriptions auto-renew until cancelled.{'\n'}Cancel anytime in Profile › Manage
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ---------- subcomponents ----------

interface FeatureRowProps {
  iconName: 'camera' | 'keyboard' | 'infinity';
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
}

function FeatureRow({ iconName, iconBg, iconColor, title, subtitle }: FeatureRowProps) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.featureIcon, { backgroundColor: iconBg }]}>
        <Icon name={iconName} size={18} color={iconColor} />
      </View>
      <View style={styles.featureCopy}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

interface PlanTileProps {
  kind: 'monthly' | 'annual';
  selected: boolean;
  isCurrent?: boolean;
  priceLabel: string;
  perLabel: string;
  savingsPct?: number | null;
  onPress: () => void;
}

function PlanTile({
  kind,
  selected,
  isCurrent = false,
  priceLabel,
  perLabel,
  savingsPct,
  onPress,
}: PlanTileProps) {
  const isAnnual = kind === 'annual';

  // Current plan tile: not tappable, "CURRENT" badge replaces the SAVE badge.
  const showCurrentBadge = isCurrent;
  const showSavingsBadge =
    !isCurrent && isAnnual && savingsPct != null && savingsPct > 0;

  return (
    <Pressable
      onPress={onPress}
      disabled={isCurrent}
      style={({ pressed }) => [
        styles.planTile,
        isAnnual ? styles.planTileAnnual : styles.planTileMonthly,
        selected && (isAnnual ? styles.planTileAnnualSelected : styles.planTileMonthlySelected),
        isCurrent && styles.planTileCurrent,
        pressed && !isCurrent && { opacity: opacity.pressed },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled: isCurrent }}
      accessibilityLabel={`${isAnnual ? 'Annual' : 'Monthly'} plan, ${priceLabel}${isCurrent ? ', current plan' : ''}`}
    >
      {showCurrentBadge ? (
        <View style={[styles.savingsBadge, styles.currentBadge]}>
          <Text style={[styles.savingsText, styles.currentBadgeText]}>CURRENT</Text>
        </View>
      ) : null}
      {showSavingsBadge ? (
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>SAVE {savingsPct}%</Text>
        </View>
      ) : null}
      <Text
        style={[
          styles.planLabel,
          isAnnual ? styles.planLabelAnnual : styles.planLabelMonthly,
        ]}
      >
        {isAnnual ? 'Annual' : 'Monthly'}
      </Text>
      <Text
        style={[
          styles.planPrice,
          isAnnual ? styles.planPriceAnnual : styles.planPriceMonthly,
        ]}
      >
        {priceLabel}
      </Text>
      <Text
        style={[
          styles.planPer,
          isAnnual ? styles.planPerAnnual : styles.planPerMonthly,
        ]}
      >
        {perLabel}
      </Text>
    </Pressable>
  );
}

// ---------- pricing helpers ----------

function computeSavingsPct(
  monthly: RcPackage | null,
  annual: RcPackage | null,
): number | null {
  if (!monthly || !annual) return null;
  const monthlyAnnualised = monthly.product.priceAmount * 12;
  if (monthlyAnnualised <= 0) return null;
  const saved = (monthlyAnnualised - annual.product.priceAmount) / monthlyAnnualised;
  if (saved <= 0) return null;
  return Math.round(saved * 100);
}

function annualPerMonthLabel(annual: RcPackage | null): string {
  if (!annual) return 'per year';
  const perMonth = annual.product.priceAmount / 12;
  if (!Number.isFinite(perMonth) || perMonth <= 0) return 'per year';
  const formatted = perMonth.toLocaleString(undefined, {
    style: 'currency',
    currency: annual.product.currencyCode || 'USD',
    maximumFractionDigits: 2,
  });
  return `${formatted} / month`;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  headerSpacer: { width: sizes.backButton },
  closeButton: {
    width: sizes.backButton,
    height: sizes.backButton,
    borderRadius: sizes.backButton / 2,
    backgroundColor: colors.buttonSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingBottom: spacing.sm,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  heroIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.cardAmber,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  heroSub: {
    textAlign: 'center',
    color: colors.inkSoft,
    paddingHorizontal: spacing.md,
  },
  features: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md + 2,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCopy: { flex: 1, gap: 2 },
  featureTitle: {
    ...typography.lastScanTitle,
    fontSize: 14,
    lineHeight: 18,
  },
  featureSubtitle: {
    ...typography.bodySm,
    color: colors.inkMuted,
  },
  loadingBlock: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  plansRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  planTile: {
    flex: 1,
    borderRadius: radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 2,
    minHeight: 110,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planTileMonthly: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
  planTileMonthlySelected: {
    borderColor: colors.primary,
  },
  planTileAnnual: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  planTileAnnualSelected: {
    borderColor: colors.accent,
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: spacing.sm,
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  savingsText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.ink,
    letterSpacing: 0.6,
  },
  currentBadge: {
    backgroundColor: colors.verdict.allGood.bg,
  },
  currentBadgeText: {
    color: colors.verdict.allGood.fg,
  },
  planTileCurrent: {
    opacity: opacity.pressedSoft,
  },
  planLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: spacing.xs + 2,
  },
  planLabelMonthly: { color: colors.inkMuted },
  planLabelAnnual: { color: colors.onPrimary.label },
  planPrice: {
    ...typography.h1,
    fontSize: 24,
    lineHeight: 28,
    marginBottom: 2,
  },
  planPriceMonthly: { color: colors.ink },
  planPriceAnnual: { color: colors.accent },
  planPer: {
    fontSize: 11,
    lineHeight: 14,
  },
  planPerMonthly: { color: colors.inkMuted },
  planPerAnnual: { color: colors.onPrimary.textSoft },
  footer: {
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  cta: {
    backgroundColor: colors.primary,
    borderRadius: radius.pill,
    paddingVertical: spacing.buttonPaddingY,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: sizes.buttonHeight,
  },
  ctaDisabled: { opacity: opacity.disabled },
  ctaLabel: {
    ...typography.button,
    color: colors.primaryContrast,
  },
  linksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  linkText: {
    ...typography.caption,
    color: colors.inkMuted,
    fontWeight: '500',
  },
  linkDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.border,
  },
  footnote: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.inkMuted,
    lineHeight: 16,
  },
});
