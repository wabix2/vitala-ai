import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import { useNotifications } from "@/hooks/useNotifications";
import AchievementShareModal from "@/components/AchievementShareModal";
import { Avatar } from "@/components/ui/Avatar";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { shadows } from "@/constants/theme";
import { isPremiumUser } from "@/utils/premium";
import PremiumPaywallModal from "@/components/PremiumPaywallModal";

interface Achievement {
  id: string;
  icon: string;
  label: string;
  unlocked: boolean;
  color: string;
  description: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: "1", icon: "flame", label: "7-Day Streak", unlocked: true, color: "#F97316", description: "Studied 7 days in a row without missing a single day." },
  { id: "2", icon: "school", label: "Quick Learner", unlocked: true, color: "#1D72E8", description: "Completed your first quiz with a score of 80% or higher." },
  { id: "3", icon: "trophy", label: "Top 10", unlocked: true, color: "#F59E0B", description: "Reached the Top 10 on the weekly leaderboard." },
  { id: "4", icon: "book", label: "Bookworm", unlocked: false, color: "#0EA5E9", description: "Complete 50 study sessions to unlock this achievement." },
  { id: "5", icon: "star", label: "XP Master", unlocked: false, color: "#F59E0B", description: "Earn 5,000 total XP to unlock this achievement." },
  { id: "6", icon: "bulb", label: "Feynman Pro", unlocked: false, color: "#10B981", description: "Complete 10 Feynman sessions to unlock this achievement." },
];

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const STREAK_ACTIVE = [true, true, true, true, true, true, false];

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const { enabled: notifEnabled, loading: notifLoading, toggle: toggleNotif } = useNotifications();
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;
  const xpFraction = Math.min(1, user.xp / user.xpToNext);

  useEffect(() => {
    if (Platform.OS !== "web") {
      isPremiumUser().then(setIsPremium).catch(() => {});
    }
  }, []);

  const handleUpgrade = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPaywallVisible(true);
  };

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
        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.md]}>
          <Avatar name={user.userName} size={72} />
          <Text style={[styles.profileName, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {user.userName}
          </Text>
          <View style={[styles.levelChip, { backgroundColor: colors.primary + "15" }]}>
            <Ionicons name="star" size={12} color={colors.primary} />
            <Text style={[styles.levelTxt, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
              Level {user.level}
            </Text>
          </View>
          <ProgressBar progress={xpFraction} height={8} style={{ width: "100%", marginTop: 4 }} />
          <Text style={[styles.xpLabel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {user.xp} / {user.xpToNext} XP to Level {user.level + 1}
          </Text>
          {isPremium && (
            <View style={[styles.premiumBadge, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
              <Ionicons name="star" size={13} color="#F59E0B" />
              <Text style={[styles.premiumBadgeTxt, { color: "#B45309", fontFamily: "Inter_600SemiBold" }]}>
                Premium Member
              </Text>
            </View>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {[
            { label: "Streak", value: `${user.streak}d`, icon: "flame" as const, color: "#F97316", bg: "#FFF7ED" },
            { label: "Quizzes", value: String(user.totalQuizzes), icon: "help-circle" as const, color: colors.primary, bg: colors.primary + "10" },
            { label: "Rank", value: `#${user.rank}`, icon: "trophy" as const, color: "#F59E0B", bg: "#FFFBEB" },
            { label: "XP Total", value: user.xp.toLocaleString(), icon: "star" as const, color: "#0EA5E9", bg: "#F0F9FF" },
          ].map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: stat.bg, borderColor: colors.border }, shadows.sm]}
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

        {/* Upgrade to Premium - only shown when not premium */}
        {!isPremium && (
          <View style={[styles.upgradeCard, { backgroundColor: "#1D72E8" }, shadows.md]}>
            <View style={styles.upgradeLeft}>
              <View style={styles.upgradeIconWrap}>
                <Ionicons name="flash" size={22} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.upgradeTitle, { fontFamily: "Inter_700Bold" }]}>
                  Upgrade to Premium
                </Text>
                <Text style={[styles.upgradeSubtitle, { fontFamily: "Inter_400Regular" }]}>
                  Unlimited AI sessions, advanced analytics
                </Text>
              </View>
            </View>
            <Pressable
              style={({ pressed }) => [styles.upgradeBtn, pressed && styles.upgradeBtnPressed]}
              onPress={handleUpgrade}
            >
              <Text style={[styles.upgradeBtnTxt, { fontFamily: "Inter_700Bold" }]}>See Plans</Text>
            </Pressable>
          </View>
        )}

        {/* Streak Calendar */}
        <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          This Week
        </Text>
        <View style={[styles.calCard, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
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
                      backgroundColor: STREAK_ACTIVE[i] ? "#FFF7ED" : colors.muted,
                      borderColor: STREAK_ACTIVE[i] ? "#F97316" : colors.border,
                    },
                  ]}
                >
                  {STREAK_ACTIVE[i] && <Ionicons name="flame" size={14} color="#F97316" />}
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
                  backgroundColor: a.unlocked ? colors.card : colors.muted,
                  borderColor: a.unlocked ? a.color + "44" : colors.border,
                  opacity: pressed ? 0.8 : a.unlocked ? 1 : 0.55,
                },
                a.unlocked && shadows.sm,
              ]}
              onPress={() => {
                if (!a.unlocked) return;
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                setSelectedAchievement(a);
              }}
            >
              <View style={[styles.achieveIcon, { backgroundColor: a.color + "15" }]}>
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
                <View style={[styles.shareHintBadge, { backgroundColor: a.color + "15" }]}>
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
        <View style={[styles.settingsList, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}>
          {/* Notifications */}
          <View style={[styles.settingRow, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={[styles.settingIconWrap, { backgroundColor: "#FFF7ED" }]}>
              <Ionicons name="notifications-outline" size={18} color="#F97316" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                Daily Reminders
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                {notifEnabled ? "Reminder set for 8:00 PM daily" : "Protect your streak with a nudge"}
              </Text>
            </View>
            {notifLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Switch
                value={notifEnabled}
                onValueChange={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleNotif();
                }}
                trackColor={{ false: colors.border, true: colors.primary + "55" }}
                thumbColor={notifEnabled ? colors.primary : colors.textMuted}
              />
            )}
          </View>

          {/* Appearance */}
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomWidth: 1, borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: colors.primary + "10" }]}>
              <Ionicons name="moon-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                Appearance
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                Light mode
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>

          {/* Pro Upgrade */}
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomWidth: 1, borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={isPremium ? undefined : handleUpgrade}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: "#FFFBEB" }]}>
              <Ionicons name="star-outline" size={18} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                {isPremium ? "Premium Active" : "Upgrade to Premium"}
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                {isPremium ? "All features unlocked" : "Unlock unlimited sessions"}
              </Text>
            </View>
            {isPremium ? (
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            ) : (
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            )}
          </Pressable>

          {/* Restore Purchases */}
          {!isPremium && (
            <Pressable
              style={({ pressed }) => [
                styles.settingRow,
                { borderBottomWidth: 1, borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => setPaywallVisible(true)}
            >
              <View style={[styles.settingIconWrap, { backgroundColor: "#F0FDF4" }]}>
                <Ionicons name="refresh-outline" size={18} color="#10B981" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.settingLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                  Restore Purchases
                </Text>
                <Text style={[styles.settingSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  Already bought? Restore here
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
            </Pressable>
          )}

          {/* Privacy Policy */}
          <Pressable
            style={({ pressed }) => [
              styles.settingRow,
              { borderBottomWidth: 1, borderBottomColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/privacy-policy");
            }}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: "#F5F3FF" }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#7C3AED" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                Privacy Policy
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                How we handle your data
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>

          {/* About */}
          <Pressable
            style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.settingIconWrap, { backgroundColor: "#F0F9FF" }]}>
              <Ionicons name="information-circle-outline" size={18} color="#0EA5E9" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.settingLabel, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                About
              </Text>
              <Text style={[styles.settingSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                Version 1.0.0
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
          </Pressable>
        </View>
      </ScrollView>

      <AchievementShareModal
        achievement={selectedAchievement}
        userName={user.userName}
        userLevel={user.level}
        onClose={() => setSelectedAchievement(null)}
      />
      <PremiumPaywallModal
        visible={paywallVisible}
        onClose={() => setPaywallVisible(false)}
        onPurchaseSuccess={() => setIsPremium(true)}
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
  profileName: { fontSize: 22, marginTop: 4 },
  levelChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  levelTxt: { fontSize: 13 },
  xpLabel: { fontSize: 12 },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 4,
  },
  premiumBadgeTxt: { fontSize: 12 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, marginBottom: 20 },
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
  upgradeCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
    borderRadius: 20,
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  upgradeLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  upgradeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeTitle: { fontSize: 15, color: "#FFFFFF" },
  upgradeSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  upgradeBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  upgradeBtnPressed: { opacity: 0.85 },
  upgradeBtnTxt: { color: "#1D72E8", fontSize: 14 },
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
  settingIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  settingLabel: { fontSize: 14 },
  settingSub: { fontSize: 12, marginTop: 2 },
});
