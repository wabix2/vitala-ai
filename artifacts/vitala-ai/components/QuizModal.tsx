import * as Haptics from "expo-haptics";
import React, { useCallback, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";

interface Question {
  q: string;
  options: string[];
  answer: number;
}

const QUESTION_BANK: Record<string, Question[]> = {
  Biology: [
    { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi body"], answer: 1 },
    { q: "What gas do plants absorb during photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"], answer: 2 },
    { q: "What is the basic unit of life?", options: ["Atom", "Organ", "Cell", "Tissue"], answer: 2 },
    { q: "Which protein carries oxygen in red blood cells?", options: ["Insulin", "Keratin", "Hemoglobin", "Collagen"], answer: 2 },
    { q: "How many chromosomes do humans normally have?", options: ["23", "46", "44", "48"], answer: 1 },
    { q: "Which organ produces insulin?", options: ["Liver", "Kidney", "Heart", "Pancreas"], answer: 3 },
    { q: "What is the function of ribosomes?", options: ["Energy production", "Protein synthesis", "DNA replication", "Digestion"], answer: 1 },
    { q: "Which blood type is the universal donor?", options: ["A+", "B-", "O-", "AB+"], answer: 2 },
    { q: "What part of the plant cell is not found in animal cells?", options: ["Mitochondria", "Cell membrane", "Cell wall", "Nucleus"], answer: 2 },
    { q: "What is the process of cell division called?", options: ["Osmosis", "Meiosis / Mitosis", "Photosynthesis", "Respiration"], answer: 1 },
  ],
  Math: [
    { q: "What is π approximately equal to?", options: ["2.71828", "3.14159", "1.61803", "1.41421"], answer: 1 },
    { q: "What is the Pythagorean theorem?", options: ["a+b=c", "a²+b²=c²", "a×b=c²", "a²-b²=c"], answer: 1 },
    { q: "What is the derivative of x²?", options: ["x", "2", "2x", "x²"], answer: 2 },
    { q: "What is 15% of 200?", options: ["25", "30", "20", "35"], answer: 1 },
    { q: "What is √144?", options: ["11", "13", "14", "12"], answer: 3 },
    { q: "Area of a circle with radius r?", options: ["2πr", "πr²", "πd", "2πr²"], answer: 1 },
    { q: "What is 2¹⁰?", options: ["512", "2048", "1024", "256"], answer: 2 },
    { q: "Sum of angles in a triangle?", options: ["90°", "270°", "360°", "180°"], answer: 3 },
    { q: "What is log₁₀(1000)?", options: ["2", "4", "3", "10"], answer: 2 },
    { q: "What is a prime number?", options: ["Divisible by 2", "Only by 1 and itself", "An even number", "Greater than 100"], answer: 1 },
  ],
  Chemistry: [
    { q: "Chemical symbol for water?", options: ["HO", "H₂O₂", "H₂O", "OH"], answer: 2 },
    { q: "pH of pure water?", options: ["5", "9", "7", "1"], answer: 2 },
    { q: "Atomic number of Carbon?", options: ["8", "12", "4", "6"], answer: 3 },
    { q: "Which bond involves sharing of electrons?", options: ["Ionic", "Metallic", "Hydrogen", "Covalent"], answer: 3 },
    { q: "Most abundant gas in Earth's atmosphere?", options: ["Oxygen", "Carbon dioxide", "Argon", "Nitrogen"], answer: 3 },
    { q: "Oxidation means?", options: ["Gain of electrons", "Loss of protons", "Loss of electrons", "Gain of neutrons"], answer: 2 },
    { q: "Chemical formula of glucose?", options: ["C₁₂H₂₂O₁₁", "C₆H₁₂O₆", "C₂H₅OH", "CH₄"], answer: 1 },
    { q: "Avogadro's number is approximately?", options: ["3.0 × 10²³", "6.022 × 10²³", "9.8 × 10²³", "1.6 × 10²³"], answer: 1 },
    { q: "What is an isotope?", options: ["Different element, same mass", "Same element, different neutrons", "Different element, same protons", "Same element, different protons"], answer: 1 },
    { q: "Valence electrons of oxygen?", options: ["4", "8", "2", "6"], answer: 3 },
  ],
  Physics: [
    { q: "What is Newton's first law about?", options: ["Gravity", "Inertia", "Action-Reaction", "Acceleration"], answer: 1 },
    { q: "Speed of light in vacuum?", options: ["3 × 10⁶ m/s", "3 × 10⁸ m/s", "3 × 10¹⁰ m/s", "3 × 10⁴ m/s"], answer: 1 },
    { q: "What does E=mc² represent?", options: ["Force = mass × acceleration", "Energy = mass × c²", "Electric field equation", "Entropy formula"], answer: 1 },
    { q: "Unit of force in SI?", options: ["Joule", "Pascal", "Newton", "Watt"], answer: 2 },
    { q: "Formula for kinetic energy?", options: ["mgh", "½mv²", "mv", "Fd"], answer: 1 },
    { q: "Unit of electric resistance?", options: ["Volt", "Ampere", "Watt", "Ohm"], answer: 3 },
    { q: "Ohm's Law states?", options: ["P = VI", "V = IR", "F = ma", "E = mc²"], answer: 1 },
    { q: "Unit of power?", options: ["Newton", "Joule", "Watt", "Pascal"], answer: 2 },
    { q: "Unit of electric charge?", options: ["Volt", "Ampere", "Coulomb", "Farad"], answer: 2 },
    { q: "Why is the sky blue?", options: ["Reflection", "Refraction", "Rayleigh scattering", "Diffraction"], answer: 2 },
  ],
  History: [
    { q: "When did World War II end?", options: ["1943", "1944", "1946", "1945"], answer: 3 },
    { q: "First President of the United States?", options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"], answer: 2 },
    { q: "When did the French Revolution begin?", options: ["1776", "1799", "1789", "1804"], answer: 2 },
    { q: "When did the Berlin Wall fall?", options: ["1991", "1985", "1989", "1987"], answer: 2 },
    { q: "Who discovered the Americas in 1492?", options: ["Vasco da Gama", "Christopher Columbus", "Ferdinand Magellan", "Amerigo Vespucci"], answer: 1 },
    { q: "When did World War I start?", options: ["1914", "1918", "1939", "1910"], answer: 0 },
    { q: "Who invented the telephone?", options: ["Thomas Edison", "Nikola Tesla", "Alexander Graham Bell", "Guglielmo Marconi"], answer: 2 },
    { q: "When did the Soviet Union collapse?", options: ["1989", "1993", "1991", "1985"], answer: 2 },
    { q: "Cold War was mainly between?", options: ["USA and China", "UK and Germany", "USA and USSR", "France and Russia"], answer: 2 },
    { q: "Who wrote 'The Communist Manifesto'?", options: ["Lenin and Stalin", "Marx and Engels", "Mao and Castro", "Trotsky and Lenin"], answer: 1 },
  ],
};

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function getQuestions(subject: string): Question[] {
  const pool =
    subject === "All"
      ? Object.values(QUESTION_BANK).flat()
      : QUESTION_BANK[subject] ?? QUESTION_BANK["Biology"];
  return shuffle(pool).slice(0, 10);
}

interface Props {
  visible: boolean;
  subject: string;
  onClose: () => void;
}

export default function QuizModal({ visible, subject, onClose }: Props) {
  const colors = useColors();
  const { addXP, incrementQuizzes } = useUser();

  const [questions] = useState(() => getQuestions(subject));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [totalXP, setTotalXP] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  const q = questions[current];
  const progress = (current + 1) / questions.length;

  const handleSelect = useCallback(
    (idx: number) => {
      if (selected !== null) return;
      setSelected(idx);
      const correct = idx === q.answer;
      if (correct) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setScore((s) => s + 1);
        setTotalXP((x) => x + 5);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
          const isLast = current + 1 >= questions.length;
          if (isLast) {
            const finalXP = (score + (correct ? 1 : 0)) * 5;
            incrementQuizzes();
            addXP(finalXP);
            setTotalXP(finalXP);
            setDone(true);
          } else {
            setCurrent((c) => c + 1);
            setSelected(null);
          }
          fadeAnim.setValue(1);
        });
      }, 900);
    },
    [selected, q, current, questions.length, fadeAnim, score, addXP, incrementQuizzes]
  );

  const optionBg = (idx: number) => {
    if (selected === null) return colors.card;
    if (idx === q.answer) return "#00C89922";
    if (idx === selected && idx !== q.answer) return "#F8717122";
    return colors.card;
  };
  const optionBorder = (idx: number) => {
    if (selected === null) return colors.border;
    if (idx === q.answer) return "#00C899";
    if (idx === selected && idx !== q.answer) return "#F87171";
    return colors.border;
  };
  const optionTextColor = (idx: number) => {
    if (selected === null) return colors.text;
    if (idx === q.answer) return "#00C899";
    if (idx === selected && idx !== q.answer) return "#F87171";
    return colors.textMuted;
  };

  const grade = (s: number) => {
    const pct = s / questions.length;
    if (pct >= 0.9) return { label: "Excellent! 🏆", color: "#F59E0B" };
    if (pct >= 0.7) return { label: "Great job! ⭐", color: "#5C5EF0" };
    if (pct >= 0.5) return { label: "Good effort! 💪", color: "#2DD4BF" };
    return { label: "Keep studying! 📚", color: "#9CA3AF" };
  };

  const finalScore = done ? score : 0;
  const g = grade(finalScore);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {!done ? (
          <>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={[styles.quizTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                  {subject === "All" ? "Mixed Quiz" : `${subject} Quiz`}
                </Text>
                <Text style={[styles.quizSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  Question {current + 1} of {questions.length}
                </Text>
              </View>
              <View style={[styles.scorePill, { backgroundColor: "#F59E0B22" }]}>
                <Ionicons name="star" size={13} color="#F59E0B" />
                <Text style={[styles.scoreNum, { color: "#F59E0B", fontFamily: "Inter_700Bold" }]}>
                  {score}
                </Text>
              </View>
            </View>

            <View style={[styles.progressTrack, { backgroundColor: colors.card }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: colors.primary }]} />
            </View>

            <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
              <Animated.View style={{ opacity: fadeAnim }}>
                <View style={[styles.questionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.questionNum, { color: colors.primary, fontFamily: "Inter_600SemiBold" }]}>
                    Q{current + 1}
                  </Text>
                  <Text style={[styles.questionText, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                    {q.q}
                  </Text>
                </View>
                <View style={styles.options}>
                  {q.options.map((opt, idx) => (
                    <Pressable
                      key={idx}
                      style={[styles.option, { backgroundColor: optionBg(idx), borderColor: optionBorder(idx) }]}
                      onPress={() => handleSelect(idx)}
                    >
                      <View style={[styles.optionLetter, { borderColor: optionBorder(idx) }]}>
                        <Text style={[styles.optionLetterTxt, { color: optionTextColor(idx), fontFamily: "Inter_700Bold" }]}>
                          {["A", "B", "C", "D"][idx]}
                        </Text>
                      </View>
                      <Text style={[styles.optionTxt, { color: optionTextColor(idx), fontFamily: "Inter_500Medium" }]}>
                        {opt}
                      </Text>
                      {selected !== null && idx === q.answer && (
                        <Ionicons name="checkmark-circle" size={20} color="#00C899" />
                      )}
                      {selected === idx && idx !== q.answer && (
                        <Ionicons name="close-circle" size={20} color="#F87171" />
                      )}
                    </Pressable>
                  ))}
                </View>
              </Animated.View>
            </ScrollView>
          </>
        ) : (
          <ScrollView contentContainerStyle={styles.results} showsVerticalScrollIndicator={false}>
            <View style={[styles.resultIcon, { backgroundColor: g.color + "22" }]}>
              <Ionicons name="trophy" size={48} color={g.color} />
            </View>
            <Text style={[styles.gradeLabel, { color: g.color, fontFamily: "Inter_700Bold" }]}>
              {g.label}
            </Text>
            <Text style={[styles.scoreDisplay, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {finalScore} / {questions.length}
            </Text>
            <Text style={[styles.scoreSubtitle, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              correct answers
            </Text>
            <View style={styles.resultStats}>
              <View style={[styles.resultStat, { backgroundColor: "#F59E0B22", borderColor: "#F59E0B55" }]}>
                <Ionicons name="star" size={20} color="#F59E0B" />
                <Text style={[styles.resultStatVal, { color: "#F59E0B", fontFamily: "Inter_700Bold" }]}>
                  +{totalXP} XP
                </Text>
                <Text style={[styles.resultStatLabel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  earned
                </Text>
              </View>
              <View style={[styles.resultStat, { backgroundColor: "#5C5EF022", borderColor: "#5C5EF055" }]}>
                <Ionicons name="help-circle" size={20} color="#5C5EF0" />
                <Text style={[styles.resultStatVal, { color: "#5C5EF0", fontFamily: "Inter_700Bold" }]}>
                  {Math.round((finalScore / questions.length) * 100)}%
                </Text>
                <Text style={[styles.resultStatLabel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  accuracy
                </Text>
              </View>
            </View>
            <Pressable style={[styles.doneBtn, { backgroundColor: colors.primary }]} onPress={onClose}>
              <Text style={[styles.doneBtnTxt, { fontFamily: "Inter_700Bold" }]}>Done</Text>
            </Pressable>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1 },
  closeBtn: { padding: 4 },
  quizTitle: { fontSize: 17 },
  quizSub: { fontSize: 12, marginTop: 2 },
  scorePill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  scoreNum: { fontSize: 15 },
  progressTrack: { height: 4 },
  progressFill: { height: 4, borderRadius: 2 },
  body: { padding: 20, gap: 20 },
  questionCard: { padding: 22, borderRadius: 20, borderWidth: 1, gap: 10 },
  questionNum: { fontSize: 12, letterSpacing: 1 },
  questionText: { fontSize: 18, lineHeight: 26 },
  options: { gap: 12 },
  option: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1.5 },
  optionLetter: { width: 32, height: 32, borderRadius: 10, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  optionLetterTxt: { fontSize: 13 },
  optionTxt: { flex: 1, fontSize: 15, lineHeight: 21 },
  results: { padding: 32, alignItems: "center", gap: 16 },
  resultIcon: { width: 100, height: 100, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  gradeLabel: { fontSize: 24, marginTop: 8 },
  scoreDisplay: { fontSize: 52, lineHeight: 60 },
  scoreSubtitle: { fontSize: 15 },
  resultStats: { flexDirection: "row", gap: 12, marginTop: 8 },
  resultStat: { flex: 1, alignItems: "center", padding: 18, borderRadius: 18, borderWidth: 1, gap: 6 },
  resultStatVal: { fontSize: 22 },
  resultStatLabel: { fontSize: 12 },
  doneBtn: { width: "100%", paddingVertical: 16, borderRadius: 18, alignItems: "center", marginTop: 16 },
  doneBtnTxt: { color: "#fff", fontSize: 16 },
});
