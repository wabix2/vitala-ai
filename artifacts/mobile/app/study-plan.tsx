import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DURATIONS = ["15 min", "30 min", "45 min", "1 hour"];
const GOALS = ["Pass an exam", "Learn a skill", "Improve grades", "Personal growth"];

interface DayPlan {
  day: string;
  topic: string;
  tasks: string[];
  duration: string;
  color: string;
}

const DAY_COLORS = ["#7B7FFF", "#00D4AA", "#F97316", "#EC4899", "#8B5CF6", "#14B8A6", "#F59E0B"];

function generatePlan(subject: string, goal: string, duration: string): DayPlan[] {
  const topics = [
    `${subject} fundamentals`,
    `Core concepts & theory`,
    `Practice problems`,
    `Review & flashcards`,
    `Advanced topics`,
    `Mock test / quiz`,
    `Revision & weak areas`,
  ];
  return DAYS.map((day, i) => ({
    day,
    topic: topics[i] ?? `${subject} session ${i + 1}`,
    tasks: [
      `Study ${topics[i] ?? subject} for ${duration}`,
      `Take notes and highlight key points`,
      i % 2 === 0 ? "Create 5 flashcards from today's content" : "Do 10 practice questions",
    ],
    duration,
    color: DAY_COLORS[i] ?? "#7B7FFF",
  }));
}

export default function StudyPlanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSubscribed } = useSubscription();

  const [subject, setSubject] = useState("");
  const [goal, setGoal] = useState(GOALS[0]!);
  const [duration, setDuration] = useState(DURATIONS[1]!);
  const [plan, setPlan] = useState<DayPlan[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!subject.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setPlan(generatePlan(subject.trim(), goal, duration));
    setLoading(false);
  };

  if (!isSubscribed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Pressable
          style={[styles.backBtn, { top: Platform.OS === "web" ? 80 : insets.top + 12 }]}
          onPress={() => router.back()}
        >
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.gateWrap}>
          <View style={[styles.gateIcon, { backgroundColor: "#7B7FFF15" }]}>
            <Feather name="calendar" size={40} color="#7B7FFF" />
          </View>
          <Text style={[styles.gateTitle, { color: colors.foreground }]}>AI Study Plan</Text>
          <Text style={[styles.gateDesc, { color: colors.mutedForeground }]}>
            Get a personalized 7-day study schedule tailored to your subject and goals. This is a Pro feature.
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
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>AI Study Plan</Text>
        <Feather name="calendar" size={22} color={colors.primary} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!plan ? (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.formSection}>
            <Text style={[styles.label, { color: colors.foreground }]}>What are you studying?</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="e.g. Physics, JavaScript, History..."
              placeholderTextColor={colors.mutedForeground}
              value={subject}
              onChangeText={setSubject}
            />

            <Text style={[styles.label, { color: colors.foreground }]}>Your goal</Text>
            <View style={styles.optionsRow}>
              {GOALS.map((g) => (
                <Pressable
                  key={g}
                  onPress={() => setGoal(g)}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: goal === g ? `${colors.primary}20` : colors.card,
                      borderColor: goal === g ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: goal === g ? colors.primary : colors.mutedForeground }]}>{g}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={[styles.label, { color: colors.foreground }]}>Daily study time</Text>
            <View style={styles.optionsRow}>
              {DURATIONS.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => setDuration(d)}
                  style={[
                    styles.optionChip,
                    {
                      backgroundColor: duration === d ? `${colors.primary}20` : colors.card,
                      borderColor: duration === d ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.optionText, { color: duration === d ? colors.primary : colors.mutedForeground }]}>{d}</Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={[styles.generateBtn, { backgroundColor: subject.trim() ? colors.primary : colors.muted }]}
              onPress={handleGenerate}
              disabled={!subject.trim() || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Feather name="zap" size={18} color="#fff" />
                  <Text style={styles.generateBtnText}>Generate My Plan</Text>
                </>
              )}
            </Pressable>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.planSection}>
            <View style={styles.planHeaderRow}>
              <View>
                <Text style={[styles.planSubject, { color: colors.foreground }]}>{subject}</Text>
                <Text style={[styles.planMeta, { color: colors.mutedForeground }]}>7-day plan · {duration}/day</Text>
              </View>
              <Pressable
                onPress={() => setPlan(null)}
                style={[styles.regenerateBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <Feather name="refresh-cw" size={16} color={colors.primary} />
                <Text style={[styles.regenerateText, { color: colors.primary }]}>Redo</Text>
              </Pressable>
            </View>

            {plan.map((day, i) => (
              <Animated.View key={day.day} entering={FadeInDown.duration(350).delay(i * 60)}>
                <View style={[styles.dayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <LinearGradient
                    colors={[`${day.color}18`, `${day.color}06`]}
                    style={styles.dayGradient}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  >
                    <View style={styles.dayHeader}>
                      <View style={[styles.dayBadge, { backgroundColor: day.color }]}>
                        <Text style={styles.dayBadgeText}>{day.day}</Text>
                      </View>
                      <View style={styles.dayMeta}>
                        <Text style={[styles.dayTopic, { color: colors.foreground }]}>{day.topic}</Text>
                        <Text style={[styles.dayDuration, { color: day.color }]}>{day.duration}</Text>
                      </View>
                    </View>
                    <View style={styles.tasksList}>
                      {day.tasks.map((task, ti) => (
                        <View key={ti} style={styles.taskRow}>
                          <View style={[styles.taskDot, { backgroundColor: day.color }]} />
                          <Text style={[styles.taskText, { color: colors.mutedForeground }]}>{task}</Text>
                        </View>
                      ))}
                    </View>
                  </LinearGradient>
                </View>
              </Animated.View>
            ))}
          </Animated.View>
        )}
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
  backBtn: { position: "absolute", left: 16, zIndex: 10, padding: 8 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  formSection: { gap: 16 },
  label: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  input: {
    borderRadius: 14, borderWidth: 1.5, padding: 14,
    fontSize: 15, fontFamily: "Inter_400Regular",
  },
  optionsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  optionChip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8 },
  optionText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  generateBtn: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 },
  generateBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  planSection: { gap: 12 },
  planHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planSubject: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  planMeta: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  regenerateBtn: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 10, borderWidth: 1, padding: 10 },
  regenerateText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  dayCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  dayGradient: { padding: 16, gap: 12 },
  dayHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  dayBadge: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  dayBadgeText: { color: "#fff", fontSize: 13, fontFamily: "Inter_700Bold" },
  dayMeta: { flex: 1 },
  dayTopic: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  dayDuration: { fontSize: 12, fontFamily: "Inter_500Medium", marginTop: 2 },
  tasksList: { gap: 6, paddingLeft: 4 },
  taskRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  taskDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  taskText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  gateWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  gateIcon: { width: 88, height: 88, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  gateTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  gateDesc: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 23 },
  upgradeBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, marginTop: 8 },
  upgradeBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
