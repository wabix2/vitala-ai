import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useAskPdf } from "@workspace/api-client-react";
import { t } from "@/lib/i18n";

interface QA {
  question: string;
  answer: string;
}

export default function PdfScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const lang = user?.language ?? "en";
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const [docText, setDocText] = useState("");
  const [docName, setDocName] = useState("");
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<QA[]>([]);
  const askPdf = useAskPdf();

  const handlePick = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/*", "application/json", "*/*"],
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      setDocName(asset.name ?? "Document");
      if (asset.uri && FileSystem.documentDirectory !== null) {
        try {
          const content = await FileSystem.readAsStringAsync(asset.uri);
          setDocText(content);
        } catch {
          setDocText(`[File: ${asset.name}] - Paste the text content below to ask questions.`);
        }
      }
    } catch {}
  };

  const handleAsk = async () => {
    if (!question.trim() || !docText.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const q = question.trim();
    setQuestion("");
    try {
      const res = await askPdf.mutateAsync({ text: docText, question: q, language: lang });
      setHistory((prev) => [...prev, { question: q, answer: res.answer }]);
    } catch {
      setHistory((prev) => [...prev, { question: q, answer: "Failed to get answer. Please try again." }]);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <LinearGradient
        colors={isDark ? ["#0F1729", colors.background] : ["#FFF0F9", colors.background]}
        style={[styles.header, { paddingTop: topPadding + 12 }]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>PDF AI</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          Upload a document and ask questions
        </Text>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {!docText ? (
          <Animated.View entering={FadeInDown.duration(400)}>
            <Pressable onPress={handlePick} style={[styles.uploadArea, { borderColor: colors.primary, backgroundColor: colors.card }]}>
              <View style={[styles.uploadIcon, { backgroundColor: `${"#EC4899"}18` }]}>
                <Feather name="file-text" size={32} color="#EC4899" />
              </View>
              <Text style={[styles.uploadTitle, { color: colors.foreground }]}>
                Upload Document
              </Text>
              <Text style={[styles.uploadDesc, { color: colors.mutedForeground }]}>
                Pick a text file, or paste content below
              </Text>
            </Pressable>

            <Text style={[styles.orLabel, { color: colors.mutedForeground }]}>— or paste text —</Text>
            <TextInput
              style={[styles.pasteInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              placeholder="Paste your document content here..."
              placeholderTextColor={colors.mutedForeground}
              multiline
              numberOfLines={6}
              value={docText}
              onChangeText={setDocText}
              textAlignVertical="top"
            />
            {docText.length > 0 && (
              <Pressable onPress={() => setDocName("Pasted Text")} style={[styles.confirmBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.confirmBtnText}>Use This Text</Text>
              </Pressable>
            )}
          </Animated.View>
        ) : (
          <>
            <View style={[styles.docBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="file-text" size={18} color="#EC4899" />
              <Text style={[styles.docName, { color: colors.foreground }]} numberOfLines={1}>
                {docName || "Document loaded"}
              </Text>
              <Pressable onPress={() => { setDocText(""); setDocName(""); setHistory([]); }}>
                <Feather name="x" size={18} color={colors.mutedForeground} />
              </Pressable>
            </View>

            {history.map((qa, i) => (
              <Animated.View key={i} entering={FadeInDown.duration(300)} style={styles.qaItem}>
                <View style={[styles.qBox, { backgroundColor: colors.primary }]}>
                  <Text style={styles.qText}>{qa.question}</Text>
                </View>
                <View style={[styles.aBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.aText, { color: colors.foreground }]}>{qa.answer}</Text>
                </View>
              </Animated.View>
            ))}

            {askPdf.isPending && (
              <View style={styles.loading}>
                <ActivityIndicator color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
                  Analyzing document...
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {docText.length > 0 && (
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: insets.bottom + 8 }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground, backgroundColor: colors.surfaceAlt }]}
            placeholder="Ask a question about the document..."
            placeholderTextColor={colors.mutedForeground}
            value={question}
            onChangeText={setQuestion}
            onSubmitEditing={handleAsk}
            returnKeyType="send"
          />
          <Pressable
            onPress={handleAsk}
            disabled={!question.trim() || askPdf.isPending}
            style={[styles.sendBtn, { backgroundColor: question.trim() ? colors.primary : colors.muted }]}
          >
            <Feather name="send" size={18} color={question.trim() ? "#fff" : colors.mutedForeground} />
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  subtitle: { fontSize: 14, fontFamily: "Inter_400Regular", marginTop: 4 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  uploadArea: {
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    padding: 36,
    alignItems: "center",
    gap: 12,
  },
  uploadIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  uploadTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  uploadDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  orLabel: { fontSize: 13, fontFamily: "Inter_400Regular", textAlign: "center", marginVertical: 16 },
  pasteInput: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    minHeight: 120,
  },
  confirmBtn: { marginTop: 12, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  confirmBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_600SemiBold" },
  docBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  docName: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  qaItem: { gap: 8 },
  qBox: { borderRadius: 14, borderBottomRightRadius: 4, padding: 14, alignSelf: "flex-end", maxWidth: "80%" },
  qText: { color: "#fff", fontSize: 14, fontFamily: "Inter_400Regular" },
  aBox: { borderRadius: 14, borderBottomLeftRadius: 4, borderWidth: 1, padding: 14, alignSelf: "flex-start", maxWidth: "90%" },
  aText: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 21 },
  loading: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  inputBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    alignItems: "center",
  },
  input: { flex: 1, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, fontFamily: "Inter_400Regular" },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
