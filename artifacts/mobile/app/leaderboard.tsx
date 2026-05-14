import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useStreak } from "@/context/StreakContext";
import { useSubscription } from "@/lib/revenuecat";

const AVATAR_COLORS = ["#5B5FEF","#00B4D8","#00D4AA","#F97316","#EC4899","#8B5CF6","#14B8A6","#F59E0B"];
const NAMES = ["Alex K.","Mia T.","James R.","Sara L.","Omar H.","Yuki N.","Fatima A.","Carlos M.","Priya S.","Liu W.","Amara O.","Ivan P."];

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

interface LeaderEntry {
  rank: number;
  name: string;
  streak: number;
  avatarColor: string;
  isUser: boolean;
}

function buildLeaderboard(userStreak: number, userName: string): LeaderEntry[] {
  const today = new Date().toISOString().slice(0, 10);
  const seed = parseInt(today.replace(/-/g, ""), 10);

  const others: LeaderEntry[] = NAMES.map((name, i) => ({
    rank: 0,
    name,
    streak: Math.floor(seededRand(seed + i) * 80) + 5,
    avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length]!,
    isUser: false,
  }));

  const allEntries = [...others, { rank: 0, name: userName || "You", streak: userStreak, avatarColor: "#7B7FFF", isUser: true }];
  allEntries.sort((a, b) => b.streak - a.streak);
  return allEntries.map((e, i) => ({ ...e, rank: i + 1 }));
}

const RANK_ICONS: Record<number, string> = { 1: "🥇", 2: "🥈", 3: "🥉" };

