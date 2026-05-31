import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { getApiUrl } from "@/lib/query-client";

type Level = "simple" | "intermediate" | "expert";

interface ExplainResult {
  simple: string;
  intermediate: string;
  expert: string;
  keyConcepts: string[];
}

interface EvaluateResult {
  score: number;
  strengths: string[];
  gaps: string[];
  improvedExplanation: string;
  followUpQuestion: string;
}

const LEVELS: { key: Level; label: string; icon: "smile" | "book" | "award" }[] = [
  { key: "simple", label: "Simple", icon: "smile" },
  { key: "intermediate", label: "Intermediate", icon: "book" },
  { key: "expert", label: "Expert", icon: "award" },
];

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const base = getApiUrl().replace(/\/$/, "");
  const res = await fetch(`${base}api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export default function FeynmanScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const lang = user?.language ?? "en";
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [topic, setTopic] = useState("");
  const [referenceText, setReferenceText] = useState("");
  const [refName, setRefName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"learn" | "teach">("learn");
  const [level, setLevel] = useState<Level>("simple");
  const [explain, setExplain] = useState<ExplainResult | null>(null);
  const [userExplanation, setUserExplanation] = useState("");
  const [evaluation, setEvaluation] = useState<EvaluateResult | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  const handlePickPdf = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/*", "application/json", "*/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      setRefName(asset.name ?? "Document");
      if (asset.uri) {
        try {
          const content = await FileSystem.readAsStringAsync(asset.uri);
          setReferenceText(content);
        } catch {
          setReferenceText("");
        }
      }
    } catch {
      /* ignore picker errors */
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    setEvaluation(null);
    try {
      const result = await postJson<ExplainResult>("/feynman/explain", {
        topic: topic.trim(),
        text: referenceText || undefined,
        language: lang,
      });
      setExplain(result);
      setMode("learn");
      setLevel("simple");
    } catch {
      setExplain(null);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluate = async () => {
    if (!topic.trim() || !userExplanation.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEvaluating(true);
    try {
      const result = await postJson<EvaluateResult>("/feynman/evaluate", {
        topic: topic.trim(),
        explanation: userExplanation.trim(),
        language: lang,
      });
      setEvaluation(result);
    } catch {
      setEvaluation(null);
    } finally {
      setEvaluating(false);
    }
  };

  const activeExplanation = explain?.[level] ?? "";

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
    >
      <LinearGradient
        colors={isDark ? ["#1A1040", colors.background] : ["#EEF0FF", colors.background]}
        style={[styles.header, { paddingTop: topPadding + 8 }]}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.foreground }]}>Feynman Mode</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Learn simply, then teach it back
            </Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(350)} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>Topic</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.foreground }]}
            placeholder="e.g. Photosynthesis, Newton's laws..."
            placeholderTextColor={colors.mutedForeground}
            value={topic}
            onChangeText={setTopic}
          />

          <Pressable onPress={handlePickPdf} style={[styles.refBtn, { borderColor: colors.border }]}>
            <Feather name="paperclip" size={16} color={colors.primary} />
            <Text style={[styles.refBtnText, { color: colors.foreground }]}>
              {refName || "Attach PDF / text (optional)"}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleGenerate}
            disabled={loading || !topic.trim()}
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: loading || !topic.trim() ? 0.6 : 1 }]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="zap" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Generate explanations</Text>
              </>
            )}
          </Pressable>
        </Animated.View>

        {explain && (
          <>
            <View style={styles.modeRow}>
              {(["learn", "teach"] as const).map((m) => (
                <Pressable
                  key={m}
                  onPress={() => setMode(m)}
                  style={[
                    styles.modeTab,
                    {
                      backgroundColor: mode === m ? colors.primary : colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={{ color: mode === m ? "#fff" : colors.foreground, fontFamily: "Inter_600SemiBold", fontSize: 13 }}>
                    {m === "learn" ? "Learn" : "Teach it back"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {mode === "learn" ? (
              <Animated.View entering={FadeInDown.duration(400)}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.levelRow}>
                  {LEVELS.map((l) => (
                    <Pressable
                      key={l.key}
                      onPress={() => setLevel(l.key)}
                      style={[
                        styles.levelChip,
                        {
                          backgroundColor: level === l.key ? `${colors.primary}20` : colors.card,
                          borderColor: level === l.key ? colors.primary : colors.border,
                        },
                      ]}
                    >
                      <Feather name={l.icon} size={14} color={level === l.key ? colors.primary : colors.mutedForeground} />
                      <Text style={[styles.levelChipText, { color: level === l.key ? colors.primary : colors.foreground }]}>
                        {l.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>

                {explain.keyConcepts.length > 0 && (
                  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Key concepts</Text>
                    <View style={styles.conceptRow}>
                      {explain.keyConcepts.map((c) => (
                        <View key={c} style={[styles.conceptPill, { backgroundColor: `${colors.primary}15` }]}>
                          <Text style={[styles.conceptText, { color: colors.primary }]}>{c}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                    {LEVELS.find((l) => l.key === level)?.label} explanation
                  </Text>
                  <Text style={[styles.bodyText, { color: colors.foreground }]}>{activeExplanation}</Text>
                </View>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInDown.duration(400)}>
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Explain in your own words</Text>
                  <Text style={[styles.hint, { color: colors.mutedForeground }]}>
                    Pretend you're teaching a friend. The AI will score your understanding.
                  </Text>
                  <TextInput
                    style={[styles.textArea, { backgroundColor: colors.surfaceAlt, borderColor: colors.border, color: colors.foreground }]}
                    placeholder="Write your explanation here..."
                    placeholderTextColor={colors.mutedForeground}
                    value={userExplanation}
                    onChangeText={setUserExplanation}
                    multiline
                    textAlignVertical="top"
                  />
                  <Pressable
                    onPress={handleEvaluate}
                    disabled={evaluating || !userExplanation.trim()}
                    style={[styles.primaryBtn, { backgroundColor: "#00D4AA", opacity: evaluating || !userExplanation.trim() ? 0.6 : 1 }]}
                  >
                    {evaluating ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Feather name="check-circle" size={18} color="#fff" />
                        <Text style={styles.primaryBtnText}>Submit & get feedback</Text>
                      </>
                    )}
                  </Pressable>
                </View>

                {evaluation && (
                  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={styles.scoreRow}>
                      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Your score</Text>
                      <LinearGradient colors={["#7B7FFF", "#00D4AA"]} style={styles.scoreBadge}>
                        <Text style={styles.scoreText}>{evaluation.score}</Text>
                      </LinearGradient>
                    </View>

                    {evaluation.strengths.length > 0 && (
                      <>
                        <Text style={[styles.subSection, { color: colors.primary }]}>Strengths</Text>
                        {evaluation.strengths.map((s) => (
                          <Text key={s} style={[styles.bullet, { color: colors.foreground }]}>• {s}</Text>
                        ))}
                      </>
                    )}

                    {evaluation.gaps.length > 0 && (
                      <>
                        <Text style={[styles.subSection, { color: "#F97316" }]}>Gaps to fill</Text>
                        {evaluation.gaps.map((g) => (
                          <Text key={g} style={[styles.bullet, { color: colors.foreground }]}>• {g}</Text>
                        ))}
                      </>
                    )}

                    <Text style={[styles.subSection, { color: colors.foreground }]}>Improved version</Text>
                    <Text style={[styles.bodyText, { color: colors.mutedForeground }]}>{evaluation.improvedExplanation}</Text>

                    <View style={[styles.followUp, { backgroundColor: `${colors.primary}12`, borderColor: `${colors.primary}30` }]}>
                      <Feather name="help-circle" size={16} color={colors.primary} />
                      <Text style={[styles.followUpText, { color: colors.foreground }]}>{evaluation.followUpQuestion}</Text>
                    </View>
                  </View>
                )}
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 12 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerText: { flex: 1 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  content: { padding: 16, gap: 14 },
  card: { borderRadius: 20, borderWidth: 1, padding: 18, gap: 12 },
  label: { fontSize: 12, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  input: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, fontFamily: "Inter_400Regular" },
  refBtn: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, borderStyle: "dashed" },
  refBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", flex: 1 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 4 },
  primaryBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  modeRow: { flexDirection: "row", gap: 10 },
  modeTab: { flex: 1, alignItems: "center", paddingVertical: 12, borderRadius: 14, borderWidth: 1 },
  levelRow: { gap: 8, paddingVertical: 4 },
  levelChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  levelChipText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 17, fontFamily: "Inter_700Bold" },
  subSection: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 8 },
  bodyText: { fontSize: 15, fontFamily: "Inter_400Regular", lineHeight: 24 },
  hint: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 19 },
  textArea: { minHeight: 140, borderRadius: 14, borderWidth: 1, padding: 14, fontSize: 15, fontFamily: "Inter_400Regular" },
  conceptRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  conceptPill: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  conceptText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  scoreBadge: { width: 56, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  scoreText: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  bullet: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22, marginTop: 4 },
  followUp: { flexDirection: "row", gap: 10, alignItems: "flex-start", borderRadius: 14, borderWidth: 1, padding: 14, marginTop: 12 },
  followUpText: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium", lineHeight: 21 },
});
