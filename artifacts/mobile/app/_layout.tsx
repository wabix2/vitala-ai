import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import * as Notifications from "expo-notifications";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AchievementToast } from "@/components/AchievementToast";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { StreakProvider, useStreak } from "@/context/StreakContext";
import { setBaseUrl } from "@/lib/query-client";
import { initializeRevenueCat, SubscriptionProvider } from "@/lib/revenuecat";
import {
  requestNotificationPermission,
  scheduleDailyChallengeReminder,
  scheduleStreakAtRiskReminder,
  clearBadge,
} from "@/lib/notifications";

const apiBase =
  process.env.EXPO_PUBLIC_API_URL ??
  (process.env.EXPO_PUBLIC_DOMAIN
    ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
    : "");
if (apiBase) setBaseUrl(apiBase);
initializeRevenueCat();
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function NotificationSetup() {
  const { streak, hasDoneChallenge } = useStreak();
  const router = useRouter();
  const notifListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  useEffect(() => {
    (async () => {
      const granted = await requestNotificationPermission();
      if (!granted) return;
      await clearBadge();
      const todayKey = new Date().toISOString().slice(0, 10);
      if (!hasDoneChallenge(todayKey)) {
        await scheduleDailyChallengeReminder(19, 0);
        if (streak >= 3) await scheduleStreakAtRiskReminder(streak);
      }
    })();

    notifListener.current = Notifications.addNotificationReceivedListener(() => {
      clearBadge();
    });
    responseListener.current = Notifications.addNotificationResponseReceivedListener((resp) => {
      const route = resp.notification.request.content.data?.route as string | undefined;
      if (route) router.push(route as never);
    });

    return () => {
      if (notifListener.current) Notifications.removeNotificationSubscription(notifListener.current);
      if (responseListener.current) Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, [streak]);

  return null;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, isLoading, hasOnboarded } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    const inAuth = segments[0] === "(auth)";
    if (!user && !inAuth) {
      router.replace(!hasOnboarded ? "/(auth)/onboarding" : "/(auth)/login");
    } else if (user && inAuth) {
      router.replace("/(tabs)");
    }
  }, [user, isLoading, hasOnboarded, segments]);

  return <>{children}</>;
}

function ThemedStack() {
  const { isDark } = useTheme();
  const { newAchievements } = useStreak();

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: isDark ? "#080D1A" : "#F5F8FF" },
          animation: "ios",
        }}
      >
        <Stack.Screen name="(auth)" options={{ animation: "fade" }} />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="chat/[id]" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="study/flashcards" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="study/quiz" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="timer" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
        <Stack.Screen name="study-plan" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="progress" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="daily-challenge" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="leaderboard" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="achievements" options={{ animation: "slide_from_right" }} />
        <Stack.Screen name="paywall" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
        <Stack.Screen name="feynman" options={{ animation: "slide_from_right" }} />
      </Stack>
      <AchievementToast />
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <SubscriptionProvider>
            <ThemeProvider>
              <AuthProvider>
                <StreakProvider>
                  <GestureHandlerRootView style={{ flex: 1 }}>
                    <KeyboardProvider>
                      <AuthGate>
                        <NotificationSetup />
                        <ThemedStack />
                      </AuthGate>
                    </KeyboardProvider>
                  </GestureHandlerRootView>
                </StreakProvider>
              </AuthProvider>
            </ThemeProvider>
          </SubscriptionProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
