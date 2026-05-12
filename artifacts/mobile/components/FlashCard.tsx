import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";

interface Props {
  front: string;
  back: string;
  index: number;
  total: number;
}

export function FlashCard({ front, back, index, total }: Props) {
  const colors = useColors();
  const [flipped, setFlipped] = useState(false);
  const rotation = useSharedValue(0);

  const flip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const target = flipped ? 0 : 1;
    rotation.value = withTiming(target, { duration: 400 });
    setFlipped(!flipped);
  };

  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 1], [0, 180])}deg` },
    ],
    backfaceVisibility: "hidden",
  }));

  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(rotation.value, [0, 1], [180, 360])}deg` },
    ],
    backfaceVisibility: "hidden",
  }));

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.counter, { color: colors.mutedForeground }]}>
        {index + 1} / {total}
      </Text>
      <Pressable onPress={flip} style={styles.cardWrapper}>
        <Animated.View
          style={[
            styles.card,
            frontStyle,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.label, { color: colors.primary }]}>QUESTION</Text>
          <Text style={[styles.text, { color: colors.foreground }]}>{front}</Text>
          <Text style={[styles.hint, { color: colors.mutedForeground }]}>
            Tap to reveal
          </Text>
        </Animated.View>
        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            backStyle,
            { backgroundColor: colors.primary, borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.label, { color: "rgba(255,255,255,0.7)" }]}>ANSWER</Text>
          <Text style={[styles.text, { color: "#fff" }]}>{back}</Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    width: "100%",
  },
  counter: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    marginBottom: 12,
  },
  cardWrapper: {
    width: "100%",
    height: 260,
  },
  card: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    gap: 12,
  },
  cardBack: {
    borderWidth: 0,
  },
  label: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1.5,
  },
  text: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    textAlign: "center",
    lineHeight: 28,
  },
  hint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 8,
  },
});
