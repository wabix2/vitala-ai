import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";

interface PremiumGateProps {
  children: React.ReactNode;
  feature?: string;
  inline?: boolean;
}

export function PremiumGate({ children, feature = "this feature", inline = false }: PremiumGateProps) {
  const { isSubscribed, isLoading } = useSubscription();
  const colors = useColors();
  const router = useRouter();

  if (isLoading || isSubscribed) return <>{children}</>;

  if (inline) {
    return (
      <Pressable
        style={[styles.inlineBadge, { backgroundColor: `${colors.primary}15`, borderColor: `${colors.primary}40` }]}
        onPress={() => router.push("/paywall")}
      >
        <Feather name="lock" size={12} color={colors.primary} />
        <Text style={[styles.inlineBadgeText, { color: colors.primary }]}>Pro</Text>
      </Pressable>
    );
  }

  return (
    <View style={[styles.gate, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.lockCircle, { backgroundColor: `${colors.primary}15` }]}>
        <Feather name="lock" size={28} color={colors.primary} />
      </View>
      <Text style={[styles.gateTitle, { color: colors.foreground }]}>Pro Feature</Text>
      <Text style={[styles.gateDesc, { color: colors.mutedForeground }]}>
        Upgrade to Vitala AI Pro to unlock {feature}.
      </Text>
      <Pressable
        style={[styles.upgradeBtn, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/paywall")}
      >
        <Feather name="zap" size={16} color="#fff" />
        <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
      </Pressable>
    </View>
  );
}

interface UsageLimitBannerProps {
  used: number;
  limit: number;
  label: string;
}

export function UsageLimitBanner({ used, limit, label }: UsageLimitBannerProps) {
  const { isSubscribed } = useSubscription();
  const colors = useColors();
  const router = useRouter();

  if (isSubscribed) return null;

  const remaining = Math.max(0, limit - used);
  const isNearLimit = remaining <= 2;
  const isAtLimit = remaining === 0;
  const color = isAtLimit ? "#FF4444" : isNearLimit ? "#F97316" : colors.primary;

  return (
    <Pressable
      style={[styles.usageBanner, { backgroundColor: `${color}12`, borderColor: `${color}30` }]}
      onPress={() => router.push("/paywall")}
    >
      <Feather name={isAtLimit ? "alert-circle" : "info"} size={14} color={color} />
      <Text style={[styles.usageText, { color }]}>
        {isAtLimit
          ? `Daily ${label} limit reached. `
          : `${remaining} ${label} remaining today. `}
        <Text style={{ fontFamily: "Inter_700Bold" }}>Upgrade to Pro</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gate: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    gap: 12,
    margin: 16,
  },
  lockCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  gateTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  gateDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  upgradeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 4,
  },
  upgradeBtnText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  inlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  inlineBadgeText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  usageBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  usageText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
});
