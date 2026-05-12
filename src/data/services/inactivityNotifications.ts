import * as Notifications from 'expo-notifications';

import { useLocalProfileStore } from '@/stores/localProfileStore';

/**
 * Local-notification reminder fired when the user hasn't opened the app
 * for the configured idle window. Re-scheduled every time the app comes
 * to the foreground, so the 12-hour clock effectively counts from
 * "last seen" rather than from install.
 *
 * App Store compliance notes:
 * - Permission is requested only after the onboarding primer screen
 *   (`NotificationsScreen`) explains the value, never on cold launch.
 * - If the user has denied (or hasn't granted), we silently skip all
 *   scheduling — no fallback nags, no system re-prompt.
 * - Single recurring identifier so we never queue more than one.
 * - Content is product-relevant (scans / streak), not promotional.
 */

const REMINDER_ID = 'inactivity-reminder';
const INACTIVITY_HOURS = 12;
const INACTIVITY_SECONDS = INACTIVITY_HOURS * 60 * 60;

const REMINDER_TITLE = 'Nutricare Ai';

const REMINDER_BODIES: readonly string[] = [
  "Don't lose your streak — one quick scan keeps it going.",
  'Wondering if that meal was a good call? Find out in 10 seconds.',
  'Haven’t scanned today. A label, a snack, anything counts.',
  '30 seconds now beats second-guessing later. Quick scan?',
  'Your streak misses you. Scan something to keep it alive.',
  'New meal, new question — let’s check it against your conditions.',
];

const pickBody = (): string => {
  const i = Math.floor(Math.random() * REMINDER_BODIES.length);
  return REMINDER_BODIES[i] ?? REMINDER_BODIES[0]!;
};

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

const normaliseStatus = (
  s: Notifications.PermissionStatus,
): PermissionStatus => {
  if (s === 'granted') return 'granted';
  if (s === 'denied') return 'denied';
  return 'undetermined';
};

export const getNotificationsPermission = async (): Promise<PermissionStatus> => {
  const res = await Notifications.getPermissionsAsync();
  return normaliseStatus(res.status);
};

/**
 * Triggers the system permission prompt. Per Apple guidelines, only call
 * this from a user-initiated action (e.g. tapping "Turn on reminders" on
 * the primer screen). If the OS has already denied, iOS will not re-prompt
 * — this resolves with the existing status without showing UI.
 */
export const requestNotificationsPermission = async (): Promise<PermissionStatus> => {
  const res = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return normaliseStatus(res.status);
};

/**
 * Cancel + re-arm the inactivity reminder for 12 hours from now.
 * Idempotent: safe to call on every foreground transition.
 * No-ops when the OS hasn't granted permission OR when the user has
 * turned off reminders in Profile.
 */
const waitForStoreHydration = async (): Promise<void> => {
  if (useLocalProfileStore.persist.hasHydrated()) return;
  await new Promise<void>((resolve) => {
    const unsub = useLocalProfileStore.persist.onFinishHydration(() => {
      unsub();
      resolve();
    });
  });
};

export const scheduleInactivityReminder = async (): Promise<void> => {
  try {
    // Always cancel first — this guarantees that flipping the user toggle
    // OFF (or revoking OS permission) clears any queued reminder on the
    // next foreground tick, and avoids ever queueing two at once.
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {
      // No existing notification with that id — fine.
    });

    // Wait for AsyncStorage rehydration so we read the *persisted* user
    // preference, not the zustand default. Otherwise a cold launch right
    // after the user toggled OFF could schedule an unwanted reminder.
    await waitForStoreHydration();
    const userEnabled = useLocalProfileStore.getState().notificationsEnabled;
    if (!userEnabled) return;

    const status = await getNotificationsPermission();
    if (status !== 'granted') return;

    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: {
        title: REMINDER_TITLE,
        body: pickBody(),
        sound: 'default',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: INACTIVITY_SECONDS,
        repeats: false,
      },
    });
  } catch (err) {
    console.error('[inactivityNotifications] failed to schedule', err);
  }
};

export const cancelInactivityReminder = async (): Promise<void> => {
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // ignore
  }
};

/**
 * Foreground display behavior — shows the banner if a scheduled
 * notification happens to fire while the app is open.
 */
export const configureNotificationHandler = (): void => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
};
