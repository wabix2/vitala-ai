import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import AchievementShareModal from "@/components/AchievementShareModal";

interface Achievement {
  id: string;
  icon: string;
  label: string;
  unlocked: boolean;
  color: string;
  description: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "1", icon: "flame", label: "7-Day Streak", unlocked: true, color: "#FF9600", description: "Studied 7 days in a row without missing a single day." },
  { id: "2", icon: "school", label: "Quick Learner", unlocked: true, color: "#5C5EF0", description: "Completed your first quiz with a score of 80% or higher." },
  { id: "3", icon: "trophy", label: "Top 10", unlocked: true, color: "#F59E0B", description: "Reached the Top 10 on the weekly leaderboard." },
  { id: "4", icon: "book", label: "Bookworm", unlocked: false, color: "#2DD4BF", description: "Complete 50 study sessions to unlock this achievement." },
  { id: "5", icon: "star", label: "XP Master", unlocked: false, color: "#F59E0B", description: "Earn 5,000 total XP to unlock this achievement." },
  { id: "6", icon: "bulb", label: "Feynman Pro", unlocked: false, color: "#00C899", description: "Complete 10 Feynman sessions to unlock this achievement." },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const STREAK_ACTIVE = [true, true, true, true, true, true, false];

const SETTINGS_ROWS = [
  { icon: "notifications-outline" as const, label: "Notifications", sub: "Daily reminders" },
  { icon: "moon-outline" as const, label: "Appearance", sub: "Dark mode" },
  { icon: "shield-checkmark-outline" as const, label: "Pro Upgrade", sub: "Unlock unlimited sessions" },
  { icon: "information-circle-outline" as const, label: "About", sub: "Version 1.0.0" },
];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;
  const xpFraction = Math.min(1, user.xp / user.xpToNext);

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.background }}
        contentContainerStyle={{ paddingBottom: botPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 16 }]}>
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            Profile
          </Text>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.bigAvatar, { backgroundColor: colors.primary + "33" }]}>
            <Text style={[styles.bigAvatarTxt, { color: colors.primary, fontFamily: "Inter_700Bold" }]}>
              {user.userName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.profileName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {user.userName}
          </Text>
          <View style={[styles.levelChip, { backgroundColor: colors.primary + "22" }]}>
            <Ionicons name="star" size={12} color={colors.primary} />
            <Text style={[styles.levelTxt, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              Level {user.level}
            </Text>
          </View>
          <View style={[styles.xpTrack, { backgroundColor: colors.background }]}>
            <View
              style={[
                styles.xpFill,
                { width: `${Math.round(xpFraction * 100)}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.xpLabel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {user.xp} / {user.xpToNext} XP to Level {user.level + 1}
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: "Streak", value: `${user.streak}d`, icon: "flame" as const, color: "#FF9600" },
            { label: "Quizzes", value: String(user.totalQuizzes), icon: "help-circle" as const, color: colors.primary },
            { label: "Rank", value: `#${user.rank}`, icon: "trophy" as const, color: "#F59E0B" },
            { label: "XP Total", value: user.xp.toLocaleString(), icon: "star" as const, color: "#2DD4BF" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons name={stat.icon} size={18} color={stat.color} />
              <Text style={[styles.statValue, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                {stat.value}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Streak Calendar */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          Streak Calendar
        </Text>
        <View style={[styles.calCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.calRow}>
            {DAYS.map((d, i) => (
              <View key={i} style={styles.dayCol}>
                <Text style={[styles.dayLetter, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  {d}
                </Text>
                <View
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: STREAK_ACTIVE[i] ? "#FF960033" : colors.background,
                      borderColor: STREAK_ACTIVE[i] ? "#FF9600" : colors.border,
                    },
                  ]}
                >
                  {STREAK_ACTIVE[i] && <Ionicons name="flame" size={14} color="#FF9600" />}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Achievements */}
        <View style={styles.achieveSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold", marginBottom: 0 }]}>
            Achievements
          </Text>
          <Text style={[styles.achieveHint, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Tap to share
          </Text>
        </View>
        <View style={styles.achieveGrid}>
          {ACHIEVEMENTS.map((a) => (
            <Pressable
              key={a.id}
              style={({ pressed }) => [
                styles.achieveCard,
                {
                  backgroundColor: colors.card,
                  borderColor: a.unlocked ? a.color + "55" : colors.border,
                  opacity: pressed ? 0.8 : a.unlocked ? 1 : 0.45,
                },
              ]}
              onPress={() => {
                if (!a.unlocked) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSelectedAchievement(a);
              }}
            >
              <View style={[styles.achieveIcon, { backgroundColor: a.color + "22" }]}>
                <Ionicons name={a.icon as any} size={20} color={a.unlocked ? a.color : colors.textMuted} />
              </View>
              <Text
                style={[
                  styles.achieveLabel,
                  { color: a.unlocked ? colors.text : colors.textMuted, fontFamily: "Inter_500Medium" },
                ]}
                numberOfLines={1}
              >
                {a.label}
              </Text>
              {a.unlocked && (
                <View style={[styles.shareHintBadge, { backgroundColor: a.color + "22" }]}>
                  <Ionicons name="share-social" size={10} color={a.color} />
                </View>
              )}
            </Pressable>
          ))}
        </View>

        {/* Settings */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          Settings
        </Text>
        <View style={[styles.settingsList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {SETTINGS_ROWS.map((s, i) => (
            <Pressable
              key={s.label}
              style={({ pressed }) => [
                styles.settingRow,
                i < SETTINGS_ROWS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Ionicons name={s.icon} size={20} color={colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                  {s.label}
                </Text>
                <Text style={[styles.settingSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  {s.sub}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <AchievementShareModal
        achievement={selectedAchievement}
        userName={user.userName}
        userLevel={user.level}
        onClose={() => setSelectedAchievement(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerTitle: { fontSize: 28 },
  profileCard: {
    alignItems: "center",
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  bigAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  bigAvatarTxt: { fontSize: 30 },
  profileName: { fontSize: 22 },
  levelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  levelTxt: { fontSize: 13 },
  xpTrack: { width: "100%", height: 8, borderRadius: 4, overflow: "hidden", marginTop: 4 },
  xpFill: { height: "100%", borderRadius: 4 },
  xpLabel: { fontSize: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, marginBottom: 24 },
  statCard: {
    flex: 1,
    minWidth: "40%",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  statValue: { fontSize: 20 },
  statLabel: { fontSize: 11 },
  sectionTitle: { fontSize: 17, marginBottom: 12, paddingHorizontal: 20 },
  calCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginHorizontal: 20, marginBottom: 24 },
  calRow: { flexDirection: "row", justifyContent: "space-between" },
  dayCol: { alignItems: "center", gap: 6 },
  dayLetter: { fontSize: 11 },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  achieveSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  achieveHint: { fontSize: 12 },
  achieveGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  achieveCard: {
    width: "30%",
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 8,
  },
  achieveIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  achieveLabel: { fontSize: 11, textAlign: "center" },
  shareHintBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsList: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  settingLabel: { fontSize: 14 },
  settingSub: { fontSize: 12, marginTop: 2 },
});
