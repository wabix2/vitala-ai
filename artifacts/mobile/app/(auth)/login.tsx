import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { useAuth } from "@/context/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPw, setShowPw] = useState(false);
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#080D1A", "#0F1729"]}
      style={styles.gradient}
    >
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPadding + 48, paddingBottom: insets.bottom + 32 },
        ]}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoRow}>
          <View style={[styles.logo, { backgroundColor: "#7B7FFF20" }]}>
            <Feather name="cpu" size={30} color="#7B7FFF" />
          </View>
        </View>
        <Text style={styles.appName}>Vitala AI</Text>
        <Text style={[styles.tagline, { color: "#6B7AA8" }]}>Your AI learning companion</Text>

        <View style={styles.form}>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: "#0F1729" }]}>
            <Feather name="mail" size={18} color="#6B7AA8" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: "#E8EEFF" }]}
              placeholder="Email"
              placeholderTextColor="#4A5568"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: "#0F1729" }]}>
            <Feather name="lock" size={18} color="#6B7AA8" style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: "#E8EEFF" }]}
              placeholder="Password"
              placeholderTextColor="#4A5568"
              secureTextEntry={!showPw}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
              <Feather name={showPw ? "eye-off" : "eye"} size={18} color="#6B7AA8" />
            </Pressable>
          </View>

          {error ? (
            <Text style={styles.error}>{error}</Text>
          ) : null}

          <Pressable onPress={handleLogin} disabled={loading}>
            <LinearGradient
              colors={["#7B7FFF", "#5B5FEF"]}
              style={styles.btn}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </LinearGradient>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: "#6B7AA8" }]}>
            {"Don't have an account? "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/register")}>
            <Text style={[styles.link, { color: "#7B7FFF" }]}>Create Account</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 28, alignItems: "center" },
  logoRow: { marginBottom: 12 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  appName: {
    fontSize: 32,
    fontFamily: "Inter_700Bold",
    color: "#E8EEFF",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginBottom: 40,
    marginTop: 4,
  },
  form: { width: "100%", gap: 14 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    height: 54,
    paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  eyeBtn: { padding: 4 },
  error: {
    color: "#F87171",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  btn: {
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#fff",
  },
  footer: {
    flexDirection: "row",
    marginTop: 32,
    alignItems: "center",
  },
  footerText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  link: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
