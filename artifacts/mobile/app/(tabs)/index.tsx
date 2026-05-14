import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  getLeagueColor, getLeagueIcon, useStreak, xpToNextLeague,
} from "@/context/StreakContext";
import { useSubscription } from "@/lib/revenuecat";
import { useListGeminiConversations } from "@workspace/api-client-react";

const QUICK_ACTIONS = [
  { icon: "message-circle" as const, label: "AI Chat",     route: "/(tabs)/chat" as const,    color: "#7B7FFF" },
  { icon: "layers" as const,         label: "Flashcards",  route: "/study/flashcards" as const, color: "#00D4AA" },
  { icon: "check-circle" as const,   label: "Quiz",        route: "/study/quiz" as const,      color: "#F97316" },
  { icon: "file-text" as const,      label: "PDF AI",      route: "/(tabs)/pdf" as const,      color: "#EC4899" },
  { icon: "clock" as const,          label: "Focus Timer", route: "/timer" as const,            color: "#8B5CF6" },
  { icon: "calendar" as const,       label: "Study Plan",  route: "/study-plan" as const,      color: "#14B8A6" },
];

const STUDY_TIPS = [
  "Spaced repetition improves retention by 200%",
  "Teach what you learn to solidify knowledge",
  "Break study sessions into 25-minute blocks",
  "Review notes within 24 hours to retain 80%",
  "Sleep consolidates memory — study before bed",
  "Active recall beats re-reading every time",
  "Use the Feynman technique to master topics",
];

const QUESTIONS_PREVIEW = [
  { category: "Science",     preview: "Which planet has the most moons?",            color: "#7B7FFF" },
  { category: "Math",        preview: "What is the derivative of sin(x)?",            color: "#00D4AA" },
  { category: "History",     preview: "In what year did World War II end?",           color: "#F97316" },
  { category: "Biology",     preview: "What is the powerhouse of the cell?",          color: "#EC4899" },
  { category: "Literature",  preview: "Who wrote '1984'?",                            color: "#8B5CF6" },
  { category: "Physics",     preview: "What is the speed of light in a vacuum?",      color: "#14B8A6" },
  { category: "Geography",   preview: "Which is the world's largest ocean?",          color: "#F59E0B" },
  { category: "Chemistry",   preview: "What is the atomic number of Carbon?",         color: "#7B7FFF" },
  { category: "Programming", preview: "What does 'HTTP' stand for?",                  color: "#00D4AA" },
  { category: "Math",        preview: "What is π approximately equal to?",            color: "#00D4AA" },
  { category: "Astronomy",   preview: "How long does light from the Sun reach Earth?",color: "#EC4899" },
  { category: "Biology",     preview: "How many chromosomes do humans have?",         color: "#EC4899" },
  { category: "History",     preview: "Who was the first person to walk on the moon?",color: "#F97316" },
  { category: "Math",        preview: "What is the sum of angles in a triangle?",     color: "#00D4AA" },
  { category: "Science",     preview: "What gas do plants absorb during photosynthesis?", color: "#7B7FFF" },
  { category: "Programming", preview: "Which data structure uses LIFO order?",        color: "#00D4AA" },
  { category: "Geography",   preview: "What is the capital of Australia?",            color: "#F59E0B" },
  { category: "Physics",     preview: "What is Newton's Second Law of Motion?",       color: "#14B8A6" },
  { category: "Literature",  preview: "Shakespeare wrote how many plays?",            color: "#8B5CF6" },
  { category: "Chemistry",   preview: "What is the chemical formula for water?",      color: "#7B7FFF" },
  { category: "Math",        preview: "What is the square root of 144?",              color: "#00D4AA" },
  { category: "Biology",     preview: "What organ produces insulin?",                 color: "#EC4899" },
  { category: "Science",     preview: "What is the hardest natural substance?",       color: "#7B7FFF" },
  { category: "History",     preview: "The Great Wall defended against whom?",        color: "#F97316" },
  { category: "Programming", preview: "What does CSS stand for?",                     color: "#00D4AA" },
  { category: "Physics",     preview: "What is the unit of electrical resistance?",   color: "#14B8A6" },
  { category: "Geography",   preview: "Which is the longest river in the world?",     color: "#F59E0B" },
  { category: "Math",        preview: "What is 15% of 200?",                          color: "#00D4AA" },
  { category: "Chemistry",   preview: "What element has the symbol Fe?",              color: "#7B7FFF" },
  { category: "Biology",     preview: "What is the largest organ in the human body?", color: "#EC4899" },
];

