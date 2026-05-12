import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CONDITIONS, LEGAL_URLS } from '@/config/constants';
import { deleteAvatarLocally, saveAvatarLocally } from '@/data/services/avatarStorage';
import {
  cancelInactivityReminder,
  getNotificationsPermission,
  requestNotificationsPermission,
  scheduleInactivityReminder,
} from '@/data/services/inactivityNotifications';
import type { ConditionId } from '@/domain/entities/Condition';
import { ConditionChip } from '@/presentation/components/ConditionChip';
import { DangerButton } from '@/presentation/components/DangerButton';
import { Divider } from '@/presentation/components/Divider';
import { AddConditionRow } from '@/presentation/components/profile/AddConditionRow';
import {
  BodyStatsCard,
  type BodyStatField,
} from '@/presentation/components/profile/BodyStatsCard';
import {
  EditMeasurementModal,
  type EditField,
} from '@/presentation/components/profile/EditMeasurementModal';
import { PlanCard } from '@/presentation/components/profile/PlanCard';
import { ProfileHeaderRow } from '@/presentation/components/profile/ProfileHeaderRow';
import { SettingsList, SettingsRow } from '@/presentation/components/profile/SettingsRow';
import { SwitchRow } from '@/presentation/components/profile/SwitchRow';
import type { ProfileStackParamList } from '@/presentation/navigation/ProfileStack';
import type { RootStackParamList } from '@/presentation/navigation/RootNavigator';
import { colors, spacing, typography } from '@/presentation/theme';
import { useAuthStore } from '@/stores/authStore';
import { useEntitlementStore } from '@/stores/entitlementStore';
import { useLocalAvatarUri, useLocalProfileStore } from '@/stores/localProfileStore';
import { useUserStore } from '@/stores/userStore';
import { AGE_LIMITS, ageToBirthday, calculateAge } from '@/utils/age';
import type { HeightUnit, WeightUnit } from '@/utils/units';

