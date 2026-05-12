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
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { t } from "@/lib/i18n";

const TOOLS = [
  {
    icon: "layers" as const,
    label: "Flashcards",
    desc: "Generate study cards from any topic",
    color: "#7B7FFF",
    route: "/study/flashcards",
    badge: "AI",
  },
  {
    icon: "check-square" as const,
    label: "Quiz Generator",
    desc: "Test your knowledge with MCQ quizzes",
    color: "#00D4AA",
    route: "/study/quiz",
    badge: "AI",
  },
  {
    icon: "edit-3" as const,
    label: "Notes Summarizer",
    desc: "Condense long notes into key points",
    color: "#F97316",
    route: "/study/flashcards",
    badge: "AI",
  },
  {
    icon: "book" as const,
    label: "Homework Helper",
    desc: "Step-by-step solutions for any subject",
    color: "#EC4899",
    route: "/(tabs)/chat",
    badge: "Chat",
  },
];

export default function StudyScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const lang = user?.language ?? "en";
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ["#0F1729", colors.background] : ["#EEF0FF", colors.background]}
        style={[styles.header, { paddingTop: topPadding + 12 }]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>{t("study", lang)}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          AI-powered study tools
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {TOOLS.map((tool, i) => (
          <Animated.View key={tool.label} entering={FadeInDown.duration(400).delay(i * 80)}>
            <Pressable
              onPress={() => router.push(tool.route as never)}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <LinearGradient
                colors={[`${tool.color}20`, `${tool.color}08`]}
                style={styles.cardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.cardRow}>
                  <View style={[styles.iconBox, { backgroundColor: `${tool.color}20` }]}>
                    <Feather name={tool.icon} size={26} color={tool.color} />
                  </View>
                  <View style={styles.cardText}>
                    <View style={styles.labelRow}>
                      <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                        {tool.label}
                      </Text>
                      <View style={[styles.badge, { backgroundColor: `${tool.color}20` }]}>
                        <Text style={[styles.badgeText, { color: tool.color }]}>{tool.badge}</Text>
                      </View>
                    </View>
                    <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
                      {tool.desc}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={20} color={colors.mutedForeground} />
                </View>
              </LinearGradient>
            </Pressable>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  card: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  cardGradient: { padding: 4 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    padding: 14,
    backgroundColor: "transparent",
  },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardText: { flex: 1, gap: 4 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
});
