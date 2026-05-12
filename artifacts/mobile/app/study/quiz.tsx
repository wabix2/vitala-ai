import { Feather } from "@expo/vector-icons";
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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGenerateQuiz } from "@workspace/api-client-react";
import { QuizCard } from "@/components/QuizCard";

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export default function QuizScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const lang = user?.language ?? "en";

  const [topic, setTopic] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const generateQuiz = useGenerateQuiz();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await generateQuiz.mutateAsync({ topic: topic.trim(), language: lang, count: 5 });
      setQuestions((res.questions as Question[]) ?? []);
      setCurrentIndex(0);
      setScore(0);
      setFinished(false);
    } catch {}
  };

  const handleAnswer = (correct: boolean) => {
    if (correct) setScore((s) => s + 1);
    if (currentIndex < questions.length - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 1500);
    } else {
      setTimeout(() => setFinished(true), 1500);
    }
  };

  const handleReset = () => {
    setQuestions([]);
    setTopic("");
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
  };

  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const resultColor = percentage >= 80 ? "#22C55E" : percentage >= 60 ? "#F97316" : "#EF4444";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Quiz</Text>
        {questions.length > 0 && !finished && (
          <Text style={[styles.progress, { color: colors.primary }]}>
            {currentIndex + 1}/{questions.length}
          </Text>
        )}
        {!questions.length && <View style={styles.placeholder} />}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!questions.length && (
          <>
            <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.foreground }]}
                placeholder="Enter topic for quiz..."
                placeholderTextColor={colors.mutedForeground}
                value={topic}
                onChangeText={setTopic}
                onSubmitEditing={handleGenerate}
                returnKeyType="done"
              />
              <Pressable
                onPress={handleGenerate}
                disabled={!topic.trim() || generateQuiz.isPending}
                style={[styles.genBtn, { backgroundColor: "#00D4AA" }]}
              >
                {generateQuiz.isPending ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Feather name="zap" size={18} color="#fff" />
                )}
              </Pressable>
            </View>

            {generateQuiz.isPending && (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={colors.primary} size="large" />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                  Generating quiz...
                </Text>
              </View>
            )}

            {!generateQuiz.isPending && (
              <View style={styles.emptyState}>
                <View style={[styles.emptyIcon, { backgroundColor: "#00D4AA18" }]}>
                  <Feather name="check-square" size={32} color="#00D4AA" />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Quiz Generator</Text>
                <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
                  Enter any topic and AI will generate a multiple-choice quiz for you
                </Text>
              </View>
            )}
          </>
        )}

        {questions.length > 0 && !finished && (
          <QuizCard
            question={questions[currentIndex]!}
            index={currentIndex}
            total={questions.length}
            onAnswer={handleAnswer}
          />
        )}

        {finished && (
          <Animated.View entering={FadeInDown.duration(500)} style={styles.resultCard}>
            <LinearGradient
              colors={[`${resultColor}20`, `${resultColor}08`]}
              style={[styles.resultGradient, { borderColor: `${resultColor}40` }]}
            >
              <View style={[styles.scoreCircle, { borderColor: resultColor }]}>
                <Text style={[styles.scoreNum, { color: resultColor }]}>{percentage}%</Text>
              </View>
              <Text style={[styles.resultTitle, { color: colors.foreground }]}>
                {percentage >= 80 ? "Excellent!" : percentage >= 60 ? "Good effort!" : "Keep studying!"}
              </Text>
              <Text style={[styles.resultDesc, { color: colors.mutedForeground }]}>
                You answered {score} out of {questions.length} correctly
              </Text>
              <View style={styles.resultBtns}>
                <Pressable
                  onPress={() => { setCurrentIndex(0); setScore(0); setFinished(false); }}
                  style={[styles.retryBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  <Feather name="rotate-ccw" size={16} color={colors.foreground} />
                  <Text style={[styles.retryText, { color: colors.foreground }]}>Retry</Text>
                </Pressable>
                <Pressable
                  onPress={handleReset}
                  style={[styles.newBtn, { backgroundColor: "#00D4AA" }]}
                >
                  <Text style={styles.newBtnText}>New Quiz</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  progress: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  placeholder: { width: 30 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    height: 52,
  },
  input: { flex: 1, paddingHorizontal: 16, fontSize: 15, fontFamily: "Inter_400Regular" },
  genBtn: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  loadingBox: { alignItems: "center", gap: 12, paddingVertical: 40 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  resultCard: { flex: 1 },
  resultGradient: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 36,
    alignItems: "center",
    gap: 16,
  },
  scoreCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNum: { fontSize: 28, fontFamily: "Inter_700Bold" },
  resultTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  resultDesc: { fontSize: 15, fontFamily: "Inter_400Regular" },
  resultBtns: { flexDirection: "row", gap: 12, marginTop: 8, width: "100%" },
  retryBtn: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  retryText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  newBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  newBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
