import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { APPLE_SUBSCRIPTIONS_URL, PRODUCT_IDS } from '@/config/constants';
import { BackButton } from '@/presentation/components/BackButton';
import { Divider } from '@/presentation/components/Divider';
import {
  SettingsList,
  SettingsRow,
} from '@/presentation/components/profile/SettingsRow';
import type { ProfileStackParamList } from '@/presentation/navigation/ProfileStack';
import type { RootStackParamList } from '@/presentation/navigation/RootNavigator';
import {
  colors,
  radius,
  spacing,
  typography,
} from '@/presentation/theme';
import { useEntitlementStore } from '@/stores/entitlementStore';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ManageSubscription'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export function ManageSubscriptionScreen() {
  const navigation = useNavigation<Nav>();
  const rootNavigation = useNavigation<RootNav>();

  const entitlement = useEntitlementStore((s) => s.entitlement);
  const restore = useEntitlementStore((s) => s.restore);
  const isRestoring = useEntitlementStore((s) => s.isRestoring);

  const [confirmingDowngrade, setConfirmingDowngrade] = useState(false);

  const planName = resolvePlanName(entitlement.productIdentifier);
  const renewLabel = buildRenewLabel(entitlement.expirationDate, entitlement.willRenew);

  const openAppleSubscriptions = async () => {
    try {
      await Linking.openURL(APPLE_SUBSCRIPTIONS_URL);
    } catch {
      Alert.alert(
        'Could not open Subscriptions',
        'Open Settings → Apple ID → Subscriptions to manage your plan.',
      );
    }
  };

  const onChangePlan = () => {
    rootNavigation.navigate('Paywall');
  };

  const onRestore = async () => {
    if (isRestoring) return;
    const ok = await restore();
    Alert.alert(
      ok ? 'Subscription restored' : 'Nothing to restore',
      ok
        ? 'Your Pro access is active on this device.'
        : 'We couldn’t find an active subscription on this Apple ID.',
    );
  };

  const onDowngrade = () => {
    if (confirmingDowngrade) return;
    setConfirmingDowngrade(true);

    const dateLabel = entitlement.expirationDate
      ? entitlement.expirationDate.toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : null;

    const message = dateLabel
      ? `You’ll keep Pro access until ${dateLabel}. To cancel auto-renewal, continue to Apple Subscriptions and tap Cancel.`
      : 'To cancel your subscription, continue to Apple Subscriptions and tap Cancel.';

    Alert.alert('Downgrade to Free?', message, [
      {
        text: 'Keep Pro',
        style: 'cancel',
        onPress: () => setConfirmingDowngrade(false),
      },
      {
        text: 'Continue',
        style: 'destructive',
        onPress: async () => {
          setConfirmingDowngrade(false);
          await openAppleSubscriptions();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerRow}>
        <BackButton onPress={() => navigation.goBack()} label={null} variant="circle" />
        <Text style={styles.title}>Manage</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statusCard}>
          <View style={styles.statusTopRow}>
            <Text style={[typography.planLabel, styles.statusLabel]}>
              Pro · {planName}
            </Text>
            {entitlement.isActive ? (
              <View style={styles.activeBadge}>
                <View style={styles.activeDot} />
                <Text style={styles.activeText}>Active</Text>
              </View>
            ) : null}
          </View>
          <Text style={[typography.planHeading, styles.statusHeading]}>{renewLabel}</Text>
          <Text style={[typography.planSub, styles.statusSub]}>
            {entitlement.willRenew
              ? 'Auto-renews via App Store · cancel anytime'
              : 'Subscription will not renew'}
          </Text>
        </View>

        <Divider label="Manage" />
        <SettingsList>
          <SettingsRow
            label="Subscription settings"
            icon="settings"
            onPress={openAppleSubscriptions}
          />
          <SettingsRow
            label="Change plan"
            icon="swap"
            onPress={onChangePlan}
          />
          <SettingsRow
            label="Restore purchases"
            icon="refresh"
            onPress={onRestore}
          />
          <SettingsRow
            label="Downgrade to Free"
            icon="arrow-down-circle"
            destructive
            onPress={onDowngrade}
            isLast
          />
        </SettingsList>
      </ScrollView>
    </SafeAreaView>
  );
}

function resolvePlanName(productIdentifier: string | null): string {
  if (productIdentifier === PRODUCT_IDS.annual) return 'Annual';
  if (productIdentifier === PRODUCT_IDS.monthly) return 'Monthly';
  return 'Subscription';
}

function buildRenewLabel(date: Date | null, willRenew: boolean): string {
  if (!date) return 'Active subscription';
  const formatted = date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return willRenew ? `Renews ${formatted}` : `Ends ${formatted}`;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: typography.h2,
  headerSpacer: { width: 28 },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.screenPaddingX,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  statusCard: {
    backgroundColor: colors.cardAmber,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.accentBorder,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLabel: { color: colors.accentDark },
  statusHeading: { color: colors.accentInk },
  statusSub: { color: colors.accentInkSoft },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs + 2,
    backgroundColor: colors.card,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: spacing.sm + 2,
    borderWidth: 1,
    borderColor: colors.accentBorder,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.verdict.allGood.fg,
  },
  activeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    color: colors.accentDark,
    textTransform: 'uppercase',
  },
});
