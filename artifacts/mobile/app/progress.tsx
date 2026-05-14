import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useStreak } from "@/context/StreakContext";
import { useSubscription } from "@/lib/revenuecat";

const WEEK_DAYS = ["M", "T", "W", "T", "F", "S", "S"];

function getWeekActivity(totalSessions: number): number[] {
  const arr = Array(7).fill(0) as number[];
  const today = new Date().getDay();
  const todayIdx = today === 0 ? 6 : today - 1;
  let remaining = Math.min(totalSessions, 14);
  for (let i = todayIdx; i >= 0 && remaining > 0; i--) {
    const v = Math.min(remaining, Math.ceil(Math.random() * 3));
    arr[i] = v;
    remaining -= v;
  }
  return arr;
}

export default function ProgressScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSubscribed } = useSubscription();
  const { streak, longestStreak, totalSessions, totalMinutes } = useStreak();

  const weekActivity = getWeekActivity(totalSessions);
  const maxActivity = Math.max(...weekActivity, 1);

  if (!isSubscribed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 80 : insets.top + 16 }]}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Progress</Text>
          <View style={{ width: 22 }} />
        </View>
        <View style={styles.gateWrap}>
          <View style={[styles.gateIcon, { backgroundColor: "#00D4AA15" }]}>
            <Feather name="bar-chart-2" size={40} color="#00D4AA" />
          </View>
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Progress Analytics</Text>
          <Text style={[styles.gateDesc, { color: colors.mutedForeground }]}>
            Track your study streaks, sessions, and learning stats. Unlock detailed analytics with Pro.
          </Text>
          <Pressable
            style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/paywall")}
          >
            <Feather name="zap" size={18} color="#fff" />
            <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ["#0F1729", colors.background] : ["#EEF0FF", colors.background]}
        style={[styles.headerGrad, { paddingTop: Platform.OS === "web" ? 80 : insets.top + 16 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Your Progress</Text>
          <View style={{ width: 22 }} />
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.statsGrid}>
          {[
            { label: "Current Streak", value: `${streak}`, unit: "days", color: "#F97316", icon: "zap" },
            { label: "Best Streak", value: `${longestStreak}`, unit: "days", color: "#7B7FFF", icon: "award" },
            { label: "Total Sessions", value: `${totalSessions}`, unit: "sessions", color: "#00D4AA", icon: "check-circle" },
            { label: "Time Studied", value: timeStr, unit: "total", color: "#EC4899", icon: "clock" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.statIconWrap, { backgroundColor: `${stat.color}18` }]}>
                <Feather name={stat.icon as any} size={20} color={stat.color} />
              </View>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{stat.value}</Text>
              <Text style={[styles.statUnit, { color: stat.color }]}>{stat.unit}</Text>
              <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{stat.label}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>THIS WEEK</Text>
          <View style={[styles.weekCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.barsRow}>
              {weekActivity.map((count, i) => {
                const barH = Math.max(4, (count / maxActivity) * 80);
                return (
                  <View key={i} style={styles.barCol}>
                    <View style={[styles.barBg, { height: 80, backgroundColor: isDark ? "#1E2A44" : "#EEF0FF" }]}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: barH,
                            backgroundColor: count > 0 ? colors.primary : "transparent",
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.barDay, { color: colors.mutedForeground }]}>{WEEK_DAYS[i]}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={[styles.weekTotal, { color: colors.mutedForeground }]}>
              {weekActivity.reduce((a, b) => a + b, 0)} sessions this week
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>STREAK CALENDAR</Text>
          <View style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.flameRow]}>
              <Feather name="zap" size={32} color="#F97316" />
              <View>
                <Text style={[styles.flameNumber, { color: colors.foreground }]}>{streak} day streak</Text>
                <Text style={[styles.flameDesc, { color: colors.mutedForeground }]}>
                  {streak === 0
                    ? "Start studying today to begin your streak!"
                    : streak < 7
                    ? "Keep it up! You're building a great habit."
                    : streak < 30
                    ? "Impressive dedication! You're on fire."
                    : "Elite learner! Incredible commitment."}
                </Text>
              </View>
            </View>
            {longestStreak > 0 && (
              <View style={[styles.bestRow, { borderTopColor: colors.border }]}>
                <Feather name="award" size={16} color="#7B7FFF" />
                <Text style={[styles.bestText, { color: colors.mutedForeground }]}>
                  Best streak: <Text style={{ color: "#7B7FFF", fontFamily: "Inter_700Bold" }}>{longestStreak} days</Text>
                </Text>
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>STUDY TIPS FOR YOU</Text>
          {[
            { icon: "sun", tip: "Study at the same time daily to build a habit", color: "#F97316" },
            { icon: "target", tip: "Set a goal for each session before you start", color: "#7B7FFF" },
            { icon: "refresh-cw", tip: "Review yesterday's notes before today's session", color: "#00D4AA" },
          ].map((item) => (
            <View
              key={item.tip}
              style={[styles.tipRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.tipIcon, { backgroundColor: `${item.color}18` }]}>
                <Feather name={item.icon as any} size={16} color={item.color} />
              </View>
              <Text style={[styles.tipText, { color: colors.foreground }]}>{item.tip}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGrad: { paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 10 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  statCard: {
    width: "47%", borderRadius: 16, borderWidth: 1,
    padding: 16, gap: 4, alignItems: "flex-start",
  },
  statIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  statValue: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -1 },
  statUnit: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  weekCard: { borderRadius: 16, borderWidth: 1, padding: 20 },
  barsRow: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 12 },
  barCol: { alignItems: "center", gap: 6, flex: 1 },
  barBg: { width: 28, borderRadius: 6, justifyContent: "flex-end", overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 6 },
  barDay: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  weekTotal: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  streakCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  flameRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 20 },
  flameNumber: { fontSize: 20, fontFamily: "Inter_700Bold" },
  flameDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2, maxWidth: 220 },
  bestRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 16, borderTopWidth: 1 },
  bestText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  tipIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  gateWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  gateIcon: { width: 88, height: 88, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  gateTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  gateDesc: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 23 },
  upgradeBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginTop: 8 },
  upgradeBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
