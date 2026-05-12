import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
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
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { useListGeminiConversations } from "@workspace/api-client-react";
import { t } from "@/lib/i18n";

const QUICK_ACTIONS = [
  { icon: "message-circle" as const, label: "New Chat", route: "/(tabs)/chat" as const, color: "#7B7FFF" },
  { icon: "layers" as const, label: "Flashcards", route: "/study/flashcards" as const, color: "#00D4AA" },
  { icon: "check-circle" as const, label: "Quiz", route: "/study/quiz" as const, color: "#F97316" },
  { icon: "file-text" as const, label: "PDF AI", route: "/(tabs)/pdf" as const, color: "#EC4899" },
];

const STUDY_TIPS = [
  "Spaced repetition improves retention by 200%",
  "Teach what you learn to solidify knowledge",
  "Break study sessions into 25-minute blocks",
  "Review notes within 24 hours to retain 80%",
];

export default function HomeScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const lang = user?.language ?? "en";
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: conversations } = useListGeminiConversations();
  const recentCount = conversations?.length ?? 0;
  const tip = STUDY_TIPS[new Date().getDate() % STUDY_TIPS.length]!;

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
          <View style={[styles.avatar, { backgroundColor: user?.avatarColor ?? colors.primary }]}>
            <Text style={styles.avatarText}>{firstName[0]?.toUpperCase()}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(400).delay(100)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Quick Actions
          </Text>
          <View style={styles.grid}>
            {QUICK_ACTIONS.map((action, i) => (
              <Pressable
                key={action.label}
                onPress={() => router.push(action.route as never)}
                style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.actionIcon, { backgroundColor: `${action.color}18` }]}>
                  <Feather name={action.icon} size={24} color={action.color} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>
                  {action.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(200)}>
          <LinearGradient
            colors={isDark ? ["#1A2040", "#141E35"] : ["#EEF0FF", "#E8EBFF"]}
            style={[styles.statsCard, { borderColor: colors.border }]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statRow}>
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: colors.primary }]}>{recentCount}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Chats</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: "#00D4AA" }]}>
                  {lang.toUpperCase()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Language</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.stat}>
                <Text style={[styles.statNum, { color: "#F97316" }]}>AI</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Powered</Text>
              </View>
            </View>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Today's Tip
          </Text>
          <View style={[styles.tipCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="zap" size={18} color="#F97316" />
            <Text style={[styles.tipText, { color: colors.foreground }]}>{tip}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(400).delay(400)}>
          <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>
            Study Tools
          </Text>
          {[
            { icon: "book" as const, label: "Homework Helper", desc: "Get step-by-step help", color: "#7B7FFF", route: "/(tabs)/chat" as const },
            { icon: "edit-3" as const, label: "Notes Summarizer", desc: "Condense your notes with AI", color: "#00D4AA", route: "/study/flashcards" as const },
          ].map((item) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.route as never)}
              style={[styles.toolRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
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
  header: { paddingBottom: 20, paddingHorizontal: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 2 },
  name: { fontSize: 26, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 18 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 12, gap: 20 },
  sectionTitle: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  actionCard: {
    width: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "flex-start",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  actionIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
  },
  statRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  stat: { alignItems: "center", gap: 4 },
  statNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statDivider: { width: 1, height: 32 },
  tipCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  tipText: { fontSize: 14, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 21 },
  toolRow: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 10,
  },
  toolIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  toolText: { flex: 1, gap: 2 },
  toolLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  toolDesc: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
