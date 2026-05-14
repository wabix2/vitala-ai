import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Circle } from "react-native-svg";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useStreak } from "@/context/StreakContext";
import { useSubscription } from "@/lib/revenuecat";

const MODES = [
  { label: "Focus", duration: 25 * 60, color: "#7B7FFF" },
  { label: "Short Break", duration: 5 * 60, color: "#00D4AA" },
  { label: "Long Break", duration: 15 * 60, color: "#F97316" },
];

const RADIUS = 110;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function TimerScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSubscribed } = useSubscription();
  const { recordSession } = useStreak();

  const [modeIdx, setModeIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(MODES[0]!.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mode = MODES[modeIdx]!;

  const progress = useSharedValue(1);

  useEffect(() => {
    setTimeLeft(mode.duration);
    setRunning(false);
    progress.value = 1;
  }, [modeIdx]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current!);
            setRunning(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            if (modeIdx === 0) {
              setSessions((s) => s + 1);
              recordSession(25);
            }
            return 0;
          }
          progress.value = withTiming((t - 1) / mode.duration, { duration: 900 });
          return t - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRunning((r) => !r);
  };

  const handleReset = () => {
    setRunning(false);
    setTimeLeft(mode.duration);
    progress.value = 1;
  };

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  const strokeDash = useAnimatedStyle(() => ({}));

  const strokeOffset = CIRCUMFERENCE * (1 - timeLeft / mode.duration);

  if (!isSubscribed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Pressable
          style={[styles.closeBtn, { top: Platform.OS === "web" ? 80 : insets.top + 12 }]}
          onPress={() => router.back()}
        >
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.gateWrap}>
          <View style={[styles.gateIcon, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="clock" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>Focus Timer</Text>
          <Text style={[styles.gateDesc, { color: colors.mutedForeground }]}>
            The Pomodoro focus timer is a Pro feature. Stay in deep work sessions with timed breaks to maximize your study efficiency.
          </Text>
          <Pressable
            style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/paywall")}
          >
            <Feather name="zap" size={18} color="#fff" />
            <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 80 : insets.top + 16 }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="x" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Focus Timer</Text>
        <View style={[styles.sessionBadge, { backgroundColor: `${mode.color}20` }]}>
          <Text style={[styles.sessionText, { color: mode.color }]}>{sessions} sessions</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.modesRow}>
          {MODES.map((m, i) => (
            <Pressable
              key={m.label}
              onPress={() => setModeIdx(i)}
              style={[
                styles.modeChip,
                {
                  backgroundColor: i === modeIdx ? `${m.color}20` : colors.card,
                  borderColor: i === modeIdx ? m.color : colors.border,
                },
              ]}
            >
              <Text style={[styles.modeChipText, { color: i === modeIdx ? m.color : colors.mutedForeground }]}>
                {m.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(80)} style={styles.clockWrap}>
          <Svg width={260} height={260} style={styles.svg}>
            <Circle
              cx={130} cy={130} r={RADIUS}
              stroke={isDark ? "#1E2A44" : "#E0E4F8"}
              strokeWidth={12}
              fill="none"
            />
            <Circle
              cx={130} cy={130} r={RADIUS}
              stroke={mode.color}
              strokeWidth={12}
              fill="none"
              strokeDasharray={`${CIRCUMFERENCE}`}
              strokeDashoffset={strokeOffset}
              strokeLinecap="round"
              rotation="-90"
              origin="130,130"
            />
          </Svg>
          <View style={styles.timeWrap}>
            <Text style={[styles.timeText, { color: colors.foreground }]}>{mins}:{secs}</Text>
            <Text style={[styles.modeLabel, { color: mode.color }]}>{mode.label}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(160)} style={styles.controls}>
          <Pressable
            style={[styles.resetBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={handleReset}
          >
            <Feather name="rotate-ccw" size={20} color={colors.mutedForeground} />
          </Pressable>
          <Pressable
            style={[styles.playBtn, { backgroundColor: mode.color }]}
            onPress={handleToggle}
          >
            <Feather name={running ? "pause" : "play"} size={32} color="#fff" />
          </Pressable>
          <Pressable
            style={[styles.resetBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setModeIdx((i) => (i + 1) % MODES.length)}
          >
            <Feather name="skip-forward" size={20} color={colors.mutedForeground} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(240)} style={styles.tipsSection}>
          <Text style={[styles.tipsTitle, { color: colors.mutedForeground }]}>POMODORO TECHNIQUE</Text>
          {[
            { icon: "target", text: "Work for 25 minutes with full focus" },
            { icon: "coffee", text: "Take a 5-minute break to recharge" },
            { icon: "award", text: "After 4 sessions, take a 15-minute break" },
          ].map((tip) => (
            <View key={tip.text} style={[styles.tipRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.tipIcon, { backgroundColor: `${mode.color}15` }]}>
                <Feather name={tip.icon as any} size={16} color={mode.color} />
              </View>
              <Text style={[styles.tipText, { color: colors.foreground }]}>{tip.text}</Text>
            </View>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingBottom: 16,
  },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  sessionBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  sessionText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  closeBtn: { position: "absolute", right: 16, zIndex: 10, padding: 8 },
  scroll: { paddingHorizontal: 20, paddingTop: 8, alignItems: "center", gap: 28 },
  modesRow: { flexDirection: "row", gap: 10 },
  modeChip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8 },
  modeChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  clockWrap: { alignItems: "center", justifyContent: "center", width: 260, height: 260 },
  svg: { position: "absolute" },
  timeWrap: { alignItems: "center" },
  timeText: { fontSize: 52, fontFamily: "Inter_700Bold", letterSpacing: -2 },
  modeLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 4 },
  controls: { flexDirection: "row", alignItems: "center", gap: 24 },
  resetBtn: { width: 52, height: 52, borderRadius: 26, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  playBtn: { width: 76, height: 76, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  tipsSection: { width: "100%", gap: 10 },
  tipsTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase" },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14 },
  tipIcon: { width: 34, height: 34, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  tipText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  gateWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  gateIcon: { width: 88, height: 88, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  gateTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  gateDesc: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 23 },
  upgradeBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginTop: 8 },
  upgradeBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
