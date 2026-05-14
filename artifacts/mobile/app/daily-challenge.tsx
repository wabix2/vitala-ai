import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState, useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp, ZoomIn } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useStreak } from "@/context/StreakContext";

interface Question {
  category: string;
  question: string;
  options: string[];
  answer: number;
  explanation: string;
  color: string;
}

const QUESTIONS: Question[] = [
  { category: "Science", question: "Which planet has the most moons in our solar system?", options: ["Jupiter", "Saturn", "Uranus", "Neptune"], answer: 1, explanation: "Saturn has 146 confirmed moons, surpassing Jupiter's 95 as of 2023.", color: "#7B7FFF" },
  { category: "Math", question: "What is the derivative of sin(x)?", options: ["-cos(x)", "cos(x)", "-sin(x)", "tan(x)"], answer: 1, explanation: "The derivative of sin(x) is cos(x). This is a fundamental rule in calculus.", color: "#00D4AA" },
  { category: "History", question: "In what year did World War II end?", options: ["1943", "1944", "1945", "1946"], answer: 2, explanation: "WWII ended in 1945 — Germany surrendered in May and Japan in September.", color: "#F97316" },
  { category: "Biology", question: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi apparatus"], answer: 2, explanation: "Mitochondria produce ATP through cellular respiration, earning the nickname 'powerhouse of the cell.'", color: "#EC4899" },
  { category: "Literature", question: "Who wrote '1984'?", options: ["Aldous Huxley", "George Orwell", "Ray Bradbury", "H.G. Wells"], answer: 1, explanation: "George Orwell wrote '1984' in 1949, a dystopian novel about totalitarian surveillance.", color: "#8B5CF6" },
  { category: "Physics", question: "What is the speed of light in a vacuum?", options: ["3×10⁸ m/s", "3×10⁶ m/s", "3×10¹⁰ m/s", "3×10⁴ m/s"], answer: 0, explanation: "Light travels at approximately 299,792,458 m/s (≈3×10⁸ m/s) in a vacuum.", color: "#14B8A6" },
  { category: "Geography", question: "Which is the world's largest ocean?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], answer: 3, explanation: "The Pacific Ocean covers about 165 million km², more than all land on Earth combined.", color: "#F59E0B" },
  { category: "Chemistry", question: "What is the atomic number of Carbon?", options: ["4", "6", "8", "12"], answer: 1, explanation: "Carbon has atomic number 6, meaning it has 6 protons. It's the basis of all organic life.", color: "#7B7FFF" },
  { category: "Programming", question: "What does 'HTTP' stand for?", options: ["HyperText Transfer Protocol", "High Tech Transfer Process", "HyperText Transit Program", "Host Transfer Text Protocol"], answer: 0, explanation: "HTTP stands for HyperText Transfer Protocol — the foundation of data communication on the Web.", color: "#00D4AA" },
  { category: "Math", question: "What is π (pi) approximately equal to?", options: ["3.1215", "3.1416", "3.1618", "3.1814"], answer: 1, explanation: "Pi (π) ≈ 3.14159265... It represents the ratio of a circle's circumference to its diameter.", color: "#F97316" },
  { category: "Astronomy", question: "How long does light from the Sun take to reach Earth?", options: ["8 seconds", "8 minutes", "8 hours", "8 days"], answer: 1, explanation: "Sunlight takes about 8 minutes and 20 seconds to travel the 150 million km to Earth.", color: "#EC4899" },
  { category: "Biology", question: "How many chromosomes do humans have?", options: ["23", "44", "46", "48"], answer: 2, explanation: "Humans have 46 chromosomes arranged in 23 pairs — 22 autosomes and 1 sex chromosome pair.", color: "#8B5CF6" },
  { category: "History", question: "Who was the first person to walk on the moon?", options: ["Buzz Aldrin", "Neil Armstrong", "Yuri Gagarin", "John Glenn"], answer: 1, explanation: "Neil Armstrong became the first human to walk on the moon on July 20, 1969 during Apollo 11.", color: "#14B8A6" },
  { category: "Math", question: "What is the sum of angles in a triangle?", options: ["90°", "180°", "270°", "360°"], answer: 1, explanation: "The interior angles of any triangle always add up to 180 degrees.", color: "#F59E0B" },
  { category: "Science", question: "What gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2, explanation: "Plants absorb CO₂ and water, using sunlight to produce glucose and oxygen through photosynthesis.", color: "#7B7FFF" },
  { category: "Programming", question: "Which data structure uses LIFO order?", options: ["Queue", "Stack", "Linked List", "Tree"], answer: 1, explanation: "A Stack uses Last In First Out (LIFO) — the last element added is the first one removed.", color: "#00D4AA" },
  { category: "Geography", question: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Brisbane", "Canberra"], answer: 3, explanation: "Canberra is Australia's capital. It was purpose-built as a compromise between Sydney and Melbourne.", color: "#F97316" },
  { category: "Physics", question: "What is Newton's Second Law of Motion?", options: ["F = ma", "E = mc²", "v = u + at", "p = mv"], answer: 0, explanation: "F = ma: Force equals mass times acceleration. It explains how the velocity of an object changes.", color: "#EC4899" },
  { category: "Literature", question: "Shakespeare wrote how many plays?", options: ["27", "31", "37", "42"], answer: 2, explanation: "Shakespeare wrote 37 plays, 154 sonnets, and several longer poems during his lifetime.", color: "#8B5CF6" },
  { category: "Chemistry", question: "What is the chemical formula for water?", options: ["HO", "H₂O", "H₂O₂", "OH"], answer: 1, explanation: "Water is H₂O — two hydrogen atoms bonded to one oxygen atom.", color: "#14B8A6" },
  { category: "Math", question: "What is the square root of 144?", options: ["11", "12", "13", "14"], answer: 1, explanation: "√144 = 12, because 12 × 12 = 144.", color: "#F59E0B" },
  { category: "Biology", question: "What organ produces insulin?", options: ["Liver", "Kidney", "Pancreas", "Stomach"], answer: 2, explanation: "The pancreas produces insulin, which regulates blood sugar levels in the body.", color: "#7B7FFF" },
  { category: "Science", question: "What is the hardest natural substance on Earth?", options: ["Gold", "Iron", "Quartz", "Diamond"], answer: 3, explanation: "Diamond scores 10 on the Mohs hardness scale, making it the hardest natural material.", color: "#00D4AA" },
  { category: "History", question: "The Great Wall of China was primarily built to defend against who?", options: ["Mongol invasions", "Japanese attacks", "Persian armies", "Roman legions"], answer: 0, explanation: "The Great Wall was built to protect Chinese states from Mongol and other nomadic invasions from the north.", color: "#F97316" },
  { category: "Programming", question: "What does CSS stand for?", options: ["Computer Style Sheets", "Cascading Style Sheets", "Creative Style System", "Coded Style Syntax"], answer: 1, explanation: "CSS stands for Cascading Style Sheets — it controls the visual presentation of HTML elements.", color: "#EC4899" },
  { category: "Physics", question: "What is the unit of electrical resistance?", options: ["Volt", "Ampere", "Watt", "Ohm"], answer: 3, explanation: "The Ohm (Ω) is the SI unit of electrical resistance, named after Georg Simon Ohm.", color: "#8B5CF6" },
  { category: "Geography", question: "Which is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], answer: 1, explanation: "The Nile River is approximately 6,650 km long, making it the world's longest river.", color: "#14B8A6" },
  { category: "Math", question: "What is 15% of 200?", options: ["20", "25", "30", "35"], answer: 2, explanation: "15% of 200 = 0.15 × 200 = 30.", color: "#F59E0B" },
  { category: "Chemistry", question: "What element has the symbol 'Fe'?", options: ["Fluorine", "Francium", "Iron", "Fermium"], answer: 2, explanation: "Fe comes from 'Ferrum', the Latin word for Iron. Iron has atomic number 26.", color: "#7B7FFF" },
  { category: "Biology", question: "What is the largest organ in the human body?", options: ["Liver", "Brain", "Lungs", "Skin"], answer: 3, explanation: "The skin is the largest organ, covering about 2 square meters and weighing 3-4 kg in adults.", color: "#00D4AA" },
];

function getTodayQuestion(): Question {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  return QUESTIONS[dayOfYear % QUESTIONS.length]!;
}

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

type State = "question" | "correct" | "wrong";

export default function DailyChallengeScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { streak, recordSession, markDailyChallengeComplete, hasDoneChallenge } = useStreak();

  const question = useMemo(() => getTodayQuestion(), []);
  const [selected, setSelected] = useState<number | null>(null);
  const [state, setState] = useState<State>("question");
  const alreadyDone = hasDoneChallenge(getTodayKey());

  const handleSelect = async (idx: number) => {
    if (state !== "question" || alreadyDone) return;
    setSelected(idx);
    const correct = idx === question.answer;
    setState(correct ? "correct" : "wrong");
    await Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    if (correct) {
      await recordSession(5);
      await markDailyChallengeComplete(getTodayKey());
    }
  };

  const optionStyle = (idx: number) => {
    if (state === "question") {
      return {
        backgroundColor: selected === idx ? `${question.color}20` : colors.card,
        borderColor: selected === idx ? question.color : colors.border,
      };
    }
    if (idx === question.answer) return { backgroundColor: "#00D4AA20", borderColor: "#00D4AA" };
    if (idx === selected && idx !== question.answer) return { backgroundColor: "#FF444415", borderColor: "#FF4444" };
    return { backgroundColor: colors.card, borderColor: colors.border };
  };

  const optionIcon = (idx: number) => {
    if (state === "question") return null;
    if (idx === question.answer) return <Feather name="check-circle" size={18} color="#00D4AA" />;
    if (idx === selected && idx !== question.answer) return <Feather name="x-circle" size={18} color="#FF4444" />;
    return null;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: Platform.OS === "web" ? 80 : insets.top + 16 }]}>
        <Pressable onPress={() => router.back()}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Daily Challenge</Text>
        <Pressable onPress={() => router.push("/leaderboard" as never)}>
          <Feather name="award" size={22} color={question.color} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(400)} style={styles.heroSection}>
          <LinearGradient
            colors={[`${question.color}25`, `${question.color}08`]}
            style={[styles.heroBg, { borderColor: `${question.color}30` }]}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <View style={styles.heroTop}>
              <View style={[styles.categoryBadge, { backgroundColor: `${question.color}20` }]}>
                <Feather name="book-open" size={12} color={question.color} />
                <Text style={[styles.categoryText, { color: question.color }]}>{question.category}</Text>
              </View>
              <View style={[styles.streakBadge, { backgroundColor: "#F9731618" }]}>
                <Feather name="zap" size={12} color="#F97316" />
                <Text style={styles.streakBadgeText}>{streak} day streak</Text>
              </View>
            </View>
            <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </Text>
            <Text style={[styles.questionText, { color: colors.foreground }]}>{question.question}</Text>
          </LinearGradient>
        </Animated.View>

        {alreadyDone && state === "question" && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={[styles.doneBanner, { backgroundColor: "#00D4AA15", borderColor: "#00D4AA40" }]}>
              <Feather name="check-circle" size={18} color="#00D4AA" />
              <Text style={[styles.doneBannerText, { color: "#00D4AA" }]}>
                You already completed today's challenge! Come back tomorrow.
              </Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(100)} style={styles.optionsSection}>
          {question.options.map((opt, idx) => (
            <Pressable
              key={idx}
              onPress={() => handleSelect(idx)}
              style={[styles.option, optionStyle(idx)]}
              disabled={state !== "question" || alreadyDone}
            >
              <View style={[styles.optionLetter, {
                backgroundColor: state === "question" ? `${question.color}15` : idx === question.answer ? "#00D4AA20" : idx === selected ? "#FF444415" : colors.surfaceAlt,
              }]}>
                <Text style={[styles.optionLetterText, {
                  color: state === "question" ? question.color : idx === question.answer ? "#00D4AA" : idx === selected ? "#FF4444" : colors.mutedForeground,
                }]}>
                  {String.fromCharCode(65 + idx)}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: colors.foreground, flex: 1 }]}>{opt}</Text>
              {optionIcon(idx)}
            </Pressable>
          ))}
        </Animated.View>

        {state !== "question" && (
          <Animated.View entering={ZoomIn.duration(400)} style={styles.resultSection}>
            <LinearGradient
              colors={state === "correct" ? ["#00D4AA20", "#00D4AA08"] : ["#FF444415", "#FF444408"]}
              style={[styles.resultCard, { borderColor: state === "correct" ? "#00D4AA40" : "#FF444430" }]}
            >
              <View style={styles.resultHeader}>
                <View style={[styles.resultIcon, { backgroundColor: state === "correct" ? "#00D4AA20" : "#FF444415" }]}>
                  <Feather
                    name={state === "correct" ? "check-circle" : "x-circle"}
                    size={28}
                    color={state === "correct" ? "#00D4AA" : "#FF4444"}
                  />
                </View>
                <View style={styles.resultTextWrap}>
                  <Text style={[styles.resultTitle, { color: state === "correct" ? "#00D4AA" : "#FF4444" }]}>
                    {state === "correct" ? "Correct! +1 streak" : "Not quite!"}
                  </Text>
                  <Text style={[styles.resultSubtitle, { color: colors.mutedForeground }]}>
                    {state === "correct" ? "Your streak is maintained" : `Answer: ${question.options[question.answer]}`}
                  </Text>
                </View>
              </View>
              <Text style={[styles.explanation, { color: colors.foreground }]}>{question.explanation}</Text>
            </LinearGradient>

            <View style={styles.resultActions}>
              <Pressable
                style={[styles.leaderboardBtn, { backgroundColor: question.color }]}
                onPress={() => router.push("/leaderboard" as never)}
              >
                <Feather name="award" size={18} color="#fff" />
                <Text style={styles.leaderboardBtnText}>View Leaderboard</Text>
              </Pressable>
              <Pressable
                style={[styles.backBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => router.back()}
              >
                <Text style={[styles.backBtnText, { color: colors.foreground }]}>Back to Home</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(400).delay(300)}>
          <Pressable
            style={[styles.leaderboardTease, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push("/leaderboard" as never)}
          >
            <View style={[styles.leaderboardTeaseIcon, { backgroundColor: `${question.color}15` }]}>
              <Feather name="award" size={20} color={question.color} />
            </View>
            <View style={styles.leaderboardTeaseText}>
              <Text style={[styles.leaderboardTeaseTitle, { color: colors.foreground }]}>Streak Leaderboard</Text>
              <Text style={[styles.leaderboardTeaseDesc, { color: colors.mutedForeground }]}>
                See how your {streak}-day streak ranks globally
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </Pressable>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  heroSection: {},
  heroBg: { borderRadius: 24, padding: 20, gap: 14, borderWidth: 1 },
  heroTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  categoryBadge: { flexDirection: "row", alignItems: "center", gap: 5, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  categoryText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  streakBadge: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  streakBadgeText: { color: "#F97316", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  dateText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  questionText: { fontSize: 20, fontFamily: "Inter_700Bold", lineHeight: 29, letterSpacing: -0.3 },
  doneBanner: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 12, borderWidth: 1, padding: 14 },
  doneBannerText: { flex: 1, fontSize: 13, fontFamily: "Inter_500Medium" },
  optionsSection: { gap: 10 },
  option: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1.5, padding: 14 },
  optionLetter: { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  optionLetterText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  optionText: { fontSize: 15, fontFamily: "Inter_500Medium", lineHeight: 21 },
  resultSection: { gap: 12 },
  resultCard: { borderRadius: 20, borderWidth: 1, padding: 20, gap: 12 },
  resultHeader: { flexDirection: "row", alignItems: "flex-start", gap: 14 },
  resultIcon: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  resultTextWrap: { flex: 1, gap: 3 },
  resultTitle: { fontSize: 18, fontFamily: "Inter_700Bold" },
  resultSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular" },
  explanation: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 22 },
  resultActions: { gap: 10 },
  leaderboardBtn: { borderRadius: 14, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  leaderboardBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  backBtn: { borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center" },
  backBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  leaderboardTease: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 16 },
  leaderboardTeaseIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  leaderboardTeaseText: { flex: 1 },
  leaderboardTeaseTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  leaderboardTeaseDesc: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
});
