import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await register(name.trim(), email.trim(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError("Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#080D1A", "#0F1729"]} style={styles.gradient}>
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 32, paddingBottom: insets.bottom + 32 },
        ]}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color="#6B7AA8" />
        </Pressable>

        <Text style={styles.title}>Create Account</Text>
        <Text style={[styles.subtitle, { color: "#6B7AA8" }]}>
          Join Vitala AI and start learning smarter
        </Text>

        <View style={styles.form}>
          {[
            { label: "Full Name", icon: "user" as const, value: name, set: setName, type: "default" as const, secure: false },
            { label: "Email", icon: "mail" as const, value: email, set: setEmail, type: "email-address" as const, secure: false },
            { label: "Password", icon: "lock" as const, value: password, set: setPassword, type: "default" as const, secure: true },
          ].map((field) => (
            <View
              key={field.label}
              style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: "#0F1729" }]}
            >
              <Feather name={field.icon} size={18} color="#6B7AA8" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: "#E8EEFF" }]}
                placeholder={field.label}
                placeholderTextColor="#4A5568"
                keyboardType={field.type}
                autoCapitalize={field.type === "email-address" ? "none" : "words"}
                secureTextEntry={field.secure}
                value={field.value}
                onChangeText={field.set}
              />
            </View>
          ))}

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <Pressable onPress={handleRegister} disabled={loading}>
            <LinearGradient
              colors={["#00D4AA", "#00B4D8"]}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Create Account</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: "#6B7AA8" }]}>
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text style={[styles.link, { color: "#7B7FFF" }]}>Sign In</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 28 },
  backBtn: { marginBottom: 32, alignSelf: "flex-start" },
  title: {
    fontSize: 30,
    fontFamily: "Inter_700Bold",
    color: "#E8EEFF",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: { fontSize: 15, fontFamily: "Inter_400Regular", marginBottom: 36 },
  form: { gap: 14 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    height: 54,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular" },
  error: { color: "#F87171", fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center" },
  btn: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: { fontSize: 16, fontFamily: "Inter_600SemiBold", color: "#fff" },
  footer: { flexDirection: "row", marginTop: 32, alignItems: "center", justifyContent: "center" },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  link: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
