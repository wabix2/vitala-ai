import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";

type Period = "week" | "month" | "all";

interface Player {
  rank: number;
  name: string;
  xp: number;
  streak: number;
  init: string;
  isMe?: boolean;
}

const PLAYERS: Player[] = [
  { rank: 1, name: "Kai M.", xp: 3400, streak: 14, init: "K" },
  { rank: 2, name: "Yuki T.", xp: 3110, streak: 9, init: "Y" },
  { rank: 3, name: "Alex R.", xp: 2980, streak: 12, init: "A" },
  { rank: 4, name: "Scholar", xp: 1240, streak: 7, init: "S", isMe: true },
  { rank: 5, name: "Mia L.", xp: 1180, streak: 5, init: "M" },
  { rank: 6, name: "Sam B.", xp: 1050, streak: 3, init: "S" },
  { rank: 7, name: "Jin H.", xp: 980, streak: 4, init: "J" },
  { rank: 8, name: "Priya K.", xp: 870, streak: 6, init: "P" },
  { rank: 9, name: "Omar F.", xp: 740, streak: 2, init: "O" },
  { rank: 10, name: "Sara N.", xp: 690, streak: 1, init: "S" },
];

const PODIUM_COLORS = ["#F59E0B", "#9CA3AF", "#FF9600"];
const PODIUM_HEIGHTS = [90, 64, 48];

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [period, setPeriod] = useState<Period>("week");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  const top3 = PLAYERS.slice(0, 3);
  const rest = PLAYERS.slice(3);

  const renderRow = ({ item }: { item: Player }) => (
    <Pressable
      style={({ pressed }) => [
        styles.playerRow,
        {
          backgroundColor: item.isMe ? colors.primary + "22" : colors.card,
          borderColor: item.isMe ? colors.primary + "66" : colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <Text style={[styles.rowRank, { color: colors.textMuted, fontFamily: "Inter_600SemiBold" }]}>
        #{item.rank}
      </Text>
      <View
        style={[
          styles.rowAvatar,
          { backgroundColor: item.isMe ? colors.primary + "55" : colors.primary + "22" },
        ]}
      >
        <Text
          style={[
            styles.rowAvatarTxt,
            { color: item.isMe ? "#fff" : colors.primary, fontFamily: "Inter_700Bold" },
          ]}
        >
          {item.init}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={[
            styles.rowName,
            { color: colors.text, fontFamily: item.isMe ? "Inter_700Bold" : "Inter_500Medium" },
          ]}
        >
          {item.name}
          {item.isMe ? " (You)" : ""}
        </Text>
        <View style={styles.streakRow}>
          <Ionicons name="flame" size={11} color="#FF9600" />
          <Text style={[styles.rowStreak, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {item.streak}d streak
          </Text>
        </View>
      </View>
      <View style={{ alignItems: "flex-end", gap: 4 }}>
        <View style={styles.xpRow}>
          <Ionicons name="star" size={12} color="#F59E0B" />
          <Text style={[styles.rowXP, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
            {item.xp.toLocaleString()}
          </Text>
        </View>
        {!item.isMe && (
          <Pressable
            style={[styles.duelBtn, { borderColor: colors.primary + "66" }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Text style={[styles.duelTxt, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              Duel
            </Text>
          </Pressable>
        )}
      </View>
    </Pressable>
  );

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: botPad }}
      showsVerticalScrollIndicator={false}
      data={rest}
      keyExtractor={(item) => String(item.rank)}
      renderItem={renderRow}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={() => (
        <>
          {/* Header */}
          <View style={[styles.header, { paddingTop: topPad + 16 }]}>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              Leaderboard
            </Text>
          </View>

          {/* Period Switcher */}
          <View
            style={[styles.periodBar, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {(["week", "month", "all"] as Period[]).map((p) => (
              <Pressable
                key={p}
                style={[styles.periodTab, period === p && { backgroundColor: colors.primary }]}
                onPress={() => { setPeriod(p); Haptics.selectionAsync(); }}
              >
                <Text
                  style={[
                    styles.periodTxt,
                    { color: period === p ? "#fff" : colors.textSecondary, fontFamily: "Inter_500Medium" },
                  ]}
                >
                  {p === "week" ? "This Week" : p === "month" ? "This Month" : "All Time"}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* League Banner */}
          <View
            style={[styles.leagueBanner, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.leagueIcon, { backgroundColor: colors.primary + "22" }]}>
              <Ionicons name="shield" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.leagueTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                Sapphire League
              </Text>
              <Text
                style={[styles.leagueSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}
              >
                Top 10% of all scholars
              </Text>
            </View>
            <Text style={[styles.leagueTimer, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              3d left
            </Text>
          </View>

          {/* Podium */}
          <View style={styles.podium}>
            {[1, 0, 2].map((idx) => {
              const p = top3[idx];
              if (!p) return null;
              const isFirst = idx === 0;
              const c = PODIUM_COLORS[idx];
              const h = PODIUM_HEIGHTS[idx];
              return (
                <View key={p.rank} style={styles.podiumCol}>
                  {isFirst && (
                    <Ionicons name="trophy" size={18} color="#F59E0B" style={{ marginBottom: 4 }} />
                  )}
                  <View
                    style={[
                      styles.podiumAvatar,
                      {
                        backgroundColor: c + "33",
                        borderColor: c + "66",
                        width: isFirst ? 56 : 44,
                        height: isFirst ? 56 : 44,
                        borderRadius: isFirst ? 28 : 22,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.podiumAvatarTxt,
                        { color: c, fontFamily: "Inter_700Bold", fontSize: isFirst ? 20 : 16 },
                      ]}
                    >
                      {p.init}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.podiumName,
                      { color: isFirst ? colors.text : colors.textSecondary, fontFamily: isFirst ? "Inter_700Bold" : "Inter_500Medium" },
                    ]}
                  >
                    {p.name}
                  </Text>
                  <View
                    style={[
                      styles.podiumBlock,
                      { height: h, backgroundColor: c + "22", borderColor: c + "55" },
                    ]}
                  >
                    <Text style={[styles.podiumNum, { color: c, fontFamily: "Inter_700Bold", fontSize: isFirst ? 22 : 16 }]}>
                      {p.rank}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <Text
            style={[styles.rankLabel, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}
          >
            RANKINGS
          </Text>
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 28 },
  periodBar: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  periodTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  periodTxt: { fontSize: 13 },
  leagueBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  leagueIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  leagueTitle: { fontSize: 15 },
  leagueSub: { fontSize: 12, marginTop: 2 },
  leagueTimer: { fontSize: 12 },
  podium: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  podiumCol: { alignItems: "center", flex: 1 },
  podiumAvatar: { borderWidth: 2, alignItems: "center", justifyContent: "center", marginBottom: 6 },
  podiumAvatarTxt: {},
  podiumName: { fontSize: 11, marginBottom: 8, textAlign: "center" },
  podiumBlock: {
    width: "100%",
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  podiumNum: {},
  rankLabel: { fontSize: 11, letterSpacing: 1.2, marginBottom: 10, paddingHorizontal: 20 },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  rowRank: { width: 28, fontSize: 13 },
  rowAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  rowAvatarTxt: { fontSize: 15 },
  rowName: { fontSize: 14 },
  streakRow: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 2 },
  rowStreak: { fontSize: 11 },
  xpRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowXP: { fontSize: 14 },
  duelBtn: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  duelTxt: { fontSize: 11 },
});
