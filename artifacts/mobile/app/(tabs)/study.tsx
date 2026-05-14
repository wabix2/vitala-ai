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
import { useSubscription } from "@/lib/revenuecat";

const TOOLS = [
  { icon: "layers" as const, label: "Flashcards", desc: "Generate study cards from any topic", color: "#7B7FFF", route: "/study/flashcards", badge: "AI", pro: false },
  { icon: "check-square" as const, label: "Quiz Generator", desc: "Test your knowledge with MCQ quizzes", color: "#00D4AA", route: "/study/quiz", badge: "AI", pro: false },
  { icon: "edit-3" as const, label: "Extended Flashcards", desc: "Up to 30 cards per set — deep dive study", color: "#F97316", route: "/study/flashcards", badge: "Pro", pro: true },
  { icon: "bar-chart-2" as const, label: "Extended Quizzes", desc: "Up to 20 questions for thorough testing", color: "#EC4899", route: "/study/quiz", badge: "Pro", pro: true },
  { icon: "clock" as const, label: "Focus Timer", desc: "Pomodoro timer to maximize study sessions", color: "#8B5CF6", route: "/timer", badge: "Pro", pro: true },
  { icon: "calendar" as const, label: "AI Study Plan", desc: "Get a personalized 7-day study schedule", color: "#14B8A6", route: "/study-plan", badge: "Pro", pro: true },
];

export default function StudyScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const lang = user?.language ?? "en";
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? ["#0F1729", colors.background] : ["#EEF0FF", colors.background]}
        style={[styles.header, { paddingTop: topPadding + 12 }]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>{t("study", lang)}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>AI-powered study tools</Text>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { paddingBottom: 100 }]} showsVerticalScrollIndicator={false}>
        {TOOLS.map((tool, i) => {
          const isLocked = tool.pro && !isSubscribed;
          return (
            <Animated.View key={tool.label} entering={FadeInDown.duration(400).delay(i * 70)}>
              <Pressable
                onPress={() => isLocked ? router.push("/paywall") : router.push(tool.route as never)}
                style={[styles.card, { backgroundColor: colors.card, borderColor: isLocked ? `${tool.color}40` : colors.border }]}
              >
                <LinearGradient colors={[`${tool.color}20`, `${tool.color}08`]} style={styles.cardGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <View style={styles.cardRow}>
                    <View style={[styles.iconBox, { backgroundColor: `${tool.color}20` }]}>
                      <Feather name={tool.icon} size={26} color={isLocked ? `${tool.color}80` : tool.color} />
                    </View>
                    <View style={styles.cardText}>
                      <View style={styles.labelRow}>
                        <Text style={[styles.cardTitle, { color: isLocked ? colors.mutedForeground : colors.foreground }]}>{tool.label}</Text>
                        <View style={[styles.badge, { backgroundColor: `${tool.color}25` }]}>
                          {tool.pro && <Feather name="zap" size={10} color={tool.color} />}
                          <Text style={[styles.badgeText, { color: tool.color }]}>{tool.badge}</Text>
                        </View>
                      </View>
                      <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{tool.desc}</Text>
                    </View>
                    {isLocked ? <Feather name="lock" size={18} color={`${tool.color}60`} /> : <Feather name="chevron-right" size={20} color={colors.mutedForeground} />}
                  </View>
                </LinearGradient>
              </Pressable>
            </Animated.View>
          );
        })}

        {!isSubscribed && (
          <Animated.View entering={FadeInDown.duration(400).delay(TOOLS.length * 70)}>
            <Pressable style={[styles.proCallout, { backgroundColor: "#7B7FFF12", borderColor: "#7B7FFF30" }]} onPress={() => router.push("/paywall")}>
              <LinearGradient colors={["#7B7FFF20", "#00D4AA10"]} style={styles.proCalloutInner} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <View style={[styles.proCalloutIcon, { backgroundColor: "#7B7FFF20" }]}>
                  <Feather name="zap" size={22} color="#7B7FFF" />
                </View>
                <View style={styles.proCalloutText}>
                  <Text style={[styles.proCalloutTitle, { color: colors.foreground }]}>Unlock all 4 Pro tools</Text>
                  <Text style={[styles.proCalloutDesc, { color: colors.mutedForeground }]}>Timer, study plan, extended quizzes & flashcards</Text>
                </View>
                <Feather name="arrow-right" size={18} color="#7B7FFF" />
              </LinearGradient>
            </Pressable>
          </Animated.View>
        )}
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
  cardRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, backgroundColor: "transparent" },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardText: { flex: 1, gap: 4 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  cardDesc: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  proCallout: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  proCalloutInner: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  proCalloutIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  proCalloutText: { flex: 1 },
  proCalloutTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  proCalloutDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