const CONDITION_LABELS: Record<ConditionId, string> = CONDITIONS.reduce(
  (acc, c) => {
    acc[c.id] = c.label;
    return acc;
  },
  {} as Record<ConditionId, string>,
);

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
type RootNav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const rootNavigation = useNavigation<RootNav>();
  const profile = useUserStore((s) => s.profile);
  const saveConditions = useUserStore((s) => s.saveConditions);
  const updateProfile = useUserStore((s) => s.updateProfile);
  const signOut = useAuthStore((s) => s.signOut);

  const entitlement = useEntitlementStore((s) => s.entitlement);

  const avatarUri = useLocalAvatarUri(profile?.uid);
  const setAvatarUri = useLocalProfileStore((s) => s.setAvatarUri);
  const clearAvatarUri = useLocalProfileStore((s) => s.clearAvatarUri);
  const weightUnit = useLocalProfileStore((s) => s.weightUnit);
  const heightUnit = useLocalProfileStore((s) => s.heightUnit);
  const setWeightUnit = useLocalProfileStore((s) => s.setWeightUnit);
  const setHeightUnit = useLocalProfileStore((s) => s.setHeightUnit);
  const notificationsEnabled = useLocalProfileStore((s) => s.notificationsEnabled);
  const setNotificationsEnabled = useLocalProfileStore(
    (s) => s.setNotificationsEnabled,
  );

  const [editField, setEditField] = useState<EditField | null>(null);

  // Reconcile the local "Daily reminder" toggle against the iOS-level
  // permission whenever the user lands on this screen. The two can drift
  // — user skipped the onboarding primer, or flipped Nutricare off in
  // iOS Settings — and we never want the switch to claim ON while the
  // OS would block every notification.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      void (async () => {
        const status = await getNotificationsPermission();
        if (cancelled) return;
        if (status !== 'granted' && notificationsEnabled) {
          setNotificationsEnabled(false);
          await cancelInactivityReminder();
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [notificationsEnabled, setNotificationsEnabled]),
  );

  const ageYears = useMemo(
    () =>
      profile?.birthday && profile.birthday.getTime() > 0
        ? calculateAge(profile.birthday)
        : 0,
    [profile?.birthday],
  );

  if (!profile) {
    return <SafeAreaView style={styles.safe} edges={['top']} />;
  }

  const promptName = () => {
    Alert.prompt(
      'Your name',
      'Shown across the app.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (raw?: string) => {
            const value = raw?.trim();
            if (!value) return;
            try {
              await updateProfile(profile.uid, { displayName: value });
            } catch {
              /* userStore captured the error */
            }
          },
        },
      ],
      'plain-text',
      profile.displayName ?? '',
    );
  };

  const launchPicker = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Photo access needed',
        'Allow photo library access in Settings to set a profile picture.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ],
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || result.assets.length === 0) return;
    const picked = result.assets[0];
    if (!picked) return;
    try {
      const stored = await saveAvatarLocally(profile.uid, picked.uri);
      setAvatarUri(profile.uid, stored);
    } catch (err) {
      console.error('[ProfileScreen] avatar save failed', err);
      Alert.alert('Could not save photo', 'Please try a different image.');
    }
  };

  const removeAvatar = async () => {
    try {
      await deleteAvatarLocally(profile.uid);
    } catch (err) {
      console.error('[ProfileScreen] avatar delete failed', err);
    } finally {
      clearAvatarUri(profile.uid);
    }
  };

  const onAvatarPress = () => {
    if (!avatarUri) {
      launchPicker();
      return;
    }
    Alert.alert('Profile photo', undefined, [
      { text: 'Choose new photo', onPress: launchPicker },
      { text: 'Remove photo', style: 'destructive', onPress: removeAvatar },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const promptStat = (field: BodyStatField) => {
    if (field === 'age') {
      promptAge();
      return;
    }
    setEditField(field);
  };

  const promptAge = () => {
    Alert.prompt(
      'Age',
      'Enter your age in years.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (raw?: string) => {
            const parsed = Number((raw ?? '').trim());
            if (
              !Number.isFinite(parsed) ||
              parsed < AGE_LIMITS.min ||
              parsed > AGE_LIMITS.max
            ) {
              Alert.alert(
                'Invalid age',
                `Please enter a value between ${AGE_LIMITS.min} and ${AGE_LIMITS.max}.`,
              );
              return;
            }
            try {
              await updateProfile(profile.uid, {
                birthday: ageToBirthday(parsed, profile.birthday),
              });
            } catch {
              /* userStore captured the error */
            }
          },
        },
      ],
      'plain-text',
      ageYears > 0 ? String(ageYears) : '',
      'numeric',
    );
  };

  const submitWeight = async (kg: number, unit: WeightUnit) => {
    setWeightUnit(unit);
    try {
      await updateProfile(profile.uid, { weightKg: kg });
    } catch {
      /* userStore captured the error */
    }
  };

  const submitHeight = async (cm: number, unit: HeightUnit) => {
    setHeightUnit(unit);
    try {
      await updateProfile(profile.uid, { heightCm: cm });
    } catch {
      /* userStore captured the error */
    }
  };

  const confirmRemovePreset = (id: ConditionId) => {
    const label = CONDITION_LABELS[id] ?? id;
    Alert.alert(
      'Remove condition?',
      `${label} will no longer be considered when checking your meals.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await saveConditions(profile.uid, {
                conditions: profile.conditions.filter((c) => c !== id),
                customConditions: profile.customConditions,
              });
            } catch {
              /* userStore captured the error */
            }
          },
        },
      ],
    );
  };

  const confirmRemoveCustom = (label: string) => {
    Alert.alert(
      'Remove condition?',
      `${label} will no longer be considered when checking your meals.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await saveConditions(profile.uid, {
                conditions: profile.conditions,
                customConditions: profile.customConditions.filter((c) => c !== label),
              });
            } catch {
              /* userStore captured the error */
            }
          },
        },
      ],
    );
  };

  const goToPickConditions = () => {
    navigation.navigate('PickConditions');
  };

  const confirmSignOut = () => {
    Alert.alert(
      'Sign out?',
      "You'll need to sign in again to access your scans and profile.",
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign out', style: 'destructive', onPress: signOut },
      ],
    );
  };

  const openUrl = (url: string) => () => {
    Linking.openURL(url).catch(() => {
      /* swallow — Toast surfacing arrives with the error system. */
    });
  };

  /**
   * Toggle the local "Daily reminder" preference and reconcile against the
   * iOS-level permission state:
   *
   * - OFF → cancel any queued reminder, persist the preference.
   * - ON  → if OS permission is granted, schedule a fresh reminder.
   *         If undetermined (first time), trigger the system prompt; on
   *         grant we schedule, on deny we revert the toggle.
   *         If already-denied at OS level, we cannot re-prompt
   *         (Apple-blocked) — so we show an alert pointing the user to
   *         iOS Settings and leave the toggle OFF.
   */
  const onToggleNotifications = async (next: boolean) => {
    if (!next) {
      setNotificationsEnabled(false);
      await cancelInactivityReminder();
      return;
    }

    const current = await getNotificationsPermission();
    if (current === 'granted') {
      setNotificationsEnabled(true);
      await scheduleInactivityReminder();
      return;
    }

    if (current === 'undetermined') {
      const result = await requestNotificationsPermission();
      if (result === 'granted') {
        setNotificationsEnabled(true);
        await scheduleInactivityReminder();
      } else {
        setNotificationsEnabled(false);
      }
      return;
    }

    // OS-denied — iOS won't show the system prompt again. The only path
    // back on is via Settings.
    Alert.alert(
      'Notifications are off',
      'Reminders are turned off for Nutricare Ai in iOS Settings. Enable them there to receive scan reminders.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
    );
    setNotificationsEnabled(false);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <Text style={styles.title}>Profile</Text>
        </View>

        <ProfileHeaderRow
          displayName={profile.displayName}
          email={profile.email}
          avatarUri={avatarUri}
          onPickAvatar={onAvatarPress}
          onEditName={promptName}
          style={styles.avatarRow}
        />

        <PlanCard
          plan={profile.plan}
          lifetimePhotoScansUsed={profile.lifetimePhotoScansUsed}
          productIdentifier={entitlement.productIdentifier}
          expirationDate={entitlement.expirationDate}
          willRenew={entitlement.willRenew}
          onPressCta={
            profile.plan === 'pro'
              ? () => navigation.navigate('ManageSubscription')
              : () => rootNavigation.navigate('Paywall')
          }
          style={styles.planCard}
        />

        <Divider label="Body" />
        <BodyStatsCard
          weightKg={profile.weightKg}
          heightCm={profile.heightCm}
          ageYears={ageYears}
          weightUnit={weightUnit}
          heightUnit={heightUnit}
          onEdit={promptStat}
        />

        <Divider label="Conditions" />
        <View style={styles.conditionsSection}>
          {profile.conditions.length === 0 && profile.customConditions.length === 0 ? (
            <Text style={styles.emptyHint}>
              No conditions yet — add one so we can tailor every scan.
            </Text>
          ) : (
            <View style={styles.chipRow}>
              {profile.conditions.map((id) => (
                <ConditionChip
                  key={id}
                  label={CONDITION_LABELS[id] ?? id}
                  selected
                  icon="cross"
                  onPress={() => confirmRemovePreset(id)}
                  accessibilityLabel={`Remove ${CONDITION_LABELS[id] ?? id}`}
                />
              ))}
              {profile.customConditions.map((label) => (
                <ConditionChip
                  key={label}
                  label={label}
                  selected
                  icon="cross"
                  onPress={() => confirmRemoveCustom(label)}
                  accessibilityLabel={`Remove ${label}`}
                />
              ))}
            </View>
          )}
          <AddConditionRow
            onPress={goToPickConditions}
            style={styles.addConditionRow}
          />
        </View>

        <Divider label="Reminders" />
        <SettingsList>
          <SwitchRow
            label="Daily reminder"
            description="A nudge if you haven't scanned for 12 hours."
            value={notificationsEnabled}
            onValueChange={(next) => void onToggleNotifications(next)}
            isLast
          />
        </SettingsList>

        <Divider label="Information" />
        <SettingsList>
          <SettingsRow
            label="Privacy policy"
            onPress={openUrl(LEGAL_URLS.privacyPolicy)}
          />
          <SettingsRow
            label="Terms & conditions"
            onPress={openUrl(LEGAL_URLS.termsAndConditions)}
            isLast
          />
        </SettingsList>
      </ScrollView>

      <View style={styles.cta}>
        <DangerButton label="Sign out" onPress={confirmSignOut} />
      </View>

      {editField && (
        <EditMeasurementModal
          visible
          field={editField}
          initialKg={profile.weightKg}
          initialCm={profile.heightCm}
          weightUnit={weightUnit}
          heightUnit={heightUnit}
          onSubmitWeight={submitWeight}
          onSubmitHeight={submitHeight}
          onClose={() => setEditField(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.surface },
  body: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: typography.h2,

  avatarRow: { marginTop: spacing.md },
  planCard: { marginTop: spacing.md },

  conditionsSection: {
    flex: 1,
    minHeight: 0,
    gap: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  emptyHint: {
    ...typography.bodySm,
    color: colors.inkMuted,
  },
  addConditionRow: { marginTop: 'auto' },

  cta: {
    paddingHorizontal: spacing.lg + 2,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderLight,
  },
});
