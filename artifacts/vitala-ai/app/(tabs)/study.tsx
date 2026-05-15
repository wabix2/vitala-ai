import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import QuizModal from "@/components/QuizModal";
import FlashcardModal from "@/components/FlashcardModal";
import { shadows } from "@/constants/theme";

const SUBJECTS = ["All", "Biology", "Math", "Chemistry", "Physics", "History"];

const MODES = [
  {
    id: "quiz",
    icon: "help-circle" as const,
    label: "Quiz",
    desc: "Multiple-choice questions with instant feedback and XP rewards",
    color: "#1D72E8",
    xpLabel: "+5 XP / correct answer",
  },
  {
    id: "flashcard",
    icon: "layers" as const,
    label: "Flashcards",
    desc: "Flip cards with spaced repetition for long-term memorization",
    color: "#0EA5E9",
    xpLabel: "+25 XP / deck",
  },
];

const RECENT = [
  { subject: "Biology", mode: "Quiz", score: "8 / 10", xp: "+40 XP", date: "Today", icon: "help-circle" as const },
  { subject: "Chemistry", mode: "Flashcards", score: "10 cards", xp: "+25 XP", date: "Yesterday", icon: "layers" as const },
  { subject: "Math", mode: "Quiz", score: "9 / 10", xp: "+45 XP", date: "Mon", icon: "help-circle" as const },
];

export default function StudyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [subject, setSubject] = useState("All");
  const [quizVisible, setQuizVisible] = useState(false);
  const [flashVisible, setFlashVisible] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Study</Text>
          <View style={[styles.streakPill, { backgroundColor: "#FFF7ED" }]}>
            <Ionicons name="flame" size={14} color="#F97316" />
            <Text style={[styles.streakTxt, { color: "#F97316", fontFamily: "Inter_600SemiBold" }]}>
              {user.streak}d streak
            </Text>
          </View>
        </View>

        {/* Subject Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={{ marginBottom: 24 }}
        >
          {SUBJECTS.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSubject(s)}
              style={[
                styles.chip,
                {
                  backgroundColor: subject === s ? colors.primary : colors.card,
                  borderColor: subject === s ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.chipTxt,
                  { color: subject === s ? "#fff" : colors.textSecondary, fontFamily: "Inter_500Medium" },
                ]}
              >
                {s}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Mode Cards */}
        <View style={styles.modesRow}>
          {MODES.map((m) => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [
                styles.modeCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
                shadows.sm,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                if (m.id === "quiz") setQuizVisible(true);
                else if (m.id === "flashcard") setFlashVisible(true);
              }}
            >
              <View style={[styles.modeIconWrap, { backgroundColor: m.color + "15" }]}>
                <Ionicons name={m.icon} size={28} color={m.color} />
              </View>
              <Text style={[styles.modeLabel, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                {m.label}
              </Text>
              <Text style={[styles.modeDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                {m.desc}
              </Text>
              <View style={[styles.xpPill, { backgroundColor: m.color + "15" }]}>
                <Text style={[styles.xpPillTxt, { color: m.color, fontFamily: "Inter_600SemiBold" }]}>
                  {m.xpLabel}
                </Text>
              </View>
              <View style={[styles.startBtn, { backgroundColor: m.color }]}>
                <Text style={[styles.startTxt, { fontFamily: "Inter_700Bold" }]}>Start</Text>
                <Ionicons name="arrow-forward" size={16} color="#fff" />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Recent Sessions */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          Recent Sessions
        </Text>
        <View style={styles.recentList}>
          {RECENT.map((r, i) => (
            <View
              key={i}
              style={[styles.recentRow, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}
            >
              <View style={[styles.recentIcon, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name={r.icon} size={18} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.recentSubject, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {r.subject}
                </Text>
                <Text style={[styles.recentMeta, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  {r.mode} · {r.date}
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text style={[styles.recentScore, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {r.score}
                </Text>
                <Text style={[styles.recentXP, { color: "#F59E0B", fontFamily: "Inter_500Medium" }]}>
                  {r.xp}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <QuizModal
        visible={quizVisible}
        subject={subject}
        onClose={() => setQuizVisible(false)}
      />
      <FlashcardModal
        visible={flashVisible}
        subject={subject}
        onClose={() => setFlashVisible(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 28 },
  streakPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  streakTxt: { fontSize: 13 },
  chipsRow: { gap: 8, paddingHorizontal: 20, paddingBottom: 4 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipTxt: { fontSize: 13 },
  modesRow: { flexDirection: "row", gap: 12, paddingHorizontal: 20, marginBottom: 28 },
  modeCard: { flex: 1, padding: 18, borderRadius: 20, borderWidth: 1, gap: 10 },
  modeIconWrap: { width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  modeLabel: { fontSize: 18 },
  modeDesc: { fontSize: 12, lineHeight: 17 },
  xpPill: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  xpPillTxt: { fontSize: 11 },
  startBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, marginTop: 4 },
  startTxt: { color: "#fff", fontSize: 14 },
  sectionTitle: { fontSize: 17, marginBottom: 12, paddingHorizontal: 20 },
  recentList: { gap: 10, paddingHorizontal: 20, marginBottom: 20 },
  recentRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 14, borderWidth: 1 },
  recentIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  recentSubject: { fontSize: 14 },
  recentMeta: { fontSize: 12, marginTop: 2 },
  recentScore: { fontSize: 14 },
  recentXP: { fontSize: 12, marginTop: 2 },
});
