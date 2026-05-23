import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { PurchasesPackage } from "react-native-purchases";
import { useColors } from "@/hooks/useColors";
import {
  getOffering,
  isPurchasesInitialized,
  purchasePackage,
  restorePurchases,
  type VitalaOffering,
} from "@/utils/premium";

const FALLBACK = {
  monthly: { price: "$4.99", per: "per month", legal: "$4.99 billed monthly. Cancel anytime from Google Play." },
  yearly: { price: "$29.99", per: "$2.50/mo billed yearly", legal: "$29.99 billed annually. Auto-renews unless cancelled 24 hours before renewal." },
  lifetime: { price: "$59.99", per: "one-time payment", legal: "One-time purchase. No recurring charges." },
};

const FEATURES = [
  "Everything in Free",
  "Unlimited mentor sessions",
  "Unlimited AI chat",
  "Advanced progress analytics",
  "Priority AI response speed",
  "Early access to new subjects",
  "Premium share card exports",
];

type PlanKey = "monthly" | "yearly" | "lifetime";

interface Props {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export default function PremiumPaywallModal({ visible, onClose, onPurchaseSuccess }: Props) {
  const colors = useColors();
  const [plan, setPlan] = useState<PlanKey>("yearly");
  const [offering, setOffering] = useState<VitalaOffering | null>(null);
  const [loadingOffering, setLoadingOffering] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const isInitialized = isPurchasesInitialized();

  useEffect(() => {
    if (!visible || Platform.OS === "web" || !isInitialized) return;
    setLoadingOffering(true);
    getOffering()
      .then(setOffering)
      .catch(() => {})
      .finally(() => setLoadingOffering(false));
  }, [visible, isInitialized]);

  const packageForPlan = (key: PlanKey): PurchasesPackage | null => {
    if (!offering) return null;
    if (key === "monthly") return offering.monthly;
    if (key === "yearly") return offering.yearly;
    if (key === "lifetime") return offering.lifetime;
    return null;
  };

  const priceFor = (key: PlanKey): string =>
    packageForPlan(key)?.product?.priceString ?? FALLBACK[key].price;

  const selectedPackage = packageForPlan(plan);
  const canPurchase = isInitialized && !!selectedPackage && !purchasing && !restoring;

