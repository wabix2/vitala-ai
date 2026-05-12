import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Dimensions,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { Feather } from "@expo/vector-icons";

const SLIDES = [
  {
    icon: "cpu" as const,
    title: "AI-Powered Learning",
    body: "Chat with Vitala AI — your personal tutor available 24/7, in your language.",
    accent: "#7B7FFF",
  },
  {
    icon: "book-open" as const,
    title: "Study Smarter",
    body: "Generate flashcards, quizzes, and summaries from any topic instantly.",
    accent: "#00D4AA",
  },
  {
    icon: "file-text" as const,
    title: "Ask Your Documents",
    body: "Upload PDF notes and ask questions. Get instant, accurate answers.",
    accent: "#F97316",
  },
  {
    icon: "globe" as const,
    title: "Your Language",
    body: "Study in English, Amharic, Afaan Oromo, Swahili, or Arabic.",
    accent: "#EC4899",
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useAuth();
  const [current, setCurrent] = useState(0);
  const buttonScale = useSharedValue(1);
  const topPadding = Platform.OS === "web" ? 80 : insets.top + 40;
  const bottomPadding = Platform.OS === "web" ? 48 : insets.bottom + 32;

  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleNext = async () => {
    buttonScale.value = withSpring(0.95, {}, () => {
      buttonScale.value = withSpring(1);
    });
    if (current < SLIDES.length - 1) {
      setCurrent(current + 1);
    } else {
      await completeOnboarding();
      router.replace("/(auth)/login");
    }
  };

  const slide = SLIDES[current]!;

  return (
    <LinearGradient
      colors={["#080D1A", "#0F1729"]}
      style={[styles.container, { paddingTop: topPadding, paddingBottom: bottomPadding }]}
    >
      <Animated.View
        key={current}
        entering={FadeIn.duration(350)}
        exiting={FadeOut.duration(200)}
        style={styles.slide}
      >
        <View style={[styles.iconWrap, { backgroundColor: `${slide.accent}25` }]}>
          <Feather name={slide.icon} size={52} color={slide.accent} />
        </View>
        <Text style={styles.slideTitle}>{slide.title}</Text>
        <Text style={styles.slideBody}>{slide.body}</Text>
      </Animated.View>

      <View style={styles.dots}>
        {SLIDES.map((s, i) => (
          <Pressable key={i} onPress={() => setCurrent(i)}>
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: i === current ? slide.accent : "rgba(255,255,255,0.18)",
                  width: i === current ? 22 : 7,
                },
              ]}
            />
          </Pressable>
        ))}
      </View>

      <View style={styles.btnWrap}>
        <Animated.View style={btnStyle}>
          <Pressable onPress={handleNext}>
            <LinearGradient
              colors={[slide.accent, `${slide.accent}BB`]}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.btnText}>
                {current === SLIDES.length - 1 ? "Get Started" : "Continue"}
              </Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </Pressable>
        </Animated.View>

        <Pressable onPress={handleNext} style={styles.skip}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    width: "100%",
    maxWidth: 400,
  },
  iconWrap: {
    width: 108,
    height: 108,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  slideTitle: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -0.5,
    color: "#E8EEFF",
  },
  slideBody: {
    fontSize: 16,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 25,
    color: "#7A8BAE",
  },
  dots: {
    flexDirection: "row",
    gap: 7,
    alignItems: "center",
    marginBottom: 28,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  btnWrap: {
    width: "100%",
    maxWidth: 400,
    gap: 4,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
  },
  btnText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  skip: {
    alignItems: "center",
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#5A6A8E",
  },
});
