import React from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { useColors } from "@/hooks/useColors";
import { shadows } from "@/constants/theme";

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
  padding?: number;
  shadow?: "none" | "sm" | "md";
}

export function Card({ children, style, onPress, padding = 16, shadow = "sm" }: CardProps) {
  const colors = useColors();

  const cardStyle = [
    styles.card,
    { backgroundColor: colors.card, borderColor: colors.border, padding },
    shadow === "sm" && shadows.sm,
    shadow === "md" && shadows.md,
    shadow === "none" && {},
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [...(Array.isArray(cardStyle) ? cardStyle : [cardStyle]), pressed && styles.pressed]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
