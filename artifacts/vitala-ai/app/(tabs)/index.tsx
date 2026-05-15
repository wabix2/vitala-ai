import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Avatar } from "@/components/ui/Avatar";
import { shadows } from "@/constants/theme";

const TOOLS = [
  { id: "quiz", icon: "help-circle-outline" as const, label: "Quiz", sub: "Test yourself", color: "#1D72E8" },
  { id: "flashcard", icon: "layers-outline" as const, label: "Flashcards", sub: "Quick review", color: "#0EA5E9" },
  { id: "feynman", icon: "bulb-outline" as const, label: "Feynman", sub: "Teach to learn", color: "#F59E0B" },
  { id: "ai", icon: "chatbubbles-outline" as const, label: "AI Chat", sub: "Ask anything", color: "#10B981" },
];

const RANK_COLORS = ["#F59E0B", "#94A3B8", "#F97316"];

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

interface LeaderEntry {
  id: number;
  name: string;
  xp: number;
  rank: number;
}

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const [top3, setTop3] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.03, duration: 2000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, [pulseAnim]);

  useEffect(() => {
    fetch(`${BASE_URL}/api/leaderboard`)
      .then((r) => r.json())
      .then((data: LeaderEntry[]) => setTop3(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  const xpFraction = Math.min(1, user.xp / user.xpToNext);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;
  const firstName = user.userName.split(" ")[0];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: botPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            {getGreeting()}
          </Text>
          <Text style={[styles.userName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {firstName}
          </Text>
        </View>
        <View style={styles.pills}>
          <View style={[styles.pill, { backgroundColor: "#FFF7ED" }]}>
            <Ionicons name="flame" size={14} color="#F97316" />
            <Text style={[styles.pillTxt, { color: "#F97316", fontFamily: "Inter_600SemiBold" }]}>
              {user.streak}d
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: "#FFFBEB" }]}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={[styles.pillTxt, { color: "#F59E0B", fontFamily: "Inter_600SemiBold" }]}>
              {user.xp.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: colors.primary }, shadows.md]}>
        <View style={styles.heroLeft}>
          <View style={styles.levelBadge}>
            <Text style={[styles.levelTxt, { fontFamily: "Inter_600SemiBold" }]}>
              Level {user.level}
            </Text>
          </View>
          <Text style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}>
            Keep going,{"\n"}{firstName}!
          </Text>
          <View style={styles.xpTrack}>
            <View
              style={[
                styles.xpFill,
                { width: `${Math.round(xpFraction * 100)}%` },
              ]}
            />
          </View>
          <Text style={[styles.xpLabel, { fontFamily: "Inter_400Regular" }]}>
            {user.xp} / {user.xpToNext} XP
          </Text>
        </View>
        <Animated.View style={[styles.heroIconWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.heroIcon}>
            <Ionicons name="school" size={52} color="#FFFFFF" />
          </View>
        </Animated.View>
      </View>

      {/* Daily Challenge */}
      <Pressable
        style={({ pressed }) => [
          styles.challengeCard,
          { backgroundColor: "#FFFBEB", borderColor: "#FDE68A", opacity: pressed ? 0.88 : 1 },
          shadows.sm,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/(tabs)/study");
        }}
      >
        <View style={[styles.challengeIcon, { backgroundColor: "#FEF3C7" }]}>
          <Ionicons name="flash" size={20} color="#F59E0B" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.challengeTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            Daily Challenge
          </Text>
          <Text style={[styles.challengeSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            Mixed Quiz — 10 questions
          </Text>
        </View>
        <Text style={[styles.xpBadge, { color: "#F59E0B", fontFamily: "Inter_700Bold" }]}>+50 XP</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      {/* Study Tools */}
      <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
        Study Tools
      </Text>
      <View style={styles.toolsGrid}>
        {TOOLS.map((t) => (
          <Pressable
            key={t.id}
            style={({ pressed }) => [
              styles.toolCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
              shadows.sm,
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (t.id === "ai" || t.id === "feynman") {
                router.push("/(tabs)/chat");
              } else {
                router.push("/(tabs)/study");
              }
            }}
          >
            <View style={[styles.toolIcon, { backgroundColor: t.color + "15" }]}>
              <Ionicons name={t.icon} size={22} color={t.color} />
            </View>
            <Text style={[styles.toolLabel, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
              {t.label}
            </Text>
            <Text style={[styles.toolSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              {t.sub}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Live Mini Leaderboard */}
      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold", marginBottom: 0 }]}>
          Top Scholars
        </Text>
        <Pressable onPress={() => router.push("/(tabs)/leaderboard")}>
          <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
            See all
          </Text>
        </Pressable>
      </View>
      <View style={[styles.leaderCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
        {top3.length === 0
          ? [0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.leaderRow,
                  i < 2 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  { opacity: 0.35 },
                ]}
              >
                <View style={[styles.rankBadge, { backgroundColor: colors.muted }]} />
                <View style={[styles.avatar, { backgroundColor: colors.muted }]} />
                <View style={{ flex: 1, height: 12, backgroundColor: colors.muted, borderRadius: 6 }} />
              </View>
            ))
          : top3.map((s, i) => (
              <View
                key={s.id}
                style={[
                  styles.leaderRow,
                  i < top3.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  s.name === user.userName && { backgroundColor: colors.primary + "08" },
                ]}
              >
                <Text style={[styles.rankNum, { color: RANK_COLORS[i], fontFamily: "Inter_700Bold" }]}>
                  #{s.rank}
                </Text>
                <Avatar name={s.name} size={32} backgroundColor={RANK_COLORS[i] + "22"} textColor={RANK_COLORS[i]} />
                <Text style={[styles.leaderName, { color: colors.text, fontFamily: s.name === user.userName ? "Inter_700Bold" : "Inter_500Medium" }]}>
                  {s.name}{s.name === user.userName ? " (You)" : ""}
                </Text>
                <View style={styles.xpRow}>
                  <Ionicons name="star" size={12} color="#F59E0B" />
                  <Text style={[styles.leaderXP, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
                    {s.xp.toLocaleString()}
                  </Text>
                </View>
              </View>
            ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 20 },
  greeting: { fontSize: 13 },
  userName: { fontSize: 24, marginTop: 2 },
  pills: { flexDirection: "row", gap: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  pillTxt: { fontSize: 13 },
  heroCard: { flexDirection: "row", alignItems: "center", borderRadius: 20, padding: 22, marginHorizontal: 20, marginBottom: 14, overflow: "hidden" },
  heroLeft: { flex: 1, paddingRight: 8 },
  levelBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8, backgroundColor: "rgba(255,255,255,0.2)" },
  levelTxt: { fontSize: 12, color: "#FFFFFF" },
  heroTitle: { fontSize: 22, lineHeight: 28, marginBottom: 14, color: "#FFFFFF" },
  xpTrack: { height: 6, borderRadius: 3, overflow: "hidden", marginBottom: 6, backgroundColor: "rgba(255,255,255,0.3)" },
  xpFill: { height: "100%", borderRadius: 3, backgroundColor: "#FFFFFF" },
  xpLabel: { fontSize: 12, color: "rgba(255,255,255,0.8)" },
  heroIconWrap: { alignItems: "center", justifyContent: "center" },
  heroIcon: { width: 96, height: 96, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.18)", alignItems: "center", justifyContent: "center" },
  challengeCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginHorizontal: 20, marginBottom: 24 },
  challengeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  challengeTitle: { fontSize: 14 },
  challengeSub: { fontSize: 12, marginTop: 2 },
  xpBadge: { fontSize: 13 },
  sectionTitle: { fontSize: 17, marginBottom: 14, paddingHorizontal: 20 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
  seeAll: { fontSize: 14 },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, marginBottom: 28 },
  toolCard: { width: "47%", padding: 16, borderRadius: 16, borderWidth: 1, gap: 8 },
  toolIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  toolLabel: { fontSize: 15 },
  toolSub: { fontSize: 12 },
  leaderCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginHorizontal: 20, marginBottom: 16 },
  leaderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 16, gap: 10 },
  rankBadge: { width: 26, height: 14, borderRadius: 4 },
  rankNum: { width: 26, fontSize: 13 },
  avatar: { width: 32, height: 32, borderRadius: 16 },
  leaderName: { flex: 1, fontSize: 14 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  leaderXP: { fontSize: 13 },
});
