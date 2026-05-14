import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGetGeminiConversation } from "@workspace/api-client-react";
import { ChatBubble } from "@/components/ChatBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { streamChatMessage } from "@/services/stream";
import { useSubscription } from "@/lib/revenuecat";
import { UsageLimitBanner } from "@/components/PremiumGate";

const FREE_DAILY_LIMIT = 10;
const USAGE_KEY = "@vitala_chat_usage";

interface LocalMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
}

async function getTodayUsage(): Promise<number> {
  const today = new Date().toDateString();
  const raw = await AsyncStorage.getItem(USAGE_KEY);
  if (!raw) return 0;
  const data = JSON.parse(raw) as { date: string; count: number };
  if (data.date !== today) return 0;
  return data.count;
}

async function incrementUsage(): Promise<number> {
  const today = new Date().toDateString();
  const current = await getTodayUsage();
  const next = current + 1;
  await AsyncStorage.setItem(USAGE_KEY, JSON.stringify({ date: today, count: next }));
  return next;
}

export default function ChatScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const convId = parseInt(id ?? "0", 10);
  const { user } = useAuth();
  const { isSubscribed } = useSubscription();
  const lang = user?.language ?? "en";

  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [dailyUsed, setDailyUsed] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const headerHeight = Platform.OS === "ios" ? 52 : 56;

  const { data: conv, isLoading } = useGetGeminiConversation(convId, {
    query: { enabled: !!convId },
  });

  useEffect(() => {
    getTodayUsage().then(setDailyUsed);
  }, []);

  useEffect(() => {
    if (conv?.messages) {
      setMessages(
        conv.messages.map((m) => ({
          id: String(m.id),
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      );
    }
  }, [conv]);

  const atLimit = !isSubscribed && dailyUsed >= FREE_DAILY_LIMIT;

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    if (atLimit) {
      router.push("/paywall");
      return;
    }

    const text = input.trim();
    setInput("");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const newCount = await incrementUsage();
    setDailyUsed(newCount);

    const userMsg: LocalMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: text,
    };
    setMessages((prev) => [userMsg, ...prev]);
    setShowTyping(true);
    setIsStreaming(true);

    let aiMsgId = `a-${Date.now()}`;
    let firstChunk = true;

    await streamChatMessage(
      convId,
      text,
      lang,
      (chunk) => {
        if (firstChunk) {
          firstChunk = false;
          setShowTyping(false);
          const aiMsg: LocalMessage = {
            id: aiMsgId,
            role: "assistant",
            content: chunk,
            isStreaming: true,
          };
          setMessages((prev) => [aiMsg, ...prev]);
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === aiMsgId
                ? { ...m, content: m.content + chunk }
                : m,
            ),
          );
        }
      },
      () => {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsgId ? { ...m, isStreaming: false } : m)),
        );
        setShowTyping(false);
        setIsStreaming(false);
      },
      (err) => {
        setShowTyping(false);
        setIsStreaming(false);
        setMessages((prev) => [
          {
            id: `err-${Date.now()}`,
            role: "assistant",
            content: `Error: ${err}`,
          },
          ...prev,
        ]);
      },
    );
  }, [input, isStreaming, convId, lang, atLimit, router]);

  const title = conv?.title ?? "Chat";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
            paddingTop: Platform.OS === "web" ? 67 : insets.top,
          },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <View style={[styles.aiDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {title}
          </Text>
        </View>
        {!isSubscribed && (
          <Pressable onPress={() => router.push("/paywall")} style={[styles.proBtn, { backgroundColor: `${colors.primary}15` }]}>
            <Feather name="zap" size={13} color={colors.primary} />
            <Text style={[styles.proBtnText, { color: colors.primary }]}>Pro</Text>
          </Pressable>
        )}
        {isSubscribed && <View style={styles.placeholder} />}
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={headerHeight + (Platform.OS === "ios" ? insets.top : 0)}
      >
        {!isSubscribed && (
          <UsageLimitBanner
            used={dailyUsed}
            limit={FREE_DAILY_LIMIT}
            label="messages"
          />
        )}

        {isLoading ? (
          <View style={styles.loadingCenter}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ChatBubble
                role={item.role}
                content={item.content}
                isStreaming={item.isStreaming}
                index={index}
              />
            )}
            inverted
            ListHeaderComponent={showTyping ? <TypingIndicator /> : null}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <View style={[styles.emptyChatIcon, { backgroundColor: `${colors.primary}15` }]}>
                  <Feather name="cpu" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.emptyChatTitle, { color: colors.foreground }]}>
                  Ask Vitala anything
                </Text>
                <Text style={[styles.emptyChatDesc, { color: colors.mutedForeground }]}>
                  I can help you study, explain concepts, solve problems, and more.
                </Text>
                {!isSubscribed && (
                  <Text style={[styles.freeHint, { color: colors.mutedForeground }]}>
                    Free plan: {FREE_DAILY_LIMIT - dailyUsed} messages left today
                  </Text>
                )}
              </View>
            }
          />
        )}

        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: colors.card,
              borderTopColor: colors.border,
              paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
            },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: atLimit ? `${colors.surfaceAlt}80` : colors.surfaceAlt,
                color: colors.foreground,
                borderColor: atLimit ? "#FF444440" : colors.border,
              },
            ]}
            placeholder={atLimit ? "Daily limit reached — upgrade to Pro" : "Ask Vitala anything..."}
            placeholderTextColor={atLimit ? "#FF4444" : colors.mutedForeground}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={2000}
            returnKeyType="default"
            editable={!atLimit}
          />
          <Pressable
            onPress={atLimit ? () => router.push("/paywall") : handleSend}
            disabled={(!input.trim() || isStreaming) && !atLimit}
            style={[
              styles.sendBtn,
              {
                backgroundColor: atLimit
                  ? "#FF444425"
                  : input.trim() && !isStreaming
                  ? colors.primary
                  : colors.muted,
              },
            ]}
          >
            {isStreaming ? (
              <ActivityIndicator size="small" color={colors.mutedForeground} />
            ) : atLimit ? (
              <Feather name="lock" size={18} color="#FF4444" />
            ) : (
              <Feather
                name="send"
                size={18}
                color={input.trim() ? "#fff" : colors.mutedForeground}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  aiDot: { width: 8, height: 8, borderRadius: 4 },
  headerTitle: { fontSize: 16, fontFamily: "Inter_600SemiBold", flex: 1 },
  placeholder: { width: 30 },
  proBtn: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  proBtnText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { paddingVertical: 12 },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 40, paddingVertical: 60, gap: 12 },
  emptyChatIcon: { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyChatTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyChatDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  freeHint: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 4 },
  inputBar: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    maxHeight: 100,
    borderWidth: 1,
  },
  sendBtn: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
});
