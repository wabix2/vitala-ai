import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ViewShot from "react-native-view-shot";

import { Achievement, League, getLeagueIcon } from "@/context/StreakContext";

// ──────────────────────────────────────────────────
// Achievement Share Card
// ──────────────────────────────────────────────────
interface AchievementCardProps {
  achievement: Achievement;
  streak: number;
  totalXP: number;
  league: League;
  userName: string;
  shotRef: React.RefObject<ViewShot>;
}

export function AchievementShareCard({ achievement, streak, totalXP, league, userName, shotRef }: AchievementCardProps) {
  return (
    <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }} style={styles.cardWrap}>
      <LinearGradient colors={["#0A0F2C", "#131D3E", "#0A0F2C"]} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        {/* Top accent bar */}
        <LinearGradient colors={["#7B7FFF", "#00D4AA"]} style={styles.topBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

        {/* Brand */}
        <View style={styles.brand}>
          <LinearGradient colors={["#7B7FFF", "#00D4AA"]} style={styles.brandDot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.brandDotText}>V</Text>
          </LinearGradient>
          <Text style={styles.brandName}>Vitala AI</Text>
        </View>

        {/* Badge */}
        <View style={styles.badgeSect}>
          <LinearGradient colors={["#F59E0B25", "#F59E0B08"]} style={styles.emojiCircle}>
            <Text style={styles.bigEmoji}>{achievement.icon}</Text>
          </LinearGradient>
          <Text style={styles.unlockedLabel}>ACHIEVEMENT UNLOCKED</Text>
          <Text style={styles.achTitle}>{achievement.title}</Text>
          <Text style={styles.achDesc}>{achievement.desc}</Text>
          {achievement.xpReward > 0 && (
            <LinearGradient colors={["#00D4AA30", "#00D4AA10"]} style={styles.xpPill}>
              <Text style={styles.xpPillText}>+{achievement.xpReward} XP earned</Text>
            </LinearGradient>
          )}
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>🔥 {streak}</Text>
            <Text style={styles.statKey}>Day Streak</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{getLeagueIcon(league)}</Text>
            <Text style={styles.statKey}>{league} League</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{totalXP}</Text>
            <Text style={styles.statKey}>Total XP</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerName}>{userName}</Text>
          <Text style={styles.footerCta}>Download Vitala AI — AI-powered learning</Text>
        </View>

        {/* Bottom bar */}
        <LinearGradient colors={["#7B7FFF", "#00D4AA"]} style={styles.bottomBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
      </LinearGradient>
    </ViewShot>
  );
}

// ──────────────────────────────────────────────────
// Streak Share Card
// ──────────────────────────────────────────────────
interface StreakCardProps {
  streak: number;
  longestStreak: number;
  totalXP: number;
  league: League;
  totalSessions: number;
  userName: string;
  shotRef: React.RefObject<ViewShot>;
}

export function StreakShareCard({ streak, longestStreak, totalXP, league, totalSessions, userName, shotRef }: StreakCardProps) {
  return (
    <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }} style={styles.cardWrap}>
      <LinearGradient colors={["#0A0F2C", "#1A0F0A", "#0A0F2C"]} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <LinearGradient colors={["#F97316", "#F59E0B"]} style={styles.topBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

        <View style={styles.brand}>
          <LinearGradient colors={["#7B7FFF", "#00D4AA"]} style={styles.brandDot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.brandDotText}>V</Text>
          </LinearGradient>
          <Text style={styles.brandName}>Vitala AI</Text>
        </View>

        <View style={styles.badgeSect}>
          <Text style={styles.fireEmoji}>🔥</Text>
          <Text style={[styles.streakBigNum, { color: "#F97316" }]}>{streak}</Text>
          <Text style={styles.streakDayLabel}>DAY STUDY STREAK</Text>
          <Text style={styles.achDesc}>Showing up every day and getting smarter!</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{longestStreak}</Text>
            <Text style={styles.statKey}>Best Streak</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{getLeagueIcon(league)}</Text>
            <Text style={styles.statKey}>{league} League</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{totalSessions}</Text>
            <Text style={styles.statKey}>Sessions</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerName}>{userName}</Text>
          <Text style={styles.footerCta}>Download Vitala AI — AI-powered learning</Text>
        </View>

        <LinearGradient colors={["#F97316", "#F59E0B"]} style={styles.bottomBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
      </LinearGradient>
    </ViewShot>
  );
}