  async function handlePurchase() {
    if (!selectedPackage) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchasing(true);
    try {
      const success = await purchasePackage(selectedPackage);
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onPurchaseSuccess?.();
        onClose();
      }
    } catch (e: any) {
      if (!e?.userCancelled) {
        Alert.alert("Purchase failed", e?.message ?? "Something went wrong. Please try again.", [{ text: "OK" }]);
      }
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    Haptics.selectionAsync();
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Purchases restored", "Your Vitala Pro access has been restored.", [
          { text: "Great", onPress: () => { onPurchaseSuccess?.(); onClose(); } },
        ]);
      } else {
        Alert.alert("Nothing to restore", "No previous purchases were found for this account.", [{ text: "OK" }]);
      }
    } catch {
      Alert.alert("Restore failed", "Please check your connection and try again.", [{ text: "OK" }]);
    } finally {
      setRestoring(false);
    }
  }

  const PLANS: { key: PlanKey; label: string; badge?: string; featured?: boolean }[] = [
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Annual", badge: "Save 50%", featured: true },
    { key: "lifetime", label: "Lifetime", badge: "Best value" },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={["#0F172A", "#1D4ED8", "#0891B2"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="rgba(255,255,255,0.82)" />
          </Pressable>
          <View style={styles.heroIconWrap}>
            <Ionicons name="sparkles" size={34} color="#FFFFFF" />
          </View>
          <Text style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}>Vitala Pro</Text>
          <Text style={[styles.heroSub, { fontFamily: "Inter_400Regular" }]}>
            Unlimited mentor sessions, deeper analytics, and a calmer path to mastery.
          </Text>
        </LinearGradient>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: "Inter_700Bold" }]}>
            CHOOSE YOUR PLAN
          </Text>

          {loadingOffering ? (
            <View style={styles.offeringLoader}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.loadingTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                Loading plans...
              </Text>
            </View>
          ) : (
            <View style={styles.plansCol}>
              {PLANS.map(({ key, label, badge, featured }) => {
                const selected = plan === key;
                const selectedDark = selected && featured;
                const bg = selectedDark ? "#111827" : selected ? colors.primary + "12" : colors.card;
                const bc = selected ? colors.primary : colors.border;
                const tc = selectedDark ? "#FFFFFF" : colors.text;
                const sub = selectedDark ? "rgba(255,255,255,0.72)" : colors.textMuted;
                return (
                  <Pressable
                    key={key}
                    style={[styles.planRow, { backgroundColor: bg, borderColor: bc, borderWidth: selected ? 2 : 1 }]}
                    onPress={() => { setPlan(key); Haptics.selectionAsync(); }}
                  >
                    <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.border }]}>
                      {selected && <View style={[styles.radioDot, { backgroundColor: selectedDark ? "#FFFFFF" : colors.primary }]} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.planTitleRow}>
                        <Text style={[styles.planName, { color: tc, fontFamily: "Inter_700Bold" }]}>{label}</Text>
                        {badge && (
                          <View style={[styles.badge, { backgroundColor: selectedDark ? "rgba(255,255,255,0.18)" : "#FEF3C7" }]}>
                            <Text style={[styles.badgeTxt, { color: selectedDark ? "#FFFFFF" : "#92400E", fontFamily: "Inter_700Bold" }]}>
                              {badge}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text style={[styles.planSub, { color: sub, fontFamily: "Inter_400Regular" }]}>
                        {FALLBACK[key].per}
                      </Text>
                    </View>
                    <Text style={[styles.planPrice, { color: tc, fontFamily: "Inter_700Bold" }]}>
                      {priceFor(key)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}

          <Text style={[styles.label, { color: colors.textMuted, fontFamily: "Inter_700Bold" }]}>
            WHAT YOU GET
          </Text>
          <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {FEATURES.map((f, i) => (
              <View key={f} style={[styles.featureRow, i < FEATURES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={styles.featureCheck}>
                  <Ionicons name="checkmark" size={13} color="#059669" />
                </View>
                <Text style={[styles.featureTxt, { color: colors.text, fontFamily: "Inter_400Regular" }]}>{f}</Text>
              </View>
            ))}
          </View>

          <View style={[styles.freeNote, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="information-circle-outline" size={16} color={colors.primary} />
            <Text style={[styles.freeNoteTxt, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              Free plan includes 3 Feynman sessions per day, quizzes, flashcards, and leaderboard access.
            </Text>
          </View>

          {Platform.OS === "web" ? (
            <View style={[styles.cta, styles.ctaDisabled]}>
              <Ionicons name="lock-closed" size={18} color="rgba(255,255,255,0.65)" />
              <Text style={[styles.ctaTxt, { fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.76)" }]}>
                Available on Android and iOS
              </Text>
            </View>
          ) : !isInitialized ? (
            <View style={[styles.cta, styles.ctaDisabled]}>
              <Ionicons name="lock-closed" size={18} color="rgba(255,255,255,0.65)" />
              <Text style={[styles.ctaTxt, { fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.76)" }]}>
                Purchases not configured
              </Text>
            </View>
          ) : (
            <Pressable style={[styles.cta, !canPurchase && styles.ctaDisabled]} onPress={handlePurchase} disabled={!canPurchase}>
              {purchasing ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                  <Text style={[styles.ctaTxt, { fontFamily: "Inter_700Bold" }]}>
                    {plan === "lifetime"
                      ? `Get Lifetime Access - ${priceFor("lifetime")}`
                      : plan === "yearly"
                      ? `Start Annual Plan - ${priceFor("yearly")}`
                      : `Start Monthly Plan - ${priceFor("monthly")}`}
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {Platform.OS !== "web" && isInitialized && (
            <Pressable style={styles.restoreBtn} onPress={handleRestore} disabled={restoring || purchasing}>
              {restoring ? (
                <ActivityIndicator color={colors.textMuted} size="small" />
              ) : (
                <Text style={[styles.restoreTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  Restore previous purchases
                </Text>
              )}
            </Pressable>
          )}

          <Text style={[styles.legal, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {FALLBACK[plan].legal}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: 24,
    paddingBottom: 34,
    alignItems: "center",
    gap: 10,
  },
  closeBtn: { alignSelf: "flex-end", padding: 4, marginBottom: 4 },
  heroIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 28, color: "#FFFFFF" },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.78)", textAlign: "center", lineHeight: 20, maxWidth: 310 },
  body: { padding: 20, gap: 14, paddingBottom: 44 },
  label: { fontSize: 11, letterSpacing: 1.2 },
  offeringLoader: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  loadingTxt: { fontSize: 13 },
  plansCol: { gap: 10 },
  planRow: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 18 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  planTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planName: { fontSize: 15 },
  planSub: { fontSize: 12, marginTop: 2 },
  planPrice: { fontSize: 18 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  badgeTxt: { fontSize: 10 },
  featuresCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  featureCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center" },
  featureTxt: { fontSize: 14, flex: 1 },
  freeNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 13, borderRadius: 14, borderWidth: 1 },
  freeNoteTxt: { fontSize: 12, flex: 1, lineHeight: 17 },
  cta: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 18, borderRadius: 18, backgroundColor: "#2563EB", minHeight: 58 },
  ctaDisabled: { backgroundColor: "#94A3B8" },
  ctaTxt: { color: "#FFFFFF", fontSize: 16 },
  restoreBtn: { alignItems: "center", paddingVertical: 8 },
  restoreTxt: { fontSize: 13 },
  legal: { fontSize: 11, textAlign: "center", lineHeight: 16 },
});
