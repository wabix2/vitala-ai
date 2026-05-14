import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import {
  ALL_ACHIEVEMENTS,
  getLeague,
  getLeagueColor,
  getLeagueIcon,
  useStreak,
  xpToNextLeague,
} from "@/context/StreakContext";

const LEAGUE_COLORS = {
  Bronze: "#CD7F32", Silver: "#9CA3AF", Gold: "#F59E0B", Diamond: "#7B7FFF",
};

export default function AchievementsScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totalXP, league, earnedAchievements } = useStreak();
  const leagueColor = getLeagueColor(league);
  const { needed, label } = xpToNextLeague(totalXP);
  const earnedIds = new Set(earnedAchievements.map((a) => a.id));
  const earnedCount = earnedIds.size;
  const totalCount = ALL_ACHIEVEMENTS.length;
  const xpForLeague = league === "Bronze" ? 500 : league === "Silver" ? 2000 : league === "Gold" ? 5000 : 5000;
  const xpBase = league === "Bronze" ? 0 : league === "Silver" ? 500 : league === "Gold" ? 2000 : 5000;
  const leagueProgress = league === "Diamond" ? 1 : Math.min(1, (totalXP - xpBase) / (xpForLeague - xpBase));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 80 : insets.top + 16 }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Achievements</Text>
        <View style={[styles.countBadge, { backgroundColor: `${colors.primary}15` }]}>
          <Text style={[styles.countText, { color: colors.primary }]}>{earnedCount}/{totalCount}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]} showsVerticalScrollIndicator={false}>
        {/* League card */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <LinearGradient
            colors={isDark ? [`${leagueColor}25`, `${leagueColor}08`] : [`${leagueColor}18`, `${leagueColor}05`]}
            style={[styles.leagueCard, { borderColor: `${leagueColor}35` }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.leagueTop}>
              <View style={[styles.leagueIconWrap, { backgroundColor: `${leagueColor}20` }]}>
                <Text style={styles.leagueEmoji}>{getLeagueIcon(league)}</Text>
              </View>
              <View style={styles.leagueInfo}>
                <Text style={[styles.leagueName, { color: leagueColor }]}>{league} League</Text>
                <Text style={[styles.leagueXP, { color: colors.foreground }]}>{totalXP.toLocaleString()} XP total</Text>
              </View>
            </View>
            <View style={[styles.xpBarBg, { backgroundColor: isDark ? "#1E2A44" : "#E8ECF8" }]}>
              <View style={[styles.xpBarFill, { width: `${leagueProgress * 100}%`, backgroundColor: leagueColor }]} />
            </View>
            {league !== "Diamond" ? (
              <Text style={[styles.leagueProgress, { color: colors.mutedForeground }]}>
                {needed} XP to {label} {getLeagueIcon(getLeague(totalXP + needed))}
              </Text>
            ) : (
              <Text style={[styles.leagueProgress, { color: leagueColor }]}>Maximum league reached! 🎉</Text>
            )}
          </LinearGradient>
        </Animated.View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>EARNED ({earnedCount})</Text>
        {ALL_ACHIEVEMENTS.filter((a) => earnedIds.has(a.id)).map((ach, i) => (
          <Animated.View key={ach.id} entering={FadeInDown.duration(350).delay(i * 40)}>
            <View style={[styles.achRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.achIcon, { backgroundColor: "#00D4AA15" }]}>
                <Text style={styles.achEmoji}>{ach.icon}</Text>
              </View>
              <View style={styles.achText}>
                <Text style={[styles.achTitle, { color: colors.foreground }]}>{ach.title}</Text>
                <Text style={[styles.achDesc, { color: colors.mutedForeground }]}>{ach.desc}</Text>
              </View>
              {ach.xpReward > 0 && (
                <View style={[styles.xpBadge, { backgroundColor: "#00D4AA15" }]}>
                  <Text style={styles.xpBadgeText}>+{ach.xpReward} XP</Text>
                </View>
              )}
              <Feather name="check-circle" size={18} color="#00D4AA" />
            </View>
          </Animated.View>
        ))}

        {ALL_ACHIEVEMENTS.filter((a) => !earnedIds.has(a.id)).length > 0 && (
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground, marginTop: 8 }]}>
            LOCKED ({totalCount - earnedCount})
          </Text>
        )}
        {ALL_ACHIEVEMENTS.filter((a) => !earnedIds.has(a.id)).map((ach, i) => (
          <Animated.View key={ach.id} entering={FadeInDown.duration(350).delay(i * 30)}>
            <View style={[styles.achRow, styles.achLocked, { backgroundColor: colors.surfaceAlt ?? colors.card, borderColor: colors.border, opacity: 0.6 }]}>
              <View style={[styles.achIcon, { backgroundColor: colors.border }]}>
                <Text style={[styles.achEmoji, { opacity: 0.4 }]}>{ach.icon}</Text>
              </View>
              <View style={styles.achText}>
                <Text style={[styles.achTitle, { color: colors.foreground }]}>{ach.title}</Text>
                <Text style={[styles.achDesc, { color: colors.mutedForeground }]}>{ach.desc}</Text>
              </View>
              {ach.xpReward > 0 && (
                <View style={[styles.xpBadge, { backgroundColor: colors.border }]}>
                  <Text style={[styles.xpBadgeText, { color: colors.mutedForeground }]}>+{ach.xpReward} XP</Text>
                </View>
              )}
              <Feather name="lock" size={16} color={colors.mutedForeground} />
            </View>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  countBadge: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  countText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  scroll: { paddingHorizontal: 16, paddingTop: 4, gap: 10 },
  leagueCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 14, marginBottom: 8 },
  leagueTop: { flexDirection: "row", alignItems: "center", gap: 14 },
  leagueIconWrap: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  leagueEmoji: { fontSize: 28 },
  leagueInfo: { gap: 3 },
  leagueName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  leagueXP: { fontSize: 14, fontFamily: "Inter_500Medium" },
  xpBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  xpBarFill: { height: "100%", borderRadius: 4 },
  leagueProgress: { fontSize: 13, fontFamily: "Inter_400Regular" },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginTop: 4, marginBottom: 2 },
  achRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14 },
  achLocked: {},
  achIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  achEmoji: { fontSize: 22 },
  achText: { flex: 1 },
  achTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  achDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  xpBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  xpBadgeText: { color: "#00D4AA", fontSize: 11, fontFamily: "Inter_700Bold" },
});