export default function HomeScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const { isSubscribed } = useSubscription();
  const { streak, totalSessions, totalXP, league, earnedAchievements, hasDoneChallenge } = useStreak();

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const { data: conversations } = useListGeminiConversations();
  const recentCount = conversations?.length ?? 0;
  const tip = STUDY_TIPS[new Date().getDate() % STUDY_TIPS.length]!;
  const todayKey = new Date().toISOString().slice(0, 10);
  const challengeDone = hasDoneChallenge(todayKey);
  const leagueColor = getLeagueColor(league);
  const { needed, label } = xpToNextLeague(totalXP);
  const xpBase = league === "Bronze" ? 0 : league === "Silver" ? 500 : league === "Gold" ? 2000 : 5000;
  const xpCap  = league === "Bronze" ? 500 : league === "Silver" ? 2000 : league === "Gold" ? 5000 : 5000;
  const leagueProgress = league === "Diamond" ? 1 : Math.min(1, (totalXP - xpBase) / (xpCap - xpBase));

  const todayQuestion = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return QUESTIONS_PREVIEW[dayOfYear % QUESTIONS_PREVIEW.length]!;
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.name?.split(" ")[0] ?? "Learner";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ["#0F1729", colors.background] : ["#EEF0FF", colors.background]}
        style={[styles.header, { paddingTop: topPadding + 12 }]}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.greeting, { color: colors.mutedForeground }]}>{greeting}</Text>
            <Text style={[styles.name, { color: colors.foreground }]}>{firstName}</Text>
          </View>
          <View style={styles.headerRight}>
            {streak > 0 && (
              <Pressable onPress={() => router.push("/progress" as never)} style={[styles.streakPill, { backgroundColor: "#F9731618" }]}>
                <Feather name="zap" size={13} color="#F97316" />
                <Text style={styles.streakText}>{streak}</Text>
              </Pressable>
            )}
            <Pressable onPress={() => router.push("/achievements" as never)} style={[styles.leaguePill, { backgroundColor: `${leagueColor}18` }]}>
              <Text style={styles.leaguePillEmoji}>{getLeagueIcon(league)}</Text>
              <Text style={[styles.leaguePillText, { color: leagueColor }]}>{totalXP} XP</Text>
            </Pressable>
            <View style={[styles.avatar, { backgroundColor: user?.avatarColor ?? colors.primary }]}>
              <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* XP Progress Bar */}
        <Pressable onPress={() => router.push("/achievements" as never)} style={styles.xpBarSection}>
          <View style={[styles.xpBarBg, { backgroundColor: isDark ? "#1E2A44" : "#DDE2F0" }]}>
            <View style={[styles.xpBarFill, { width: `${leagueProgress * 100}%`, backgroundColor: leagueColor }]} />
          </View>
          {league !== "Diamond" && (
            <Text style={[styles.xpBarLabel, { color: colors.mutedForeground }]}>
              {needed} XP to {label} {getLeagueIcon(league === "Bronze" ? "Silver" : league === "Silver" ? "Gold" : "Diamond")}
            </Text>
          )}
        </Pressable>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        {/* Daily Challenge Card */}
        <Animated.View entering={FadeInDown.duration(400).delay(60)}>
          <Pressable
            onPress={() => router.push("/daily-challenge" as never)}
            style={[styles.challengeCard, {
              backgroundColor: challengeDone ? "#00D4AA10" : `${todayQuestion.color}10`,
              borderColor: challengeDone ? "#00D4AA30" : `${todayQuestion.color}30`,
            }]}
          >
            <LinearGradient
              colors={challengeDone ? ["#00D4AA18", "#00D4AA05"] : [`${todayQuestion.color}22`, `${todayQuestion.color}06`]}
              style={styles.challengeGrad}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <View style={styles.challengeTop}>
                <View style={[styles.challengeIcon, { backgroundColor: challengeDone ? "#00D4AA20" : `${todayQuestion.color}20` }]}>
                  <Feather name={challengeDone ? "check-circle" : "star"} size={22} color={challengeDone ? "#00D4AA" : todayQuestion.color} />
                </View>
                <View style={styles.challengeMeta}>
                  <Text style={[styles.challengeTag, { color: colors.mutedForeground }]}>
                    {challengeDone ? "COMPLETED · +50 XP" : "DAILY CHALLENGE · +50 XP"}
                  </Text>
                  <View style={[styles.catBadge, { backgroundColor: challengeDone ? "#00D4AA20" : `${todayQuestion.color}20` }]}>
                    <Text style={[styles.catText, { color: challengeDone ? "#00D4AA" : todayQuestion.color }]}>{todayQuestion.category}</Text>
                  </View>
                </View>
                {!challengeDone && (
                  <View style={[styles.newBadge, { backgroundColor: "#F97316" }]}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.challengeQ, { color: colors.foreground }]} numberOfLines={2}>{todayQuestion.preview}</Text>
              <View style={styles.challengeFooter}>
                <Text style={[styles.challengeAction, { color: challengeDone ? "#00D4AA" : todayQuestion.color }]}>
                  {challengeDone ? "View result & leaderboard →" : "Answer to keep your streak alive →"}
                </Text>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.duration(400).delay(120)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Quick Actions</Text>
          <View style={styles.grid}>
            {QUICK_ACTIONS.map((action) => (
              <Pressable key={action.label} onPress={() => router.push(action.route as never)} style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}18` }]}>
                  <Feather name={action.icon} size={22} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Stats */}
        <Animated.View entering={FadeInDown.duration(400).delay(180)}>
          <Pressable onPress={() => router.push("/progress" as never)}>
            <LinearGradient
              colors={isDark ? ["#1A2040", "#141E35"] : ["#EEF0FF", "#E8EBFF"]}
              style={[styles.statsCard, { borderColor: colors.border }]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            >
              <View style={styles.statRow}>
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: colors.primary }]}>{recentCount}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Chats</Text>
                </View>
                <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: "#F97316" }]}>{streak > 0 ? "🔥" : "—"} {streak}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Streak</Text>
                </View>
                <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: leagueColor }]}>{getLeagueIcon(league)}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{league}</Text>
                </View>
                <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
                <View style={styles.stat}>
                  <Text style={[styles.statNum, { color: "#00D4AA" }]}>{earnedAchievements.length}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Badges</Text>
                </View>
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* Pro Banner */}
        {!isSubscribed && (
          <Animated.View entering={FadeInDown.duration(400).delay(240)}>
            <Pressable style={[styles.proBanner, { backgroundColor: `${colors.primary}10`, borderColor: `${colors.primary}28` }]} onPress={() => router.push("/paywall")}>
              <LinearGradient colors={["#7B7FFF20", "#00D4AA10"]} style={styles.proBannerInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style={[styles.proBannerIcon, { backgroundColor: `${colors.primary}20` }]}>
                  <Feather name="zap" size={18} color={colors.primary} />
                </View>
                <View style={styles.proBannerText}>
                  <Text style={[styles.proBannerTitle, { color: colors.foreground }]}>Unlock Vitala AI Pro</Text>
                  <Text style={[styles.proBannerDesc, { color: colors.mutedForeground }]}>Timer, study plan, full leaderboard & more</Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.primary} />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}

        {/* Tip */}
        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>Today's Tip</Text>
          <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="zap" size={18} color="#F97316" />
            <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
          </View>
        </Animated.View>

        {/* Navigation shortcuts */}
        <Animated.View entering={FadeInDown.duration(400).delay(360)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>More</Text>
          {[
            { icon: "award" as const,     label: "Achievements",    desc: `${earnedAchievements.length} badges earned`,              color: "#F59E0B", route: "/achievements" as const },
            { icon: "trending-up" as const,label: "My Progress",    desc: "Streaks, sessions & analytics",                           color: "#00D4AA", route: "/progress" as const },
            { icon: "users" as const,      label: "Leaderboard",    desc: "See how your streak ranks globally",                       color: "#7B7FFF", route: "/leaderboard" as const },
          ].map((item) => (
            <Pressable key={item.label} onPress={() => router.push(item.route as never)} style={[styles.toolRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.toolIcon, { backgroundColor: `${item.color}18` }]}>
                <Feather name={item.icon} size={20} color={item.color} />
              </View>
              <View style={styles.toolText}>
                <Text style={[styles.toolLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.toolDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
              </View>
              <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
            </Pressable>
          ))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingBottom: 16, paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 2 },
  name: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.4 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakPill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  streakText: { color: "#F97316", fontFamily: "Inter_700Bold", fontSize: 13 },
  leaguePill: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 4 },
  leaguePillEmoji: { fontSize: 13 },
  leaguePillText: { fontFamily: "Inter_700Bold", fontSize: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 16 },
  xpBarSection: { gap: 5 },
  xpBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  xpBarFill: { height: "100%", borderRadius: 3 },
  xpBarLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16, gap: 20 },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },
  challengeCard: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  challengeGrad: { padding: 18, gap: 12 },
  challengeTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  challengeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  challengeMeta: { flex: 1, gap: 4 },
  challengeTag: { fontSize: 10, fontFamily: "Inter_700Bold", letterSpacing: 1, textTransform: "uppercase" },
  catBadge: { alignSelf: "flex-start", borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  catText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  newBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  newBadgeText: { color: "#fff", fontSize: 10, fontFamily: "Inter_700Bold" },
  challengeQ: { fontSize: 17, fontFamily: "Inter_700Bold", lineHeight: 24, letterSpacing: -0.2 },
  challengeFooter: {},
  challengeAction: { fontSize: 13, fontFamily: "Inter_500Medium" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "flex-start", gap: 8 },
  actionIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  statsCard: { borderRadius: 16, borderWidth: 1, padding: 18 },
  statRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  stat: { alignItems: "center", gap: 4 },
  statNum: { fontSize: 18, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  statDiv: { width: 1, height: 30 },
  proBanner: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  proBannerInner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  proBannerIcon: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  proBannerText: { flex: 1 },
  proBannerTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  proBannerDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  tipCard: { borderRadius: 14, borderWidth: 1, padding: 16, flexDirection: "row", gap: 12, alignItems: "flex-start" },
  tipText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 21 },
  toolRow: { borderRadius: 14, borderWidth: 1, padding: 14, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 10 },
  toolIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toolText: { flex: 1, gap: 2 },
  toolLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  toolDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
