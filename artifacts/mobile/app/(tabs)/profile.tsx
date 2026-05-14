import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { LANGUAGES, t } from "@/lib/i18n";
import { useSubscription } from "@/lib/revenuecat";

export default function ProfileScreen() {
  const colors = useColors();
  const { isDark, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();
  const { isSubscribed, isLoading: subLoading, restore, isRestoring } = useSubscription();
  const router = useRouter();
  const lang = user?.language ?? "en";
  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const [showLang, setShowLang] = useState(false);

  const firstName = user?.name?.split(" ")[0] ?? "Learner";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          await logout();
        },
      },
    ]);
  };

  const handleTheme = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (mode === "system") setMode("dark");
    else if (mode === "dark") setMode("light");
    else setMode("system");
  };

  const handleRestore = async () => {
    try {
      await restore();
      Alert.alert("Restored", "Your purchases have been restored successfully.");
    } catch {
      Alert.alert("Error", "Could not restore purchases. Please try again.");
    }
  };

  const themeLabel = mode === "dark" ? "Dark" : mode === "light" ? "Light" : "System";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ["#0F1729", colors.background] : ["#EEF0FF", colors.background]}
        style={[styles.header, { paddingTop: topPadding + 12 }]}
      >
        <View style={[styles.avatar, { backgroundColor: user?.avatarColor ?? colors.primary }]}>
          <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{user?.name ?? "Learner"}</Text>
        <Text style={[styles.email, { color: colors.mutedForeground }]}>{user?.email ?? ""}</Text>

        {subLoading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 4 }} />
        ) : isSubscribed ? (
          <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
            <Feather name="zap" size={12} color="#fff" />
            <Text style={styles.proBadgeText}>Pro Member</Text>
          </View>
        ) : (
          <Pressable
            style={[styles.upgradeChip, { backgroundColor: `${colors.primary}20`, borderColor: `${colors.primary}40` }]}
            onPress={() => router.push("/paywall")}
          >
            <Feather name="zap" size={12} color={colors.primary} />
            <Text style={[styles.upgradeChipText, { color: colors.primary }]}>Upgrade to Pro</Text>
          </Pressable>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {!isSubscribed && (
          <Pressable
            style={[styles.proCard, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}
            onPress={() => router.push("/paywall")}
          >
            <LinearGradient
              colors={["#7B7FFF20", "#00D4AA10"]}
              style={styles.proCardGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={[styles.proCardIcon, { backgroundColor: `${colors.primary}20` }]}>
                <Feather name="zap" size={20} color={colors.primary} />
              </View>
              <View style={styles.proCardText}>
                <Text style={[styles.proCardTitle, { color: colors.foreground }]}>Unlock Vitala AI Pro</Text>
                <Text style={[styles.proCardDesc, { color: colors.mutedForeground }]}>
                  Unlimited chat, flashcards, quizzes & more
                </Text>
              </View>
              <Feather name="chevron-right" size={20} color={colors.primary} />
            </LinearGradient>
          </Pressable>
        )}

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Subscription</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable
            style={styles.row}
            onPress={() => (isSubscribed ? undefined : router.push("/paywall"))}
          >
            <Feather name="zap" size={18} color={isSubscribed ? colors.accent : colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Plan</Text>
            <View style={[styles.planChip, { backgroundColor: isSubscribed ? `${colors.accent}20` : `${colors.primary}20` }]}>
              <Text style={[styles.planChipText, { color: isSubscribed ? colors.accent : colors.primary }]}>
                {subLoading ? "Loading…" : isSubscribed ? "Pro ✓" : "Free"}
              </Text>
            </View>
            {!isSubscribed && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />}
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.row} onPress={handleRestore} disabled={isRestoring}>
            <Feather name="refresh-cw" size={18} color={colors.mutedForeground} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Restore Purchases</Text>
            {isRestoring && <ActivityIndicator size="small" color={colors.mutedForeground} />}
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>Preferences</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Pressable style={styles.row} onPress={() => setShowLang(true)}>
            <Feather name="globe" size={18} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Language</Text>
            <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
              {LANGUAGES.find((l) => l.code === lang)?.label ?? "English"}
            </Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable style={styles.row} onPress={handleTheme}>
            <Feather name={isDark ? "moon" : "sun"} size={18} color={colors.primary} />
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>Theme</Text>
            <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{themeLabel}</Text>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </Pressable>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>About</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "cpu" as const, label: "AI Model", value: "Gemini Flash" },
            { icon: "shield" as const, label: "Privacy", value: "Data stays local" },
            { icon: "info" as const, label: "Version", value: "1.0.0" },
          ].map((item, i, arr) => (
            <React.Fragment key={item.label}>
              <View style={styles.row}>
                <Feather name={item.icon} size={18} color={colors.mutedForeground} />
                <Text style={[styles.rowLabel, { color: colors.foreground }]}>{item.label}</Text>
                <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{item.value}</Text>
              </View>
              {i < arr.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
            </React.Fragment>
          ))}
        </View>

        <Pressable onPress={handleLogout} style={[styles.logoutBtn, { borderColor: colors.destructive }]}>
          <Feather name="log-out" size={18} color={colors.destructive} />
          <Text style={[styles.logoutText, { color: colors.destructive }]}>Log Out</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={showLang} transparent animationType="slide" onRequestClose={() => setShowLang(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowLang(false)}>
          <View style={[styles.langSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.langTitle, { color: colors.foreground }]}>Select Language</Text>
            {LANGUAGES.map((l) => (
              <Pressable
                key={l.code}
                style={[
                  styles.langRow,
                  lang === l.code && { backgroundColor: `${colors.primary}15` },
                ]}
                onPress={async () => {
                  await updateProfile({ language: l.code });
                  setShowLang(false);
                }}
              >
                <Text style={styles.langFlag}>{l.flag}</Text>
                <Text style={[styles.langLabel, { color: colors.foreground }]}>{l.label}</Text>
                {lang === l.code && <Feather name="check" size={18} color={colors.primary} />}
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 28, alignItems: "center", gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  email: { fontSize: 14, fontFamily: "Inter_400Regular" },
  proBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  proBadgeText: { color: "#fff", fontSize: 12, fontFamily: "Inter_700Bold" },
  upgradeChip: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 20, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 5 },
  upgradeChipText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  proCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  proCardGradient: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  proCardIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  proCardText: { flex: 1 },
  proCardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  proCardDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
  planChip: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  planChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  divider: { height: 1, marginHorizontal: 16 },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    marginTop: 8,
  },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modalOverlay: { flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" },
  langSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 24,
    gap: 4,
  },
  langTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 12 },
  langRow: { flexDirection: "row", alignItems: "center", padding: 14, borderRadius: 12, gap: 14 },
  langFlag: { fontSize: 22 },
  langLabel: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium" },
});