// ──────────────────────────────────────────────────
// League Share Card
// ──────────────────────────────────────────────────
interface LeagueCardProps {
  league: League;
  totalXP: number;
  streak: number;
  rank: number;
  userName: string;
  shotRef: React.RefObject<ViewShot>;
}

const LEAGUE_GRAD: Record<string, [string, string]> = {
  Bronze:  ["#CD7F3240", "#CD7F3210"],
  Silver:  ["#9CA3AF40", "#9CA3AF10"],
  Gold:    ["#F59E0B40", "#F59E0B10"],
  Diamond: ["#7B7FFF40", "#7B7FFF10"],
};
const LEAGUE_BAR: Record<string, [string, string]> = {
  Bronze:  ["#CD7F32", "#A0522D"],
  Silver:  ["#9CA3AF", "#6B7280"],
  Gold:    ["#F59E0B", "#D97706"],
  Diamond: ["#7B7FFF", "#00D4AA"],
};

export function LeagueShareCard({ league, totalXP, streak, rank, userName, shotRef }: LeagueCardProps) {
  const grad = LEAGUE_GRAD[league] ?? ["#7B7FFF40", "#7B7FFF10"];
  const bar = LEAGUE_BAR[league] ?? ["#7B7FFF", "#00D4AA"];

  return (
    <ViewShot ref={shotRef} options={{ format: "png", quality: 1 }} style={styles.cardWrap}>
      <LinearGradient colors={["#0A0F2C", "#0D1525", "#0A0F2C"]} style={styles.card} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <LinearGradient colors={bar} style={styles.topBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />

        <View style={styles.brand}>
          <LinearGradient colors={["#7B7FFF", "#00D4AA"]} style={styles.brandDot} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.brandDotText}>V</Text>
          </LinearGradient>
          <Text style={styles.brandName}>Vitala AI</Text>
        </View>

        <View style={styles.badgeSect}>
          <LinearGradient colors={grad} style={styles.leagueCircle}>
            <Text style={styles.leagueEmoji}>{getLeagueIcon(league)}</Text>
          </LinearGradient>
          <Text style={styles.unlockedLabel}>LEAGUE REACHED</Text>
          <Text style={styles.achTitle}>{league} League</Text>
          <Text style={styles.achDesc}>Ranked #{rank} on the global leaderboard!</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>{totalXP}</Text>
            <Text style={styles.statKey}>Total XP</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>#{rank}</Text>
            <Text style={styles.statKey}>Global Rank</Text>
          </View>
          <View style={styles.statDot} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>🔥 {streak}</Text>
            <Text style={styles.statKey}>Day Streak</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerName}>{userName}</Text>
          <Text style={styles.footerCta}>Download Vitala AI — AI-powered learning</Text>
        </View>

        <LinearGradient colors={bar} style={styles.bottomBar} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
      </LinearGradient>
    </ViewShot>
  );
}

const styles = StyleSheet.create({
  cardWrap: { width: 360, alignSelf: "center" },
  card: { width: 360, borderRadius: 24, overflow: "hidden" },
  topBar: { height: 5 },
  bottomBar: { height: 5 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingTop: 20, paddingBottom: 4 },
  brandDot: { width: 30, height: 30, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  brandDotText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  brandName: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  badgeSect: { alignItems: "center", paddingHorizontal: 24, paddingVertical: 28, gap: 8 },
  emojiCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  bigEmoji: { fontSize: 52 },
  fireEmoji: { fontSize: 64, marginBottom: 4 },
  streakBigNum: { fontSize: 80, fontFamily: "Inter_700Bold", lineHeight: 86 },
  streakDayLabel: { color: "#F97316", fontSize: 18, fontFamily: "Inter_700Bold", letterSpacing: 2 },
  leagueCircle: { width: 100, height: 100, borderRadius: 50, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  leagueEmoji: { fontSize: 52 },
  unlockedLabel: { color: "#7B7FFF", fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 2.5 },
  achTitle: { color: "#FFFFFF", fontSize: 26, fontFamily: "Inter_700Bold", textAlign: "center", letterSpacing: -0.5 },
  achDesc: { color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  xpPill: { borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6, marginTop: 4 },
  xpPillText: { color: "#00D4AA", fontSize: 14, fontFamily: "Inter_700Bold" },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 0, paddingHorizontal: 24, paddingBottom: 24 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statVal: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  statKey: { color: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "Inter_400Regular" },
  statDot: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.12)" },
  footer: { alignItems: "center", paddingBottom: 20, gap: 3 },
  footerName: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  footerCta: { color: "rgba(255,255,255,0.35)", fontSize: 11, fontFamily: "Inter_400Regular" },
});
