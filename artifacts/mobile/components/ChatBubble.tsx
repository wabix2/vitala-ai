import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface Props {
  role: "user" | "assistant";
  content: string;
  isStreaming?: boolean;
  index?: number;
}

export function ChatBubble({ role, content, isStreaming, index = 0 }: Props) {
  const colors = useColors();
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await Clipboard.setStringAsync(content);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(index * 50)}
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.aiContainer,
      ]}
    >
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>V</Text>
        </View>
      )}
      <Pressable
        onLongPress={handleCopy}
        style={[
          styles.bubble,
          {
            backgroundColor: isUser ? colors.userBubble : colors.aiBubble,
            borderColor: isUser ? "transparent" : colors.border,
            borderWidth: isUser ? 0 : 1,
            borderBottomRightRadius: isUser ? 4 : colors.radius,
            borderBottomLeftRadius: isUser ? colors.radius : 4,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: isUser ? colors.userBubbleText : colors.aiBubbleText,
            },
          ]}
        >
          {content}
          {isStreaming && (
            <Text style={[styles.cursor, { color: colors.primary }]}>▋</Text>
          )}
        </Text>
        {copied && (
          <Text style={[styles.copiedLabel, { color: colors.accent }]}>
            Copied!
          </Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    paddingHorizontal: 16,
    alignItems: "flex-end",
    gap: 8,
  },
  userContainer: {
    justifyContent: "flex-end",
  },
  aiContainer: {
    justifyContent: "flex-start",
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  avatarText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Inter_700Bold",
  },
  bubble: {
    maxWidth: "78%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    fontFamily: "Inter_400Regular",
  },
  cursor: {
    fontSize: 14,
  },
  copiedLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 4,
    textAlign: "right",
  },
});
