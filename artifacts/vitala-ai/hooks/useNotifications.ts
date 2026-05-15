import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const PREF_KEY = "@vitala_notifications_enabled";
const CHANNEL_ID = "streak-reminder";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const MESSAGES = [
  { title: "Don't break your streak!", body: "Just 5 minutes of studying keeps your streak alive." },
  { title: "Time to level up!", body: "Your leaderboard rivals are studying right now. Keep up!" },
  { title: "Your brain is waiting.", body: "It wants a quiz. Open Vitala AI and feed it!" },
  { title: "Streak on the line!", body: "Study something today to protect your daily streak." },
  { title: "Knowledge waits for no one.", body: "Tap to continue your learning journey in Vitala AI." },
];

async function setupAndroidChannel() {
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "Daily Streak Reminder",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#1D72E8",
    });
  }
}

async function requestPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

async function scheduleDailyReminder() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  await Notifications.scheduleNotificationAsync({
    content: {
      title: msg.title,
      body: msg.body,
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 20,
      minute: 0,
    },
  });
}

async function cancelReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export function useNotifications() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setupAndroidChannel();
    AsyncStorage.getItem(PREF_KEY)
      .then((val) => {
        setEnabled(val === "true");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggle = useCallback(async () => {
    const next = !enabled;
    if (next) {
      const granted = await requestPermission();
      if (!granted) {
        return;
      }
      await scheduleDailyReminder();
    } else {
      await cancelReminders();
    }
    setEnabled(next);
    await AsyncStorage.setItem(PREF_KEY, String(next));
  }, [enabled]);

  return { enabled, loading, toggle };
}
