import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { shadows } from "@/constants/theme";

const QUICK_STARTS = [
  { id: "feynman", icon: "sparkles-outline" as const, label: "Explain", sub: "Feynman mode", color: "#2563EB" },
  { id: "quiz", icon: "help-circle-outline" as const, label: "Quiz", sub: "10 questions", color: "#0891B2" },
  { id: "flashcard", icon: "layers-outline" as const, label: "Cards", sub: "Fast recall", color: "#059669" },
  { id: "ai", icon: "chatbubbles-outline" as const, label: "Ask", sub: "Study mentor", color: "#7C3AED" },
];

const WEAK_TOPICS = [
  { name: "Acid-base reactions", mastery: 42, color: "#D97706" },
  { name: "Linear equations", mastery: 58, color: "#2563EB" },
  { name: "Cell division", mastery: 64, color: "#059669" },
];

const RECENT_ACTIVITY = [
  { title: "Biology quiz", meta: "8/10 accuracy", icon: "checkmark-circle" as const, color: "#059669" },
  { title: "Chemistry cards", meta: "10 terms reviewed", icon: "layers" as const, color: "#0891B2" },
  { title: "Feynman session", meta: "Photosynthesis", icon: "sparkles" as const, color: "#7C3AED" },
];

const RANK_COLORS = ["#D97706", "#64748B", "#EA580C"];

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
  const liftAnim = useRef(new Animated.Value(0)).current;
  const [top3, setTop3] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(liftAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(liftAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, [liftAnim]);

  useEffect(() => {
    if (!BASE_URL) return;
    fetch(`${BASE_URL}/api/leaderboard`)
      .then((r) => r.json())
      .then((data: LeaderEntry[]) => setTop3(data.slice(0, 3)))
      .catch(() => {});
  }, []);

  const xpFraction = Math.min(1, user.xp / user.xpToNext);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;
  const firstName = user.userName.split(" ")[0];
  const projectedXP = useMemo(() => Math.max(0, user.xpToNext - user.xp), [user.xp, user.xpToNext]);
  const nudgeY = liftAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });

  const openTool = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id === "ai" || id === "feynman") router.push("/(tabs)/chat");
    else router.push("/(tabs)/study");
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: botPad }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.header, { paddingTop: topPad + 18 }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
            {getGreeting()}, {firstName}
          </Text>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Ready to understand more today?
          </Text>
        </View>
        <Avatar name={user.userName} size={42} />
      </View>

      <LinearGradient
        colors={["#0F172A", "#1D4ED8", "#0891B2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroCard, shadows.premium]}
      >
        <View style={styles.heroCopy}>
          <View style={styles.levelBadge}>
            <Ionicons name="trending-up" size={13} color="#FFFFFF" />
            <Text style={[styles.levelTxt, { fontFamily: "Inter_700Bold" }]}>Level {user.level}</Text>
          </View>
          <Text style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}>
            {projectedXP} XP until your next level
          </Text>
          <Text style={[styles.heroSub, { fontFamily: "Inter_400Regular" }]}>
            Small sessions compound fast. Start with the weakest topic and bank an easy win.
          </Text>
          <ProgressBar
            progress={xpFraction}
            height={8}
            color="#FFFFFF"
            trackColor="rgba(255,255,255,0.24)"
            style={styles.heroProgress}
          />
          <View style={styles.heroStats}>
            <View>
              <Text style={[styles.heroStatValue, { fontFamily: "Inter_700Bold" }]}>{user.streak}d</Text>
              <Text style={[styles.heroStatLabel, { fontFamily: "Inter_500Medium" }]}>streak</Text>
            </View>
            <View style={styles.heroDivider} />
            <View>
              <Text style={[styles.heroStatValue, { fontFamily: "Inter_700Bold" }]}>{user.totalQuizzes}</Text>
              <Text style={[styles.heroStatLabel, { fontFamily: "Inter_500Medium" }]}>quizzes</Text>
            </View>
            <View style={styles.heroDivider} />
            <View>
              <Text style={[styles.heroStatValue, { fontFamily: "Inter_700Bold" }]}>#{user.rank}</Text>
              <Text style={[styles.heroStatLabel, { fontFamily: "Inter_500Medium" }]}>rank</Text>
            </View>
          </View>
        </View>
        <Animated.View style={[styles.orbitCard, { transform: [{ translateY: nudgeY }] }]}>
          <Ionicons name="school" size={40} color="#FFFFFF" />
        </Animated.View>
      </LinearGradient>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Quick start</Text>
        <Text style={[styles.sectionMeta, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>low friction</Text>
      </View>
      <View style={styles.quickGrid}>
        {QUICK_STARTS.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.quickCard,
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.86 : 1 },
              shadows.sm,
            ]}
            onPress={() => openTool(item.id)}
          >
            <View style={[styles.quickIcon, { backgroundColor: item.color + "18" }]}>
              <Ionicons name={item.icon} size={20} color={item.color} />
            </View>
            <Text style={[styles.quickLabel, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{item.label}</Text>
            <Text style={[styles.quickSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>{item.sub}</Text>
          </Pressable>
        ))}
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.challengeCard,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
          shadows.sm,
        ]}
        onPress={() => openTool("quiz")}
      >
        <View style={[styles.challengeIcon, { backgroundColor: "#FEF3C7" }]}>
          <Ionicons name="flash" size={20} color="#D97706" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.challengeTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Daily challenge
          </Text>
          <Text style={[styles.challengeSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
            10 mixed questions focused on weak spots
          </Text>
        </View>
        <View style={styles.rewardPill}>
          <Text style={[styles.rewardTxt, { fontFamily: "Inter_700Bold" }]}>+50 XP</Text>
        </View>
      </Pressable>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Weak-topic insights</Text>
        <Pressable onPress={() => router.push("/(tabs)/study")}>
          <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>Practice</Text>
        </Pressable>
      </View>
      <View style={[styles.insightCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
        {WEAK_TOPICS.map((topic, index) => (
          <View key={topic.name} style={[styles.topicRow, index < WEAK_TOPICS.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.topicName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{topic.name}</Text>
              <Text style={[styles.topicMeta, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                {topic.mastery}% mastery
              </Text>
            </View>
            <View style={[styles.topicTrack, { backgroundColor: colors.muted }]}>
              <View style={[styles.topicFill, { width: `${topic.mastery}%`, backgroundColor: topic.color }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.twoColumn}>
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
          <View style={styles.panelHeader}>
            <Ionicons name="calendar-clear-outline" size={18} color={colors.streak} />
            <Text style={[styles.panelTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Streak</Text>
          </View>
          <Text style={[styles.bigNumber, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{user.streak}</Text>
          <Text style={[styles.panelSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>days active</Text>
        </View>
        <View style={[styles.panel, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
          <View style={styles.panelHeader}>
            <Ionicons name="pulse-outline" size={18} color={colors.success} />
            <Text style={[styles.panelTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Momentum</Text>
          </View>
          <Text style={[styles.bigNumber, { color: colors.text, fontFamily: "Inter_700Bold" }]}>86%</Text>
          <Text style={[styles.panelSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>weekly pace</Text>
        </View>
      </View>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Recent activity</Text>
      </View>
      <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
        {RECENT_ACTIVITY.map((item, index) => (
          <View key={item.title} style={[styles.activityRow, index < RECENT_ACTIVITY.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
            <View style={[styles.activityIcon, { backgroundColor: item.color + "16" }]}>
              <Ionicons name={item.icon} size={17} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.activityTitle, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>{item.title}</Text>
              <Text style={[styles.activityMeta, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>{item.meta}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.sectionRow}>
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>Top scholars</Text>
        <Pressable onPress={() => router.push("/(tabs)/leaderboard")}>
          <Text style={[styles.seeAll, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>See all</Text>
        </Pressable>
      </View>
      <View style={[styles.leaderCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
        {top3.length === 0
          ? [0, 1, 2].map((i) => (
              <View key={i} style={[styles.leaderRow, i < 2 && { borderBottomWidth: 1, borderBottomColor: colors.border }, { opacity: 0.42 }]}>
                <View style={[styles.rankBadge, { backgroundColor: colors.muted }]} />
                <View style={[styles.avatarSkeleton, { backgroundColor: colors.muted }]} />
                <View style={{ flex: 1, height: 12, backgroundColor: colors.muted, borderRadius: 6 }} />
              </View>
            ))
          : top3.map((s, i) => (
              <View key={s.id} style={[styles.leaderRow, i < top3.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <Text style={[styles.rankNum, { color: RANK_COLORS[i], fontFamily: "Inter_700Bold" }]}>#{s.rank}</Text>
                <Avatar name={s.name} size={32} backgroundColor={RANK_COLORS[i] + "22"} textColor={RANK_COLORS[i]} />
                <Text style={[styles.leaderName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {s.name}{s.name === user.userName ? " (You)" : ""}
                </Text>
                <Text style={[styles.leaderXP, { color: colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
                  {s.xp.toLocaleString()} XP
                </Text>
              </View>
            ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 18, gap: 16 },
  greeting: { fontSize: 13, marginBottom: 4 },
  headerTitle: { fontSize: 24, lineHeight: 30, maxWidth: 270 },
  heroCard: { marginHorizontal: 20, borderRadius: 28, padding: 22, minHeight: 230, overflow: "hidden", marginBottom: 24 },
  heroCopy: { flex: 1, justifyContent: "space-between", paddingRight: 72 },
  levelBadge: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.16)" },
  levelTxt: { color: "#FFFFFF", fontSize: 12 },
  heroTitle: { color: "#FFFFFF", fontSize: 25, lineHeight: 31, marginTop: 14 },
  heroSub: { color: "rgba(255,255,255,0.74)", fontSize: 13, lineHeight: 19, marginTop: 8 },
  heroProgress: { marginTop: 18, backgroundColor: "rgba(255,255,255,0.24)" },
  heroStats: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 16 },
  heroStatValue: { color: "#FFFFFF", fontSize: 18 },
  heroStatLabel: { color: "rgba(255,255,255,0.64)", fontSize: 11, marginTop: 2 },
  heroDivider: { width: 1, height: 30, backgroundColor: "rgba(255,255,255,0.18)" },
  orbitCard: { position: "absolute", right: 18, top: 46, width: 82, height: 82, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.14)", borderWidth: 1, borderColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18 },
  sectionMeta: { fontSize: 12 },
  seeAll: { fontSize: 13 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, marginBottom: 18 },
  quickCard: { width: "47.8%", padding: 14, borderRadius: 18, borderWidth: 1, minHeight: 112 },
  quickIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  quickLabel: { fontSize: 15 },
  quickSub: { fontSize: 12, marginTop: 3 },
  challengeCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16, borderRadius: 20, borderWidth: 1, marginHorizontal: 20, marginBottom: 24 },
  challengeIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  challengeTitle: { fontSize: 15 },
  challengeSub: { fontSize: 12, marginTop: 3, lineHeight: 17 },
  rewardPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#FEF3C7" },
  rewardTxt: { color: "#D97706", fontSize: 12 },
  insightCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden", marginHorizontal: 20, marginBottom: 18 },
  topicRow: { flexDirection: "row", alignItems: "center", padding: 15, gap: 12 },
  topicName: { fontSize: 14 },
  topicMeta: { fontSize: 12, marginTop: 2 },
  topicTrack: { width: 92, height: 7, borderRadius: 999, overflow: "hidden" },
  topicFill: { height: "100%", borderRadius: 999 },
  twoColumn: { flexDirection: "row", gap: 10, paddingHorizontal: 20, marginBottom: 24 },
  panel: { flex: 1, borderRadius: 20, borderWidth: 1, padding: 16 },
  panelHeader: { flexDirection: "row", alignItems: "center", gap: 7 },
  panelTitle: { fontSize: 13 },
  bigNumber: { fontSize: 32, marginTop: 12 },
  panelSub: { fontSize: 12, marginTop: 2 },
  activityCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden", marginHorizontal: 20, marginBottom: 24 },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  activityIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  activityTitle: { fontSize: 14 },
  activityMeta: { fontSize: 12, marginTop: 2 },
  leaderCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden", marginHorizontal: 20, marginBottom: 18 },
  leaderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 13, paddingHorizontal: 15, gap: 10 },
  rankBadge: { width: 26, height: 14, borderRadius: 5 },
  rankNum: { width: 28, fontSize: 13 },
  avatarSkeleton: { width: 32, height: 32, borderRadius: 16 },
  leaderName: { flex: 1, fontSize: 14 },
  leaderXP: { fontSize: 12 },
});
