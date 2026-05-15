import * as Haptics from "expo-haptics";
import React, { useCallback, useRef, useState } from "react";
import {
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

type Mode = "ai" | "feynman";

interface Message {
  id: string;
  text: string;
  role: "user" | "assistant";
}

const FEYNMAN_TOPICS = [
  "Cell Division",
  "Photosynthesis",
  "Gravity & Orbits",
  "Linear Algebra",
  "Acid-Base Reactions",
  "The French Revolution",
];

const FREE_LIMIT = 3;

const API_BASE = process.env.EXPO_PUBLIC_DOMAIN
  ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
  : "";

function genId() {
  return Date.now().toString() + Math.random().toString(36).slice(2, 9);
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, addXP, incrementFeynman } = useUser();
  const [mode, setMode] = useState<Mode>("ai");
  const [topic, setTopic] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
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
      const data = await res.json() as { text?: string; error?: string };
      const reply = data.text ?? "Sorry, I couldn't respond right now. Please try again.";
      setMessages((prev) => [{ id: genId(), text: reply, role: "assistant" }, ...prev]);
      addXP(10);
    } catch {
      setMessages((prev) => [
        { id: genId(), text: "Connection error — please check your internet and try again.", role: "assistant" },
        ...prev,
      ]);
    } finally {
      setTyping(false);
    }
  }, [input, typing, mode, topic, messages, addXP]);

  const startFeynman = (t: string) => {
    if (feynmanLocked) return;
    incrementFeynman();
    setTopic(t);
    setMessages([
      {
        id: genId(),
        role: "assistant",
        text: `Great choice! Explain "${t}" to me as if I know nothing about it. Start wherever you like.`,
      },
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const switchMode = (m: Mode) => {
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
          <View style={[styles.aiIcon, { backgroundColor: colors.primary + "33" }]}>
            <Ionicons name="bulb" size={14} color={colors.primary} />
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser
              ? { backgroundColor: colors.primary }
              : { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
          ]}
        >
          <Text
            style={[
              styles.bubbleTxt,
              { color: isUser ? "#fff" : colors.text, fontFamily: "Inter_400Regular" },
            ]}
          >
            {item.text}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 16, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerLeft}>
          {mode === "feynman" && topic ? (
            <Pressable
              onPress={() => { setTopic(null); setMessages([]); }}
              style={{ marginRight: 12 }}
            >
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
          ) : null}
          <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
            {mode === "feynman" && topic ? topic : "Chat"}
          </Text>
        </View>
        <View
          style={[styles.modeSwitcher, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {(["ai", "feynman"] as Mode[]).map((m) => (
            <Pressable
              key={m}
              onPress={() => switchMode(m)}
              style={[styles.modeTab, mode === m && { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.modeTxt,
                  { color: mode === m ? "#fff" : colors.textSecondary, fontFamily: "Inter_500Medium" },
                ]}
              >
                {m === "ai" ? "AI Chat" : "Feynman"}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Feynman topic picker */}
      {showTopicPicker ? (
        <FlatList
          data={FEYNMAN_TOPICS}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: botPad + 20 }}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View style={styles.feynmanIntro}>
              <View style={[styles.feynmanIcon, { backgroundColor: colors.primary + "22" }]}>
                <Ionicons name="bulb" size={26} color={colors.primary} />
              </View>
              <Text style={[styles.feynmanTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                Feynman Technique
              </Text>
              <Text
                style={[styles.feynmanSub, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}
              >
                Explain a concept to the AI. If you can teach it, you truly know it.
              </Text>
              {feynmanLocked ? (
                <View style={[styles.lockBanner, { backgroundColor: "#5C5EF022", borderColor: "#5C5EF055" }]}>
                  <Ionicons name="lock-closed" size={15} color={colors.primary} />
                  <Text style={[styles.lockTxt, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
                    Daily limit reached — upgrade to Pro for unlimited sessions
                  </Text>
                </View>
              ) : (
                <Text style={[styles.sessionsLeft, { color: "#F59E0B", fontFamily: "Inter_500Medium" }]}>
                  {feynmanLeft} of {FREE_LIMIT} sessions remaining today
                </Text>
              )}
              <Text
                style={[styles.topicsLabel, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}
              >
                CHOOSE A TOPIC
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.topicChip,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  opacity: feynmanLocked ? 0.45 : pressed ? 0.8 : 1,
                },
              ]}
              onPress={() => !feynmanLocked && startFeynman(item)}
              disabled={feynmanLocked}
            >
              <Text style={[styles.topicTxt, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                {item}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.textMuted} />
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
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
                  <View style={[styles.aiIcon, { backgroundColor: colors.primary + "33" }]}>
                    <Ionicons name="bulb" size={14} color={colors.primary} />
                  </View>
                  <View
                    style={[
                      styles.bubble,
                      { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.bubbleTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                      Thinking...
                    </Text>
                  </View>
                </View>
              ) : null
            }
            ListEmptyComponent={
              !typing ? (
                <View style={styles.emptyChat}>
                  <Ionicons name="chatbubbles-outline" size={40} color={colors.textMuted} />
                  <Text style={[styles.emptyChatTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                    {mode === "ai"
                      ? "Ask me anything about your studies"
                      : "Start explaining a topic to the AI"}
                  </Text>
                </View>
              ) : null
            }
          />

          {/* Input bar */}
          <View
            style={[
              styles.inputBar,
              { borderTopColor: colors.border, paddingBottom: botPad + 12 },
            ]}
          >
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
              placeholder={mode === "ai" ? "Ask a question..." : "Start explaining..."}
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              maxLength={500}
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
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerTitle: { fontSize: 20 },
  modeSwitcher: { flexDirection: "row", borderRadius: 12, borderWidth: 1, overflow: "hidden" },
  modeTab: { paddingHorizontal: 14, paddingVertical: 7 },
  modeTxt: { fontSize: 13 },
  feynmanIntro: { alignItems: "center", paddingVertical: 28, gap: 10 },
  feynmanIcon: { width: 60, height: 60, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  feynmanTitle: { fontSize: 20 },
  feynmanSub: { fontSize: 14, textAlign: "center", lineHeight: 20, paddingHorizontal: 24 },
  lockBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    width: "100%",
  },
  lockTxt: { fontSize: 13, flex: 1 },
  sessionsLeft: { fontSize: 13 },
  topicsLabel: { fontSize: 11, letterSpacing: 1.2, marginTop: 8, alignSelf: "flex-start" },
  topicChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  topicTxt: { fontSize: 14 },
  msgRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "90%" },
  msgRowUser: { alignSelf: "flex-end", flexDirection: "row-reverse" },
  aiIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  bubble: { maxWidth: "82%", padding: 12, borderRadius: 16 },
  bubbleTxt: { fontSize: 14, lineHeight: 20 },
  emptyChat: { alignItems: "center", gap: 12, paddingTop: 60 },
  emptyChatTxt: { fontSize: 14, textAlign: "center" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
});
