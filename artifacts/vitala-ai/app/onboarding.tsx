import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useUser } from "@/context/UserContext";

const FEATURES = [
  { icon: "bulb-outline" as const, color: "#3B82F6", label: "AI-powered Feynman tutoring" },
  { icon: "help-circle-outline" as const, color: "#10B981", label: "Adaptive quizzes with instant XP" },
  { icon: "trophy-outline" as const, color: "#F59E0B", label: "Global leaderboard rankings" },
  { icon: "share-social-outline" as const, color: "#8B5CF6", label: "Shareable achievement cards" },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useUser();
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  const canContinue = name.trim().length >= 2;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleStart = () => {
    if (!canContinue) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeOnboarding(name.trim());
    router.replace("/(tabs)");
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient
        colors={["#0F172A", "#1E293B", "#1E3A5F"]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      <Animated.View
        style={[
          styles.inner,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 32 },
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoRing}>
            <Ionicons name="school" size={34} color="#60A5FA" />
          </View>
          <Text style={styles.appName}>Vitala AI</Text>
          <Text style={styles.tagline}>Study smarter. Level up faster.</Text>
        </View>

        {/* Feature List */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + "20" }]}>
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={styles.featureTxt}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>What should we call you?</Text>
          <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
            <Ionicons name="person-outline" size={18} color={focused ? "#60A5FA" : "#64748B"} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name..."
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              maxLength={24}
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={handleStart}
            />
          </View>
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [
            styles.startBtn,
            !canContinue && styles.startBtnDisabled,
            pressed && canContinue && { opacity: 0.9 },
          ]}
          onPress={handleStart}
          disabled={!canContinue}
        >
          {canContinue ? (
            <LinearGradient
              colors={["#3B82F6", "#1D72E8"]}
              style={styles.startBtnGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.startTxt}>Start Learning</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </LinearGradient>
          ) : (
            <View style={styles.startBtnGradient}>
              <Text style={[styles.startTxt, { color: "#64748B" }]}>Start Learning</Text>
              <Ionicons name="arrow-forward" size={18} color="#64748B" />
            </View>
          )}
        </Pressable>

        <Text style={styles.fine}>Free forever · No account needed</Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: "space-between" },
  brand: { alignItems: "center", gap: 14 },
  logoRing: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: "rgba(59,130,246,0.15)",
    borderWidth: 1.5,
    borderColor: "rgba(59,130,246,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 36, color: "#F1F5F9", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  tagline: { fontSize: 15, color: "#94A3B8", textAlign: "center", fontFamily: "Inter_400Regular" },
  features: { gap: 18 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: { width: 44, height: 44, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  featureTxt: { fontSize: 15, color: "#CBD5E1", flex: 1, fontFamily: "Inter_500Medium" },
  inputSection: { gap: 10 },
  inputLabel: { fontSize: 16, color: "#F1F5F9", fontFamily: "Inter_600SemiBold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(30,41,59,0.8)",
    borderWidth: 1.5,
    borderColor: "#334155",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputWrapFocused: {
    borderColor: "#3B82F6",
    backgroundColor: "rgba(30,41,59,1)",
  },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium", color: "#F1F5F9" },
  startBtn: { borderRadius: 16, overflow: "hidden" },
  startBtnDisabled: { opacity: 0.4 },
  startBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    backgroundColor: "#1E293B",
  },
  startTxt: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  fine: { fontSize: 12, color: "#475569", textAlign: "center", fontFamily: "Inter_400Regular" },
});
