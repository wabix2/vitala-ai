import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
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
  { icon: "bulb-outline" as const, color: "#F59E0B", text: "AI-powered Feynman tutoring" },
  { icon: "help-circle-outline" as const, color: "#1D72E8", text: "Adaptive quizzes with instant XP" },
  { icon: "trophy-outline" as const, color: "#10B981", text: "Global leaderboard rankings" },
  { icon: "share-social-outline" as const, color: "#F97316", text: "Shareable achievement cards" },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useUser();
  const [name, setName] = useState("");
  const [focused, setFocused] = useState(false);

  const canContinue = name.trim().length >= 2;

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
      <View style={[styles.inner, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoRing}>
            <Ionicons name="school" size={34} color="#1D72E8" />
          </View>
          <Text style={styles.appName}>Vitala AI</Text>
          <Text style={styles.tagline}>Study smarter. Level up faster.</Text>
        </View>

        {/* Feature List */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + "15" }]}>
                <Ionicons name={f.icon} size={20} color={f.color} />
              </View>
              <Text style={styles.featureTxt}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>What should we call you?</Text>
          <View style={[styles.inputWrap, focused && styles.inputWrapFocused]}>
            <Ionicons name="person-outline" size={18} color={focused ? "#1D72E8" : "#94A3B8"} />
            <TextInput
              style={styles.input}
              placeholder="Enter your name..."
              placeholderTextColor="#CBD5E1"
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
            pressed && canContinue && styles.startBtnPressed,
          ]}
          onPress={handleStart}
          disabled={!canContinue}
        >
          <Text style={styles.startTxt}>Start Learning</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        <Text style={styles.fine}>Free forever · No account needed</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: "space-between" },
  brand: { alignItems: "center", gap: 12 },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: "#EFF6FF",
    borderWidth: 1.5,
    borderColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 36, color: "#111827", letterSpacing: -0.5, fontFamily: "Inter_700Bold" },
  tagline: { fontSize: 15, color: "#64748B", textAlign: "center", fontFamily: "Inter_400Regular" },
  features: { gap: 16 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureTxt: { fontSize: 15, color: "#374151", flex: 1, fontFamily: "Inter_500Medium" },
  inputSection: { gap: 10 },
  inputLabel: { fontSize: 16, color: "#111827", fontFamily: "Inter_600SemiBold" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F8FAFC",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputWrapFocused: {
    borderColor: "#1D72E8",
    backgroundColor: "#FFFFFF",
  },
  input: { flex: 1, fontSize: 16, fontFamily: "Inter_500Medium", color: "#111827" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: "#1D72E8",
    shadowColor: "#1D72E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  startBtnDisabled: { backgroundColor: "#CBD5E1", shadowOpacity: 0, elevation: 0 },
  startBtnPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  startTxt: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  fine: { fontSize: 12, color: "#94A3B8", textAlign: "center", fontFamily: "Inter_400Regular" },
});
