import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { useSubscription } from "@/lib/revenuecat";

const PERKS = [
  { icon: "message-circle", label: "Unlimited AI Chat", desc: "No daily message limits" },
  { icon: "layers", label: "Unlimited Flashcards", desc: "Up to 30 cards per set" },
  { icon: "check-square", label: "Extended Quizzes", desc: "Up to 20 questions" },
  { icon: "file-text", label: "Unlimited PDF Analysis", desc: "Multiple documents at once" },
  { icon: "clock", label: "Unlimited Chat History", desc: "All chats saved forever" },
  { icon: "zap", label: "Priority AI Responses", desc: "Faster generation speed" },
];

const PLAN_COLORS = {
  monthly: "#7B7FFF",
  yearly: "#00D4AA",
  lifetime: "#F97316",
};

export default function PaywallScreen() {
  const colors = useColors();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { offerings, isSubscribed, purchase, restore, isPurchasing, isRestoring, isLoading } =
    useSubscription();
  const [selectedPkg, setSelectedPkg] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const packages = offerings?.current?.availablePackages ?? [];

  const getPlanColor = (identifier: string): string => {
    if (identifier.includes("lifetime")) return PLAN_COLORS.lifetime;
    if (identifier.includes("annual") || identifier.includes("year")) return PLAN_COLORS.yearly;
    return PLAN_COLORS.monthly;
  };

  const getPlanLabel = (identifier: string) => {
    if (identifier.includes("lifetime")) return "Lifetime";
    if (identifier.includes("annual") || identifier.includes("year")) return "Yearly";
    return "Monthly";
  };

  const getPlanBadge = (identifier: string) => {
    if (identifier.includes("lifetime")) return "Best Value";
    if (identifier.includes("annual") || identifier.includes("year")) return "Save 50%";
    return null;
  };

  const handlePurchase = async () => {
    const pkg = packages.find((p) => p.identifier === selectedPkg);
    if (!pkg) return;
    setShowConfirm(false);
    setError(null);
    try {
      await purchase(pkg);
      router.back();
    } catch (e: any) {
      if (e?.userCancelled) return;
      setError(e?.message ?? "Purchase failed. Please try again.");
    }
  };

  const handleRestore = async () => {
    setError(null);
    try {
      await restore();
      if (isSubscribed) router.back();
    } catch (e: any) {
      setError(e?.message ?? "Restore failed. Please try again.");
    }
  };

  if (isSubscribed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.alreadyPro}>
          <View style={[styles.checkCircle, { backgroundColor: `${colors.accent}20` }]}>
            <Feather name="check-circle" size={48} color={colors.accent} />
          </View>
          <Text style={[styles.proTitle, { color: colors.foreground }]}>You're already Pro!</Text>
          <Text style={[styles.proDesc, { color: colors.mutedForeground }]}>
            All premium features are unlocked and active.
          </Text>
          <Pressable
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={styles.doneBtnText}>Back to App</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Pressable
        style={[styles.closeBtn, { top: Platform.OS === "web" ? 80 : insets.top + 12 }]}
        onPress={() => router.back()}
      >
        <Feather name="x" size={22} color={colors.foreground} />
      </Pressable>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 24 }]}
      >
        <Animated.View entering={FadeInUp.duration(500)} style={styles.heroSection}>
          <LinearGradient
            colors={["#7B7FFF30", "#00D4AA15"]}
            style={styles.heroBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={[styles.heroIcon, { backgroundColor: `${colors.primary}20` }]}>
              <Feather name="zap" size={36} color={colors.primary} />
            </View>
            <Text style={[styles.heroTitle, { color: colors.foreground }]}>
              Vitala AI Pro
            </Text>
            <Text style={[styles.heroSubtitle, { color: colors.mutedForeground }]}>
              Unlock your full learning potential
            </Text>
          </LinearGradient>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)} style={styles.perksSection}>
          {PERKS.map((perk, i) => (
            <View key={perk.label} style={[styles.perkRow, { borderBottomColor: colors.border, borderBottomWidth: i < PERKS.length - 1 ? 1 : 0 }]}>
              <View style={[styles.perkIcon, { backgroundColor: `${colors.primary}15` }]}>
                <Feather name={perk.icon as any} size={18} color={colors.primary} />
              </View>
              <View style={styles.perkText}>
                <Text style={[styles.perkLabel, { color: colors.foreground }]}>{perk.label}</Text>
                <Text style={[styles.perkDesc, { color: colors.mutedForeground }]}>{perk.desc}</Text>
              </View>
              <Feather name="check" size={16} color={colors.accent} />
            </View>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.plansSection}>
          <Text style={[styles.plansTitle, { color: colors.foreground }]}>Choose a plan</Text>

          {isLoading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 24 }} />
          ) : packages.length === 0 ? (
            <Text style={[styles.noPkgs, { color: colors.mutedForeground }]}>
              No plans available right now. Please try again later.
            </Text>
          ) : (
            packages.map((pkg: any) => {
              const color = getPlanColor(pkg.identifier);
              const badge = getPlanBadge(pkg.identifier);
              const isSelected = selectedPkg === pkg.identifier;
              return (
                <Pressable
                  key={pkg.identifier}
                  style={[
                    styles.planCard,
                    {
                      borderColor: isSelected ? color : colors.border,
                      backgroundColor: isSelected ? `${color}12` : colors.card,
                    },
                  ]}
                  onPress={() => setSelectedPkg(pkg.identifier)}
                >
                  {badge && (
                    <View style={[styles.planBadge, { backgroundColor: color }]}>
                      <Text style={styles.planBadgeText}>{badge}</Text>
                    </View>
                  )}
                  <View style={styles.planRow}>
                    <View style={[styles.radio, { borderColor: isSelected ? color : colors.border }]}>
                      {isSelected && <View style={[styles.radioInner, { backgroundColor: color }]} />}
                    </View>
                    <View style={styles.planInfo}>
                      <Text style={[styles.planName, { color: colors.foreground }]}>
                        {getPlanLabel(pkg.identifier)}
                      </Text>
                      <Text style={[styles.planPrice, { color }]}>
                        {pkg.product.priceString}
                        {pkg.packageType !== "LIFETIME" && (
                          <Text style={[styles.planPeriod, { color: colors.mutedForeground }]}>
                            {pkg.identifier.includes("annual") || pkg.identifier.includes("year") ? "/year" : "/month"}
                          </Text>
                        )}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })
          )}
        </Animated.View>

        {error && (
          <Animated.View entering={FadeInDown.duration(300)} style={[styles.errorBox, { backgroundColor: "#FF444415", borderColor: "#FF4444" }]}>
            <Feather name="alert-circle" size={16} color="#FF4444" />
            <Text style={[styles.errorText, { color: "#FF4444" }]}>{error}</Text>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.actionsSection}>
          <Pressable
            style={[
              styles.subscribeBtn,
              {
                backgroundColor: selectedPkg
                  ? getPlanColor(selectedPkg)
                  : colors.muted,
                opacity: isPurchasing ? 0.7 : 1,
              },
            ]}
            onPress={() => {
              if (!selectedPkg) return;
              setShowConfirm(true);
            }}
            disabled={!selectedPkg || isPurchasing}
          >
            {isPurchasing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Feather name="zap" size={18} color="#fff" />
                <Text style={styles.subscribeBtnText}>
                  {selectedPkg ? `Get ${getPlanLabel(selectedPkg)}` : "Select a plan to continue"}
                </Text>
              </>
            )}
          </Pressable>

          <Pressable
            style={styles.restoreBtn}
            onPress={handleRestore}
            disabled={isRestoring}
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color={colors.mutedForeground} />
            ) : (
              <Text style={[styles.restoreText, { color: colors.mutedForeground }]}>
                Restore purchases
              </Text>
            )}
          </Pressable>

          <Text style={[styles.legalText, { color: colors.mutedForeground }]}>
            Subscriptions auto-renew unless cancelled. Cancel anytime in your app store settings.
          </Text>
        </Animated.View>
      </ScrollView>

      <Modal
        visible={showConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirm(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowConfirm(false)}>
          <View style={[styles.confirmSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="zap" size={32} color={colors.primary} style={{ alignSelf: "center", marginBottom: 12 }} />
            <Text style={[styles.confirmTitle, { color: colors.foreground }]}>Confirm Purchase</Text>
            <Text style={[styles.confirmDesc, { color: colors.mutedForeground }]}>
              You're about to unlock{" "}
              <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>
                Vitala AI Pro {selectedPkg ? `(${getPlanLabel(selectedPkg)})` : ""}
              </Text>
              . This will be charged to your app store account.
            </Text>
            <View style={styles.confirmBtns}>
              <Pressable
                style={[styles.confirmCancelBtn, { borderColor: colors.border }]}
                onPress={() => setShowConfirm(false)}
              >
                <Text style={[styles.confirmCancelText, { color: colors.foreground }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmOkBtn, { backgroundColor: selectedPkg ? getPlanColor(selectedPkg) : colors.primary }]}
                onPress={handlePurchase}
              >
                <Text style={styles.confirmOkText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  closeBtn: { position: "absolute", right: 16, zIndex: 10, padding: 8 },
  scroll: { paddingTop: 60 },
  heroSection: { paddingHorizontal: 16, marginBottom: 16 },
  heroBg: { borderRadius: 24, padding: 28, alignItems: "center", gap: 10 },
  heroIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  heroTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  heroSubtitle: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center" },
  perksSection: { marginHorizontal: 16, borderRadius: 18, overflow: "hidden", marginBottom: 16, backgroundColor: "transparent" },
  perkRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  perkIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  perkText: { flex: 1 },
  perkLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  perkDesc: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  plansSection: { paddingHorizontal: 16, marginBottom: 16 },
  plansTitle: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 12 },
  noPkgs: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", paddingVertical: 16 },
  planCard: { borderRadius: 16, borderWidth: 2, padding: 16, marginBottom: 10, position: "relative" },
  planBadge: { position: "absolute", top: -1, right: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 0, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  planBadgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  planRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  planInfo: { flex: 1 },
  planName: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  planPrice: { fontSize: 20, fontFamily: "Inter_700Bold", marginTop: 2 },
  planPeriod: { fontSize: 14, fontFamily: "Inter_400Regular" },
  actionsSection: { paddingHorizontal: 16, gap: 12 },
  subscribeBtn: { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  subscribeBtnText: { color: "#fff", fontSize: 17, fontFamily: "Inter_700Bold" },
  restoreBtn: { alignItems: "center", paddingVertical: 8 },
  restoreText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  legalText: { fontSize: 11, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 16 },
  errorBox: { marginHorizontal: 16, borderRadius: 12, borderWidth: 1, padding: 12, flexDirection: "row", gap: 8, alignItems: "center", marginBottom: 8 },
  errorText: { flex: 1, fontSize: 13, fontFamily: "Inter_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 24 },
  confirmSheet: { borderRadius: 24, borderWidth: 1, padding: 28, gap: 12, width: "100%" },
  confirmTitle: { fontSize: 20, fontFamily: "Inter_700Bold", textAlign: "center" },
  confirmDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
  confirmBtns: { flexDirection: "row", gap: 12, marginTop: 8 },
  confirmCancelBtn: { flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 14, alignItems: "center" },
  confirmCancelText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  confirmOkBtn: { flex: 1, borderRadius: 14, padding: 14, alignItems: "center" },
  confirmOkText: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
  alreadyPro: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  checkCircle: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },
  proTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  proDesc: { fontSize: 15, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 22 },
  doneBtn: { borderRadius: 14, paddingHorizontal: 32, paddingVertical: 14, marginTop: 8 },
  doneBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
