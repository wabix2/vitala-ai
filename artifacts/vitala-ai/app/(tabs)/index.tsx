import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
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

const TOOLS = [
  { id: "quiz", icon: "help-circle" as const, label: "Quiz", sub: "Test yourself", color: "#5C5EF0" },
  { id: "flashcard", icon: "layers" as const, label: "Flashcards", sub: "Quick review", color: "#2DD4BF" },
  { id: "feynman", icon: "bulb" as const, label: "Feynman", sub: "Teach to learn", color: "#F59E0B" },
  { id: "ai", icon: "chatbubbles" as const, label: "AI Chat", sub: "Ask anything", color: "#00C899" },
];

const RANK_COLORS = ["#F59E0B", "#9CA3AF", "#FF9600"];

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
  const floatY = useRef(new Animated.Value(0)).current;
  const [top3, setTop3] = useState<LeaderEntry[]>([]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 1800, useNativeDriver: true }),
        Animated.timing(floatY, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, [floatY]);

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
            {firstName} 👋
          </Text>
        </View>
        <View style={styles.pills}>
          <View style={[styles.pill, { backgroundColor: "#FF960022" }]}>
            <Ionicons name="flame" size={14} color="#FF9600" />
            <Text style={[styles.pillTxt, { color: "#FF9600", fontFamily: "Inter_600SemiBold" }]}>
              {user.streak}d
            </Text>
          </View>
          <View style={[styles.pill, { backgroundColor: "#F59E0B22" }]}>
            <Ionicons name="star" size={14} color="#F59E0B" />
            <Text style={[styles.pillTxt, { color: "#F59E0B", fontFamily: "Inter_600SemiBold" }]}>
              {user.xp.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {/* Hero Card */}
      <View style={[styles.heroCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.heroLeft}>
          <View style={[styles.levelBadge, { backgroundColor: colors.primary + "33" }]}>
            <Text style={[styles.levelTxt, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              Lv. {user.level}
            </Text>
          </View>
          <Text style={[styles.heroTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Keep going,{"\n"}{firstName}!
          </Text>
          <View style={[styles.xpTrack, { backgroundColor: colors.background }]}>
            <View
              style={[
                styles.xpFill,
                { width: `${Math.round(xpFraction * 100)}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.xpLabel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {user.xp} / {user.xpToNext} XP
          </Text>
        </View>
        <Animated.View style={{ transform: [{ translateY: floatY }] }}>
          <Image
            source={require("@/assets/images/character.png")}
            style={styles.charImg}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      {/* Daily Challenge */}
      <Pressable
        style={({ pressed }) => [
          styles.challengeCard,
          { backgroundColor: "#F59E0B18", borderColor: "#F59E0B55", opacity: pressed ? 0.85 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/(tabs)/study");
        }}
      >
        <View style={styles.challengeIcon}>
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
              { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
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
            <View style={[styles.toolIcon, { backgroundColor: t.color + "22" }]}>
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
      <View style={[styles.leaderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {top3.length === 0
          ? [0, 1, 2].map((i) => (
              <View
                key={i}
                style={[
                  styles.leaderRow,
                  i < 2 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  { opacity: 0.3 },
                ]}
              >
                <Text style={[styles.rankNum, { color: RANK_COLORS[i], fontFamily: "Inter_700Bold" }]}>
                  #{i + 1}
                </Text>
                <View style={[styles.avatar, { backgroundColor: "#33333333" }]} />
                <View style={{ flex: 1, height: 12, backgroundColor: "#333", borderRadius: 6 }} />
              </View>
            ))
          : top3.map((s, i) => (
              <View
                key={s.id}
                style={[
                  styles.leaderRow,
                  i < top3.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                  s.name === user.userName && { backgroundColor: colors.primary + "11" },
                ]}
              >
                <Text style={[styles.rankNum, { color: RANK_COLORS[i], fontFamily: "Inter_700Bold" }]}>
                  #{s.rank}
                </Text>
                <View style={[styles.avatar, { backgroundColor: RANK_COLORS[i] + "33" }]}>
                  <Text style={[styles.avatarTxt, { color: RANK_COLORS[i], fontFamily: "Inter_700Bold" }]}>
                    {s.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
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
  userName: { fontSize: 22, marginTop: 2 },
  pills: { flexDirection: "row", gap: 8 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pillTxt: { fontSize: 13 },
  heroCard: { flexDirection: "row", alignItems: "center", borderRadius: 20, borderWidth: 1, padding: 20, marginHorizontal: 20, marginBottom: 14, overflow: "hidden" },
  heroLeft: { flex: 1, paddingRight: 8 },
  levelBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8 },
  levelTxt: { fontSize: 12 },
  heroTitle: { fontSize: 22, lineHeight: 28, marginBottom: 14 },
  xpTrack: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: 6 },
  xpFill: { height: "100%", borderRadius: 4 },
  xpLabel: { fontSize: 12 },
  charImg: { width: 110, height: 140 },
  challengeCard: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 16, borderWidth: 1, marginHorizontal: 20, marginBottom: 24 },
  challengeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#F59E0B22" },
  challengeTitle: { fontSize: 14 },
  challengeSub: { fontSize: 12, marginTop: 2 },
  xpBadge: { fontSize: 13 },
  sectionTitle: { fontSize: 17, marginBottom: 14, paddingHorizontal: 20 },
  sectionRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 12 },
  seeAll: { fontSize: 14 },
  toolsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, paddingHorizontal: 20, marginBottom: 28 },
  toolCard: { width: "47%", padding: 16, borderRadius: 18, borderWidth: 1, gap: 8 },
  toolIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  toolLabel: { fontSize: 15 },
  toolSub: { fontSize: 12 },
  leaderCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden", marginHorizontal: 20, marginBottom: 16 },
  leaderRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, gap: 10 },
  rankNum: { width: 26, fontSize: 13 },
  avatar: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  avatarTxt: { fontSize: 13 },
  leaderName: { flex: 1, fontSize: 14 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  leaderXP: { fontSize: 13 },
});
