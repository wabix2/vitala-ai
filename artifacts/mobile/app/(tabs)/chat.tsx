import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import {
  useListGeminiConversations,
  useCreateGeminiConversation,
  useDeleteGeminiConversation,
  getListGeminiConversationsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { GeminiConversation } from "@workspace/api-client-react";
import { t } from "@/lib/i18n";

export default function ChatListScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const lang = user?.language ?? "en";
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const { data: conversations, isLoading } = useListGeminiConversations();
  const createConv = useCreateGeminiConversation();
  const deleteConv = useDeleteGeminiConversation();

  const handleNewChat = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const now = new Date();
    const title = `Chat ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    const conv = await createConv.mutateAsync({ title });
    await queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
    router.push(`/chat/${conv.id}`);
  };

  const handleDelete = (conv: GeminiConversation) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this conversation?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteConv.mutateAsync({ id: conv.id });
          await queryClient.invalidateQueries({ queryKey: getListGeminiConversationsQueryKey() });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPadding + 12, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          {t("conversations", lang)}
        </Text>
        <Pressable
          onPress={handleNewChat}
          disabled={createConv.isPending}
          style={[styles.newBtn, { backgroundColor: colors.primary }]}
        >
          {createConv.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="plus" size={20} color="#fff" />
          )}
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : !conversations?.length ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
            <Feather name="message-circle" size={36} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No conversations yet</Text>
          <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
            Tap the + button to start a new AI chat
          </Text>
        </View>
      ) : (
        <FlatList
          data={[...conversations].reverse()}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.duration(300).delay(index * 60)}>
              <Pressable
                onPress={() => router.push(`/chat/${item.id}`)}
                onLongPress={() => handleDelete(item)}
                style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.convIcon, { backgroundColor: `${colors.primary}18` }]}>
                  <Feather name="message-circle" size={20} color={colors.primary} />
                </View>
                <View style={styles.convText}>
                  <Text
                    style={[styles.convTitle, { color: colors.foreground }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text style={[styles.convDate, { color: colors.mutedForeground }]}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
              </Pressable>
            </Animated.View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  newBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingHorizontal: 40 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
  list: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
  },
  convIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  convText: { flex: 1, gap: 3 },
  convTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  convDate: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
