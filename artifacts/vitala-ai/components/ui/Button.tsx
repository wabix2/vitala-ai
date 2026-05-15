import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";
import { useColors } from "@/hooks/useColors";
import { typography } from "@/constants/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
}: ButtonProps) {
  const colors = useColors();

  const containerStyle = [
    styles.base,
    styles[`size_${size}`],
    fullWidth && styles.fullWidth,
    variant === "primary" && { backgroundColor: colors.primary },
    variant === "secondary" && { backgroundColor: colors.secondary },
    variant === "outline" && { backgroundColor: "transparent", borderWidth: 1.5, borderColor: colors.primary },
    variant === "ghost" && { backgroundColor: "transparent" },
    (disabled || loading) && styles.disabled,
  ];

  const textStyle = [
    styles.label,
    styles[`labelSize_${size}`],
    variant === "primary" && { color: "#FFFFFF" },
    variant === "secondary" && { color: "#FFFFFF" },
    variant === "outline" && { color: colors.primary },
    variant === "ghost" && { color: colors.primary },
  ];

  return (
    <Pressable
      style={({ pressed }) => [...containerStyle, pressed && !disabled && styles.pressed]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" || variant === "ghost" ? colors.primary : "#FFFFFF"}
        />
      ) : (
        <>
          {icon}
          <Text style={textStyle}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
  },
  size_sm: { paddingVertical: 8, paddingHorizontal: 14 },
  size_md: { paddingVertical: 12, paddingHorizontal: 20 },
  size_lg: { paddingVertical: 16, paddingHorizontal: 24 },
  fullWidth: { width: "100%" },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  label: {
    fontFamily: typography.fontFamily.semiBold,
  },
  labelSize_sm: { fontSize: typography.size.sm },
  labelSize_md: { fontSize: typography.size.base },
  labelSize_lg: { fontSize: typography.size.md },
});
