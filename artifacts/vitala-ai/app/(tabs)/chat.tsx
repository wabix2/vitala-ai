import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAvoidingView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";
import PremiumPaywallModal from "@/components/PremiumPaywallModal";
import { shadows } from "@/constants/theme";

type Mode = "ai" | "feynman";

interface Message {
  id: string;
  text: string;
  role: "user" | "assistant";
}

const FEYNMAN_TOPICS = [
  { title: "Cell Division", meta: "Biology foundation", icon: "git-branch-outline" as const },
  { title: "Photosynthesis", meta: "Energy flow", icon: "leaf-outline" as const },
  { title: "Gravity & Orbits", meta: "Physics reasoning", icon: "planet-outline" as const },
  { title: "Linear Algebra", meta: "Math structure", icon: "grid-outline" as const },
  { title: "Acid-Base Reactions", meta: "Chemistry patterns", icon: "flask-outline" as const },
  { title: "The French Revolution", meta: "Cause and effect", icon: "library-outline" as const },
];

const FREE_LIMIT = 3;

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

function TypingDots({ color }: { color: string }) {
  const a = useRef(new Animated.Value(0.35)).current;
  const b = useRef(new Animated.Value(0.35)).current;
  const c = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const make = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.35, duration: 280, useNativeDriver: true }),
        ])
      );
    const loops = [make(a, 0), make(b, 120), make(c, 240)];
    loops.forEach((loop) => loop.start());
    return () => loops.forEach((loop) => loop.stop());
  }, [a, b, c]);

  return (
    <View style={styles.dots}>
      {[a, b, c].map((opacity, index) => (
        <Animated.View key={index} style={[styles.dot, { backgroundColor: color, opacity }]} />
      ))}
    </View>
  );
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addXP, incrementFeynman } = useUser();
  const [mode, setMode] = useState<Mode>("feynman");
  const [topic, setTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const feynmanLeft = Math.max(0, FREE_LIMIT - user.feynmanSessionsToday);
  const feynmanLocked = user.feynmanSessionsToday >= FREE_LIMIT;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || typing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Message = { id: genId(), text, role: "user" };
    const updatedMessages = [userMsg, ...messages];
    setMessages(updatedMessages);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          mode,
          topic: topic ?? undefined,
        }),
      });
      const data = (await res.json()) as { text?: string; error?: string };
      const reply = data.text ?? "I could not respond right now. Try again in a moment.";
      setMessages((prev) => [{ id: genId(), text: reply, role: "assistant" }, ...prev]);
      addXP(10);
    } catch {
      setMessages((prev) => [
        { id: genId(), text: "Connection issue. Check your internet and try again.", role: "assistant" },
        ...prev,
      ]);
    } finally {
      setTyping(false);
    }
  }, [input, typing, mode, topic, messages, addXP]);

  const startFeynman = (t: string) => {
    if (feynmanLocked) return;
    incrementFeynman();
    setMode("feynman");
    setTopic(t);
    setMessages([
      {
        id: genId(),
        role: "assistant",
        text: `Teach me ${t} like I am new to it. I will listen for gaps, ask sharper questions, and help you simplify the idea until it clicks.`,
      },
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const switchMode = (m: Mode) => {
    Haptics.selectionAsync();
    setMode(m);
    setTopic(null);
    setMessages([]);
    setInput("");
  };

  const showTopicPicker = mode === "feynman" && !topic;

  const renderMsg = ({ item }: { item: Message }) => {
    const isUser = item.role === "user";
    return (
      <View style={[styles.msgRow, isUser && styles.msgRowUser]}>
        {!isUser && (
          <LinearGradient colors={["#2563EB", "#0891B2"]} style={styles.aiIcon}>
            <Ionicons name="sparkles" size={14} color="#FFFFFF" />
          </LinearGradient>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.bubbleTxt, { color: isUser ? "#fff" : colors.text, fontFamily: "Inter_400Regular" }]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: colors.background }}
        behavior="padding"
        keyboardVerticalOffset={0}
      >
        <View style={[styles.header, { paddingTop: topPad + 14, borderBottomColor: colors.border }]}>
          <View style={styles.headerTop}>
            {mode === "feynman" && topic ? (
              <Pressable onPress={() => { setTopic(null); setMessages([]); }} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={21} color={colors.text} />
              </Pressable>
            ) : null}
            <View style={{ flex: 1 }}>
              <Text style={[styles.kicker, { color: colors.textMuted, fontFamily: "Inter_600SemiBold" }]}>
                {mode === "feynman" ? "FEYNMAN MENTOR" : "STUDY ASSISTANT"}
              </Text>
              <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                {mode === "feynman" && topic ? topic : "Learn by explaining"}
              </Text>
            </View>
          </View>
          <View style={[styles.modeSwitcher, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {(["feynman", "ai"] as Mode[]).map((m) => (
              <Pressable
                key={m}
                onPress={() => switchMode(m)}
                style={[styles.modeTab, mode === m && { backgroundColor: colors.primary }]}
              >
                <Ionicons
                  name={m === "ai" ? "chatbubbles-outline" : "sparkles-outline"}
                  size={14}
                  color={mode === m ? "#fff" : colors.textSecondary}
                />
                <Text style={[styles.modeTxt, { color: mode === m ? "#fff" : colors.textSecondary, fontFamily: "Inter_600SemiBold" }]}>
                  {m === "ai" ? "Ask" : "Feynman"}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {showTopicPicker ? (
          <FlatList
            data={FEYNMAN_TOPICS}
            keyExtractor={(item) => item.title}
            numColumns={2}
            columnWrapperStyle={styles.topicColumns}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: botPad + 22 }}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View style={styles.feynmanIntro}>
                <LinearGradient colors={["#0F172A", "#1D4ED8"]} style={styles.mentorCard}>
                  <View style={styles.mentorIcon}>
                    <Ionicons name="school" size={28} color="#FFFFFF" />
                  </View>
                  <Text style={[styles.mentorTitle, { fontFamily: "Inter_700Bold" }]}>
                    Explain it. Find the gaps. Make it simple.
                  </Text>
                  <Text style={[styles.mentorSub, { fontFamily: "Inter_400Regular" }]}>
                    Choose a topic and teach it out loud in text. The mentor will challenge unclear parts without making you feel stuck.
                  </Text>
                  <View style={styles.sessionRow}>
                    <Ionicons name={feynmanLocked ? "lock-closed" : "timer-outline"} size={15} color="#FFFFFF" />
                    <Text style={[styles.sessionText, { fontFamily: "Inter_600SemiBold" }]}>
                      {feynmanLocked ? "Daily limit reached" : `${feynmanLeft} mentor sessions left today`}
                    </Text>
                  </View>
                </LinearGradient>
                {feynmanLocked && (
                  <Pressable
                    style={[styles.lockBanner, { backgroundColor: colors.card, borderColor: colors.border }, shadows.sm]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      setPaywallVisible(true);
                    }}
                  >
                    <Ionicons name="lock-closed" size={16} color={colors.primary} />
                    <Text style={[styles.lockTxt, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                      Unlock unlimited mentor sessions
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
                  </Pressable>
                )}
                <Text style={[styles.topicsLabel, { color: colors.textMuted, fontFamily: "Inter_700Bold" }]}>
                  PICK A STARTING POINT
                </Text>
              </View>
            )}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.topicCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    opacity: feynmanLocked ? 0.45 : pressed ? 0.82 : 1,
                  },
                  shadows.sm,
                ]}
                onPress={() => !feynmanLocked && startFeynman(item.title)}
                disabled={feynmanLocked}
              >
                <View style={[styles.topicIcon, { backgroundColor: colors.primary + "14" }]}>
                  <Ionicons name={item.icon} size={20} color={colors.primary} />
                </View>
                <Text style={[styles.topicTxt, { color: colors.text, fontFamily: "Inter_700Bold" }]}>{item.title}</Text>
                <Text style={[styles.topicMeta, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>{item.meta}</Text>
              </Pressable>
            )}
          />
        ) : (
          <>
            <FlatList
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMsg}
              inverted
              contentContainerStyle={{ padding: 16, gap: 10 }}
              keyboardDismissMode="interactive"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                typing ? (
                  <View style={styles.msgRow}>
                    <LinearGradient colors={["#2563EB", "#0891B2"]} style={styles.aiIcon}>
                      <Ionicons name="sparkles" size={14} color="#FFFFFF" />
                    </LinearGradient>
                    <View style={[styles.bubble, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
                      <TypingDots color={colors.primary} />
                    </View>
                  </View>
                ) : null
              }
              ListEmptyComponent={
                !typing ? (
                  <View style={styles.emptyChat}>
                    <View style={[styles.emptyIcon, { backgroundColor: colors.primary + "14" }]}>
                      <Ionicons name={mode === "ai" ? "chatbubbles-outline" : "sparkles-outline"} size={30} color={colors.primary} />
                    </View>
                    <Text style={[styles.emptyTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                      {mode === "ai" ? "Ask a sharper study question" : "Start with your simplest explanation"}
                    </Text>
                    <Text style={[styles.emptyChatTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                      {mode === "ai"
                        ? "Use it for hints, examples, and quick checks."
                        : "The best Feynman sessions begin messy. Clarity comes next."}
                    </Text>
                  </View>
                ) : null
              }
            />

            <View style={[styles.inputBar, { borderTopColor: colors.border, paddingBottom: botPad + 12, backgroundColor: colors.background }]}>
              <TextInput
                ref={inputRef}
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                placeholder={mode === "ai" ? "Ask for a hint, example, or check..." : "Explain the idea in your own words..."}
                placeholderTextColor={colors.textMuted}
                value={input}
                onChangeText={setInput}
                multiline
                maxLength={700}
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
              <Pressable
                style={[
                  styles.sendBtn,
                  { backgroundColor: input.trim() ? colors.primary : colors.card, borderColor: colors.border },
                ]}
                onPress={sendMessage}
                disabled={!input.trim() || typing}
              >
                <Ionicons name="send" size={18} color={input.trim() ? "#fff" : colors.textMuted} />
              </Pressable>
            </View>
          </>
        )}
      </KeyboardAvoidingView>

      <PremiumPaywallModal visible={paywallVisible} onClose={() => setPaywallVisible(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomWidth: 1, gap: 12 },
  headerTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  kicker: { fontSize: 10, letterSpacing: 1.4, marginBottom: 3 },
  headerTitle: { fontSize: 22 },
  modeSwitcher: { flexDirection: "row", borderRadius: 15, borderWidth: 1, padding: 3 },
  modeTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 12 },
  modeTxt: { fontSize: 13 },
  feynmanIntro: { paddingTop: 18, paddingBottom: 14, gap: 12 },
  mentorCard: { borderRadius: 28, padding: 22, minHeight: 220, justifyContent: "space-between", overflow: "hidden" },
  mentorIcon: { width: 58, height: 58, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.16)", alignItems: "center", justifyContent: "center" },
  mentorTitle: { color: "#FFFFFF", fontSize: 25, lineHeight: 31, marginTop: 18 },
  mentorSub: { color: "rgba(255,255,255,0.76)", fontSize: 13, lineHeight: 19, marginTop: 8 },
  sessionRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 18 },
  sessionText: { color: "#FFFFFF", fontSize: 12 },
  lockBanner: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 18, borderWidth: 1 },
  lockTxt: { flex: 1, fontSize: 13 },
  topicsLabel: { fontSize: 11, letterSpacing: 1.4, marginTop: 4 },
  topicColumns: { gap: 10, marginBottom: 10 },
  topicCard: { flex: 1, minHeight: 138, borderRadius: 20, borderWidth: 1, padding: 15 },
  topicIcon: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  topicTxt: { fontSize: 15, lineHeight: 20 },
  topicMeta: { fontSize: 12, marginTop: 5 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "92%" },
  msgRowUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  aiIcon: { width: 30, height: 30, borderRadius: 11, alignItems: "center", justifyContent: "center", marginBottom: 2 },
  bubble: { maxWidth: "84%", paddingHorizontal: 14, paddingVertical: 12, borderRadius: 18 },
  bubbleTxt: { fontSize: 14, lineHeight: 21 },
  dots: { flexDirection: "row", alignItems: "center", gap: 5, paddingVertical: 5 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  emptyChat: { alignItems: "center", gap: 10, paddingTop: 72, paddingHorizontal: 24 },
  emptyIcon: { width: 62, height: 62, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, textAlign: "center" },
  emptyChatTxt: { fontSize: 14, lineHeight: 20, textAlign: "center" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  input: { flex: 1, borderWidth: 1, borderRadius: 18, paddingHorizontal: 15, paddingVertical: 12, fontSize: 14, maxHeight: 116 },
  sendBtn: { width: 46, height: 46, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1 },
});
