import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";

type Period = "week" | "month" | "all";

interface Player {
  id: number;
  rank: number;
  name: string;
  xp: number;
  level: number;
  streak: number;
  totalQuizzes: number;
  isMe?: boolean;
}

const BASE_URL = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

const PODIUM_COLORS = ["#F59E0B", "#9CA3AF", "#FF9600"];
const PODIUM_HEIGHTS = [90, 64, 48];

export default function LeaderboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [period, setPeriod] = useState<Period>("week");
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  const fetchAndSync = async () => {
    try {
      // Sync current user first
      await fetch(`${BASE_URL}/api/leaderboard/sync`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.userName,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          totalQuizzes: user.totalQuizzes,
        }),
      });

      // Then fetch full leaderboard
      const res = await fetch(`${BASE_URL}/api/leaderboard`);
      const data = (await res.json()) as Array<{
        id: number;
        name: string;
        xp: number;
        level: number;
        streak: number;
        totalQuizzes: number;
        rank: number;
      }>;

      setPlayers(
        data.map((p) => ({
          ...p,
          isMe: p.name === user.userName,
        }))
      );
    } catch {
      // Keep empty on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSync();
  }, []);

  const top3 = players.slice(0, 3);
  const rest = players.slice(3);
  const myEntry = players.find((p) => p.isMe);

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
          {item.name.charAt(0).toUpperCase()}
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
      keyExtractor={(item) => String(item.id)}
      renderItem={renderRow}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={() => (
        <>
          {/* Header */}
          <View style={[styles.header, { paddingTop: topPad + 16 }]}>
            <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              Leaderboard
            </Text>
            <Pressable
              onPress={() => { setLoading(true); fetchAndSync(); }}
              style={styles.refreshBtn}
            >
              <Ionicons name="refresh" size={18} color={colors.textSecondary} />
            </Pressable>
          </View>

          {/* Period Switcher */}
          <View style={[styles.periodBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

          {/* Your rank banner */}
          {myEntry && (
            <View style={[styles.myRankBanner, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "44" }]}>
              <Ionicons name="person" size={16} color={colors.primary} />
              <Text style={[styles.myRankTxt, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                You are ranked #{myEntry.rank} with {myEntry.xp.toLocaleString()} XP
              </Text>
            </View>
          )}

          {/* League Banner */}
          <View style={[styles.leagueBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.leagueIcon, { backgroundColor: colors.primary + "22" }]}>
              <Ionicons name="shield" size={24} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.leagueTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                Sapphire League
              </Text>
              <Text style={[styles.leagueSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                Top 10% of all scholars
              </Text>
            </View>
            <Text style={[styles.leagueTimer, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              3d left
            </Text>
          </View>

          {/* Loading / Podium */}
          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          ) : top3.length > 0 ? (
            <View style={styles.podium}>
              {[1, 0, 2].map((idx) => {
                const p = top3[idx];
                if (!p) return null;
                const isFirst = idx === 0;
                const c = PODIUM_COLORS[idx];
                const h = PODIUM_HEIGHTS[idx];
                return (
                  <View key={p.id} style={styles.podiumCol}>
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
                      <Text style={[styles.podiumAvatarTxt, { color: c, fontFamily: "Inter_700Bold", fontSize: isFirst ? 20 : 16 }]}>
                        {p.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.podiumName,
                        { color: isFirst ? colors.text : colors.textSecondary, fontFamily: isFirst ? "Inter_700Bold" : "Inter_500Medium" },
                      ]}
                      numberOfLines={1}
                    >
                      {p.name}
                    </Text>
                    <View style={[styles.podiumBlock, { height: h, backgroundColor: c + "22", borderColor: c + "55" }]}>
                      <Text style={[styles.podiumNum, { color: c, fontFamily: "Inter_700Bold", fontSize: isFirst ? 22 : 16 }]}>
                        {p.rank}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}

          <Text style={[styles.rankLabel, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>
            RANKINGS
          </Text>
        </>
      )}
    />
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 20 },
  headerTitle: { fontSize: 28 },
  refreshBtn: { padding: 6 },
  periodBar: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 4,
    gap: 4,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  periodTab: { flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  periodTxt: { fontSize: 13 },
  myRankBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  myRankTxt: { fontSize: 13 },
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
  loadingWrap: { height: 160, alignItems: "center", justifyContent: "center" },
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
