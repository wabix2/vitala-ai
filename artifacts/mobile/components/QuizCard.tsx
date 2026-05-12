import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface Props {
  question: QuizQuestion;
  index: number;
  total: number;
  onAnswer: (correct: boolean) => void;
}

export function QuizCard({ question, index, total, onAnswer }: Props) {
  const colors = useColors();
  const [selected, setSelected] = useState<number | null>(null);

  const handleSelect = async (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const correct = i === question.correctIndex;
    await Haptics.notificationAsync(
      correct
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Error,
    );
    setTimeout(() => onAnswer(correct), 1400);
  };

  const getOptionStyle = (i: number) => {
    if (selected === null)
      return { backgroundColor: colors.surface, borderColor: colors.border };
    if (i === question.correctIndex)
      return { backgroundColor: "#22C55E20", borderColor: "#22C55E" };
    if (i === selected)
      return { backgroundColor: "#EF444420", borderColor: "#EF4444" };
    return { backgroundColor: colors.surface, borderColor: colors.border };
  };

  const getOptionTextColor = (i: number) => {
    if (selected === null) return colors.foreground;
    if (i === question.correctIndex) return "#16A34A";
    if (i === selected) return "#DC2626";
    return colors.mutedForeground;
  };

  return (
    <Animated.View entering={FadeInDown.duration(400)} style={styles.container}>
      <Text style={[styles.counter, { color: colors.mutedForeground }]}>
        Question {index + 1} of {total}
      </Text>
      <Text style={[styles.question, { color: colors.foreground }]}>
        {question.question}
      </Text>
      <View style={styles.options}>
        {question.options.map((opt, i) => (
          <Pressable
            key={i}
            onPress={() => handleSelect(i)}
            style={[styles.option, getOptionStyle(i)]}
          >
            <View style={[styles.optionLetter, { borderColor: colors.border }]}>
              <Text style={[styles.letterText, { color: colors.mutedForeground }]}>
                {String.fromCharCode(65 + i)}
              </Text>
            </View>
            <Text style={[styles.optionText, { color: getOptionTextColor(i) }]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </View>
      {selected !== null && (
        <Animated.View
          entering={FadeIn.duration(300)}
          style={[styles.explanation, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
        >
          <Text style={[styles.explanationLabel, { color: colors.primary }]}>
            Explanation
          </Text>
          <Text style={[styles.explanationText, { color: colors.foreground }]}>
            {question.explanation}
          </Text>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
  },
  counter: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  question: {
    fontSize: 19,
    fontFamily: "Inter_600SemiBold",
    lineHeight: 28,
  },
  options: {
    gap: 10,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 12,
  },
  optionLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  letterText: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  optionText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    flex: 1,
    lineHeight: 22,
  },
  explanation: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
    marginTop: 8,
  },
  explanationLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 0.5,
  },
  explanationText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
});
