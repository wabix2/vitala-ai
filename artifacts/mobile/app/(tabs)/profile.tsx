import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { LANGUAGES, t } from "@/lib/i18n";

export default function ProfileScreen() {
  const colors = useColors();
  const { isDark, mode, setMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { user, logout, updateProfile } = useAuth();
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
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 4 },
  section: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, padding: 16 },
  rowLabel: { flex: 1, fontSize: 15, fontFamily: "Inter_500Medium" },
  rowValue: { fontSize: 14, fontFamily: "Inter_400Regular" },
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
