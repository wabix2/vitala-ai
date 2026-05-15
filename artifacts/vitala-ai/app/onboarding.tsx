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
  { icon: "bulb" as const, color: "#F59E0B", text: "AI-powered Feynman tutoring" },
  { icon: "help-circle" as const, color: "#5C5EF0", text: "Adaptive quizzes with instant XP" },
  { icon: "trophy" as const, color: "#00C899", text: "Global leaderboard rankings" },
  { icon: "share-social" as const, color: "#FF9600", text: "Shareable achievement cards" },
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
      style={[styles.container]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 24 }]}>
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoRing}>
            <Ionicons name="school" size={32} color="#5C5EF0" />
          </View>
          <Text style={[styles.appName, { fontFamily: "Inter_700Bold" }]}>Vitala AI</Text>
          <Text style={[styles.tagline, { fontFamily: "Inter_400Regular" }]}>
            Study smarter. Level up faster.
          </Text>
        </View>

        {/* Feature List */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <View style={[styles.featureIcon, { backgroundColor: f.color + "22" }]}>
                <Ionicons name={f.icon} size={18} color={f.color} />
              </View>
              <Text style={[styles.featureTxt, { fontFamily: "Inter_500Medium" }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Name Input */}
        <View style={styles.inputSection}>
          <Text style={[styles.inputLabel, { fontFamily: "Inter_600SemiBold" }]}>
            What should we call you?
          </Text>
          <View style={[
            styles.inputWrap,
            { borderColor: focused ? "#5C5EF0" : "#333" },
          ]}>
            <Ionicons name="person-outline" size={18} color={focused ? "#5C5EF0" : "#666"} />
            <TextInput
              style={[styles.input, { fontFamily: "Inter_500Medium", color: "#fff" }]}
              placeholder="Enter your name..."
              placeholderTextColor="#555"
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
            { backgroundColor: canContinue ? "#5C5EF0" : "#333", opacity: pressed ? 0.85 : 1 },
          ]}
          onPress={handleStart}
          disabled={!canContinue}
        >
          <Text style={[styles.startTxt, { fontFamily: "Inter_700Bold" }]}>
            Start Learning
          </Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
        </Pressable>

        <Text style={[styles.fine, { fontFamily: "Inter_400Regular" }]}>
          Free forever · No account needed
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0A0A0F" },
  inner: { flex: 1, paddingHorizontal: 28, justifyContent: "space-between" },
  brand: { alignItems: "center", gap: 10 },
  logoRing: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: "#5C5EF022",
    borderWidth: 1.5,
    borderColor: "#5C5EF055",
    alignItems: "center",
    justifyContent: "center",
  },
  appName: { fontSize: 36, color: "#fff", letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: "#888", textAlign: "center" },
  features: { gap: 14 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  featureIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  featureTxt: { fontSize: 15, color: "#ccc", flex: 1 },
  inputSection: { gap: 10 },
  inputLabel: { fontSize: 16, color: "#fff" },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#161622",
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  input: { flex: 1, fontSize: 16 },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
  },
  startTxt: { color: "#fff", fontSize: 17 },
  fine: { fontSize: 12, color: "#444", textAlign: "center" },
});