export default function LeaderboardScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { streak } = useStreak();
  const { isSubscribed } = useSubscription();

  const firstName = user?.name?.split(" ")[0] ?? "You";
  const entries = useMemo(() => buildLeaderboard(streak, firstName), [streak, firstName]);
  const userEntry = entries.find((e) => e.isUser)!;
  const top3 = entries.slice(0, 3);
  const visibleEntries = isSubscribed ? entries : entries.slice(0, 3);

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
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Streak Leaderboard</Text>
          <Feather name="award" size={22} color="#F97316" />
        </View>

        <Animated.View entering={FadeInDown.duration(400).delay(50)} style={styles.podium}>
          {[top3[1], top3[0], top3[2]].map((entry, podiumIdx) => {
            if (!entry) return null;
            const heights = [80, 108, 64];
            const isCenter = podiumIdx === 1;
            return (
              <View key={entry.name} style={[styles.podiumCol, { marginTop: isCenter ? 0 : 28 }]}>
                {entry.isUser && <View style={[styles.youDot, { backgroundColor: colors.primary }]}><Text style={styles.youDotText}>YOU</Text></View>}
                <View style={[styles.podiumAvatar, { backgroundColor: entry.avatarColor, width: isCenter ? 60 : 48, height: isCenter ? 60 : 48, borderRadius: isCenter ? 30 : 24 }]}>
                  <Text style={[styles.podiumAvatarText, { fontSize: isCenter ? 22 : 18 }]}>{entry.name[0]}</Text>
                </View>
                <Text style={[styles.podiumName, { color: colors.foreground, fontSize: isCenter ? 13 : 12 }]} numberOfLines={1}>{entry.name}</Text>
                <View style={[styles.podiumDays, { backgroundColor: isCenter ? "#F97316" : `${AVATAR_COLORS[0]}90`, height: heights[podiumIdx], borderTopLeftRadius: 10, borderTopRightRadius: 10 }]}>
                  <Text style={styles.podiumRankIcon}>{RANK_ICONS[entry.rank]}</Text>
                  <Text style={styles.podiumStreak}>{entry.streak}</Text>
                  <Text style={styles.podiumStreakLabel}>days</Text>
                </View>
              </View>
            );
          })}
        </Animated.View>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
        {userEntry.rank > 3 && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={[styles.yourRankCard, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}>
              <Text style={[styles.yourRankLabel, { color: colors.mutedForeground }]}>YOUR RANK</Text>
              <View style={styles.yourRankRow}>
                <View style={[styles.rankCircle, { backgroundColor: colors.primary }]}>
                  <Text style={styles.rankCircleText}>#{userEntry.rank}</Text>
                </View>
                <View style={styles.yourRankInfo}>
                  <Text style={[styles.yourRankName, { color: colors.foreground }]}>{userEntry.name}</Text>
                  <Text style={[styles.yourRankStreak, { color: colors.primary }]}>{userEntry.streak} day streak 🔥</Text>
                </View>
                <View style={[styles.gapBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.gapText, { color: colors.mutedForeground }]}>
                    {(entries[userEntry.rank - 2]?.streak ?? 0) - userEntry.streak + 1} days to rank up
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>TOP LEARNERS</Text>

        {visibleEntries.map((entry, i) => (
          <Animated.View key={entry.name + i} entering={FadeInDown.duration(350).delay(i * 50)}>
            <View style={[
              styles.entryRow,
              entry.isUser && { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}30` },
              !entry.isUser && { backgroundColor: colors.card, borderColor: colors.border },
            ]}>
              <View style={styles.rankWrap}>
                {entry.rank <= 3
                  ? <Text style={styles.rankEmoji}>{RANK_ICONS[entry.rank]}</Text>
                  : <Text style={[styles.rankNum, { color: colors.mutedForeground }]}>#{entry.rank}</Text>
                }
              </View>
              <View style={[styles.entryAvatar, { backgroundColor: entry.isUser ? colors.primary : entry.avatarColor }]}>
                <Text style={styles.entryAvatarText}>{entry.name[0]}</Text>
              </View>
              <View style={styles.entryInfo}>
                <View style={styles.entryNameRow}>
                  <Text style={[styles.entryName, { color: colors.foreground }]}>{entry.name}</Text>
                  {entry.isUser && <View style={[styles.youBadge, { backgroundColor: colors.primary }]}><Text style={styles.youBadgeText}>YOU</Text></View>}
                </View>
                <View style={styles.entryStreakRow}>
                  <Feather name="zap" size={11} color="#F97316" />
                  <Text style={[styles.entryStreak, { color: colors.mutedForeground }]}>{entry.streak} day streak</Text>
                </View>
              </View>
              <View style={[styles.streakBar, { backgroundColor: isDark ? "#1E2A44" : "#EEF0FF" }]}>
                <View style={[styles.streakBarFill, { width: `${Math.min(100, (entry.streak / (entries[0]?.streak ?? 1)) * 100)}%`, backgroundColor: entry.isUser ? colors.primary : "#F97316" }]} />
              </View>
            </View>
          </Animated.View>
        ))}

        {!isSubscribed && (
          <Animated.View entering={FadeInDown.duration(400).delay(visibleEntries.length * 50)}>
            <Pressable
              style={[styles.proGate, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}
              onPress={() => router.push("/paywall")}
            >
              <LinearGradient colors={["#7B7FFF20", "#00D4AA10"]} style={styles.proGateInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Feather name="lock" size={18} color={colors.primary} />
                <View style={styles.proGateText}>
                  <Text style={[styles.proGateTitle, { color: colors.foreground }]}>See all {entries.length} learners</Text>
                  <Text style={[styles.proGateDesc, { color: colors.mutedForeground }]}>Upgrade to Pro to unlock the full leaderboard</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.primary} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="info" size={16} color={colors.mutedForeground} />
            <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
              Complete the daily challenge every day to grow your streak and climb the leaderboard!
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGrad: { paddingBottom: 24 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  podium: { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 12, paddingHorizontal: 20 },
  podiumCol: { alignItems: "center", gap: 6, flex: 1 },
  youDot: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  youDotText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  podiumAvatar: { alignItems: "center", justifyContent: "center", marginBottom: 4 },
  podiumAvatarText: { color: "#fff", fontFamily: "Inter_700Bold" },
  podiumName: { fontFamily: "Inter_600SemiBold", textAlign: "center" },
  podiumDays: { width: "100%", alignItems: "center", justifyContent: "center", gap: 2, paddingTop: 8 },
  podiumRankIcon: { fontSize: 18 },
  podiumStreak: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  podiumStreakLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Inter_400Regular" },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 10 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4, marginTop: 4 },
  yourRankCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 6 },
  yourRankLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
  yourRankRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  rankCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  rankCircleText: { color: "#fff", fontSize: 14, fontFamily: "Inter_700Bold" },
  yourRankInfo: { flex: 1 },
  yourRankName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  yourRankStreak: { fontSize: 13, fontFamily: "Inter_500Medium", marginTop: 2 },
  gapBadge: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  gapText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  entryRow: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, padding: 12 },
  rankWrap: { width: 32, alignItems: "center" },
  rankEmoji: { fontSize: 20 },
  rankNum: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  entryAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center" },
  entryAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  entryInfo: { flex: 1 },
  entryNameRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  entryName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  youBadge: { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  youBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  entryStreakRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  entryStreak: { fontSize: 12, fontFamily: "Inter_400Regular" },
  streakBar: { width: 60, height: 6, borderRadius: 3, overflow: "hidden" },
  streakBarFill: { height: "100%", borderRadius: 3 },
  proGate: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  proGateInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  proGateText: { flex: 1 },
  proGateTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  proGateDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  tipBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  tipText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
});
