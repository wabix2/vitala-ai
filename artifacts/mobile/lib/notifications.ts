import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

const CHALLENGE_NOTIF_ID = "daily_challenge_reminder";
const STREAK_NOTIF_ID = "streak_at_risk";

export async function scheduleDailyChallengeReminder(hour = 19, minute = 0): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(CHALLENGE_NOTIF_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: CHALLENGE_NOTIF_ID,
    content: {
      title: "Daily Challenge is waiting! 🎯",
      body: "Answer today's question to keep your streak alive. Just 30 seconds!",
      sound: true,
      data: { route: "/daily-challenge" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

export async function scheduleStreakAtRiskReminder(streak: number): Promise<void> {
  if (Platform.OS === "web" || streak < 3) return;
  await Notifications.cancelScheduledNotificationAsync(STREAK_NOTIF_ID).catch(() => {});
  await Notifications.scheduleNotificationAsync({
    identifier: STREAK_NOTIF_ID,
    content: {
      title: `Your ${streak}-day streak is at risk! 🔥`,
      body: "Don't let it end today — complete the daily challenge before midnight.",
      sound: true,
      data: { route: "/daily-challenge" },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 30,
    },
  });
}

export async function cancelChallengeNotifications(): Promise<void> {
  if (Platform.OS === "web") return;
  await Notifications.cancelScheduledNotificationAsync(CHALLENGE_NOTIF_ID).catch(() => {});
  await Notifications.cancelScheduledNotificationAsync(STREAK_NOTIF_ID).catch(() => {});
}

export async function getBadgeCount(): Promise<number> {
  return Notifications.getBadgeCountAsync();
}

export async function clearBadge(): Promise<void> {
  await Notifications.setBadgeCountAsync(0);
}
