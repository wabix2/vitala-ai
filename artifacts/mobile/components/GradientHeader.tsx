import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function GradientHeader({ title, subtitle, right }: Props) {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const gradientColors = isDark
    ? ([colors.background, colors.background] as [string, string])
    : (["#EEF0FF", colors.background] as [string, string]);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, { paddingTop: topPadding + 12 }]}
    >
      <View style={styles.row}>
        <View style={styles.titleGroup}>
          <Text style={[styles.title, { color: colors.foreground }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              {subtitle}
            </Text>
          )}
        </View>
        {right && <View style={styles.right}>{right}</View>}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleGroup: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
  right: {},
});
