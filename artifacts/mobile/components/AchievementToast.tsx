import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown, FadeOutUp, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { Achievement, useStreak } from "@/context/StreakContext";
import { useRouter } from "expo-router";

export function AchievementToast() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { newAchievements, clearNewAchievements } = useStreak();
  const [visible, setVisible] = React.useState<Achievement | null>(null);
  const queue = useRef<Achievement[]>([]);

  useEffect(() => {
    if (newAchievements.length > 0) {
      queue.current = [...queue.current, ...newAchievements];
      clearNewAchievements();
      if (!visible) showNext();
    }
  }, [newAchievements]);

  const showNext = useCallback(() => {
    const next = queue.current.shift();
    if (next) {
      setVisible(next);
      setTimeout(() => {
        setVisible(null);
        setTimeout(showNext, 400);
      }, 3500);
    }
  }, []);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(14)}
      exiting={FadeOutUp.duration(300)}
      style={[styles.toast, { backgroundColor: colors.card, borderColor: colors.border, top: insets.top + 8 }]}
    >
      <Pressable style={styles.inner} onPress={() => { setVisible(null); router.push("/achievements" as never); }}>
        <View style={[styles.iconWrap, { backgroundColor: "#F59E0B20" }]}>
          <Text style={styles.emoji}>{visible.icon}</Text>
        </View>
        <View style={styles.text}>
          <Text style={[styles.headline, { color: colors.foreground }]}>Achievement unlocked!</Text>
          <Text style={[styles.name, { color: "#F59E0B" }]}>{visible.title}</Text>
          {visible.xpReward > 0 && (
            <Text style={[styles.xpLine, { color: colors.mutedForeground }]}>+{visible.xpReward} XP earned</Text>
          )}
        </View>
        <Feather name="x" size={16} color={colors.mutedForeground} />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute", left: 16, right: 16, zIndex: 9999,
    borderRadius: 16, borderWidth: 1, shadowColor: "#000",
    shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 8,
  },
  inner: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 24 },
  text: { flex: 1, gap: 1 },
  headline: { fontSize: 11, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8 },
  name: { fontSize: 15, fontFamily: "Inter_700Bold" },
  xpLine: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
