import * as Haptics from "expo-haptics";
import React, { useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import type { PurchasesPackage } from "react-native-purchases";
import { useColors } from "@/hooks/useColors";
import { getOffering, type VitalaOffering } from "@/utils/premium";

const FALLBACK = {
  monthly:  { price: "$4.99",  per: "per month",                legal: "$4.99 billed monthly. Cancel anytime from Google Play." },
  yearly:   { price: "$29.99", per: "$2.50/mo · billed yearly", legal: "$29.99 billed annually. Auto-renews unless cancelled 24 h before renewal." },
  lifetime: { price: "$59.99", per: "one-time payment",         legal: "One-time purchase. No recurring charges." },
};

const FEATURES = [
  "Everything in Free",
  "Unlimited AI chat sessions",
  "Unlimited Feynman sessions",
  "Advanced progress analytics",
  "Priority AI response speed",
  "Early access to new subjects",
  "Achievement export & sharing",
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

  useEffect(() => {
    if (!visible || Platform.OS === "web") return;
    setLoadingOffering(true);
    getOffering()
      .then(setOffering)
      .catch(() => {})
      .finally(() => setLoadingOffering(false));
  }, [visible]);

  const packageForPlan = (key: PlanKey): PurchasesPackage | null => {
    if (!offering) return null;
    if (key === "monthly")  return offering.monthly;
    if (key === "yearly")   return offering.yearly;
    if (key === "lifetime") return offering.lifetime;
    return null;
  };

  const priceFor = (key: PlanKey): string =>
    packageForPlan(key)?.product?.priceString ?? FALLBACK[key].price;

  const PLANS: { key: PlanKey; label: string; badge?: string; dark?: boolean }[] = [
    { key: "monthly",  label: "Monthly" },
    { key: "yearly",   label: "Annual",   badge: "Save 50%", dark: true },
    { key: "lifetime", label: "Lifetime", badge: "Best Value" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>

        {/* Hero */}
        <View style={styles.hero}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <View style={styles.heroIconWrap}>
            <Ionicons name="flash" size={38} color="#FFFFFF" />
          </View>
          <Text style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}>Vitala Pro</Text>
          <Text style={[styles.heroSub, { fontFamily: "Inter_400Regular" }]}>
            Unlimited AI learning — powered by the Feynman Technique
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

          {/* Plan selector */}
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: "Inter_600SemiBold" }]}>
            CHOOSE YOUR PLAN
          </Text>

          {loadingOffering ? (
            <View style={styles.offeringLoader}>
              <ActivityIndicator color={colors.primary} />
              <Text style={[styles.loadingTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                Loading plans…
              </Text>
            </View>
          ) : (
            <View style={styles.plansCol}>
              {PLANS.map(({ key, label, badge, dark }) => {
                const selected = plan === key;
                const bg = selected ? (dark ? "#1D72E8" : colors.primary + "12") : colors.card;
                const bc = selected ? "#1D72E8" : colors.border;
                const tc = selected && dark ? "#FFFFFF" : colors.text;
                const sub = selected && dark ? "rgba(255,255,255,0.75)" : colors.textMuted;
                return (
                  <Pressable
                    key={key}
                    style={[styles.planRow, { backgroundColor: bg, borderColor: bc, borderWidth: selected ? 2 : 1 }]}
                    onPress={() => { setPlan(key); Haptics.selectionAsync(); }}
                  >
                    <View style={[styles.radio, { borderColor: selected ? "#1D72E8" : colors.border }]}>
                      {selected && <View style={[styles.radioDot, { backgroundColor: dark ? "#FFFFFF" : "#1D72E8" }]} />}
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.planTitleRow}>
                        <Text style={[styles.planName, { color: tc, fontFamily: "Inter_600SemiBold" }]}>
                          {label}
                        </Text>
                        {badge && (
                          <View style={[styles.badge, { backgroundColor: dark && selected ? "rgba(255,255,255,0.22)" : "#F59E0B22" }]}>
                            <Text style={[styles.badgeTxt, { color: dark && selected ? "#FFFFFF" : "#B45309", fontFamily: "Inter_700Bold" }]}>
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

          {/* Feature list */}
          <Text style={[styles.label, { color: colors.textMuted, fontFamily: "Inter_600SemiBold" }]}>
            WHAT YOU GET
          </Text>
          <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {FEATURES.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.featureRow,
                  i < FEATURES.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={styles.featureCheck}>
                  <Ionicons name="checkmark" size={13} color="#10B981" />
                </View>
                <Text style={[styles.featureTxt, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                  {f}
                </Text>
              </View>
            ))}
          </View>

          {/* Free tier note */}
          <View style={[styles.freeNote, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
            <Ionicons name="information-circle" size={15} color="#F59E0B" />
            <Text style={[styles.freeNoteTxt, { color: "#92400E", fontFamily: "Inter_400Regular" }]}>
              Free plan: 3 Feynman sessions / day · full quizzes & flashcards · leaderboard
            </Text>
          </View>

          {/* Purchase Unavailable CTA */}
          <View style={[styles.cta, styles.ctaDisabled]}>
            <Ionicons name="lock-closed" size={18} color="rgba(255,255,255,0.6)" />
            <Text style={[styles.ctaTxt, { fontFamily: "Inter_700Bold", color: "rgba(255,255,255,0.7)" }]}>
              Purchase Unavailable
            </Text>
          </View>

          {/* Coming soon info */}
          <View style={[styles.comingSoonNote, { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" }]}>
            <Ionicons name="information-circle" size={15} color="#0EA5E9" />
            <Text style={[styles.comingSoonTxt, { color: "#0369A1", fontFamily: "Inter_400Regular" }]}>
              In-app purchases will be available once the app is published on Google Play. All features above will unlock automatically.
            </Text>
          </View>

          {/* Legal */}
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
    backgroundColor: "#1D72E8",
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: "center",
    gap: 10,
  },
  closeBtn: { alignSelf: "flex-end", padding: 4, marginBottom: 4 },
  heroIconWrap: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center", justifyContent: "center",
  },
  heroTitle: { fontSize: 26, color: "#FFFFFF" },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 20 },
  body: { padding: 20, gap: 14, paddingBottom: 44 },
  label: { fontSize: 11, letterSpacing: 1.2 },
  offeringLoader: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12 },
  loadingTxt: { fontSize: 13 },
  plansCol: { gap: 10 },
  planRow: {
    flexDirection: "row", alignItems: "center",
    gap: 14, padding: 16, borderRadius: 16,
  },
  radio: {
    width: 20, height: 20, borderRadius: 10, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  planTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  planName: { fontSize: 15 },
  planSub: { fontSize: 12, marginTop: 2 },
  planPrice: { fontSize: 18 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  badgeTxt: { fontSize: 11 },
  featuresCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  featureCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#DCFCE7", alignItems: "center", justifyContent: "center" },
  featureTxt: { fontSize: 14, flex: 1 },
  freeNote: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12, borderRadius: 12, borderWidth: 1 },
  freeNoteTxt: { fontSize: 12, flex: 1, lineHeight: 17 },
  cta: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, paddingVertical: 18, borderRadius: 16,
    backgroundColor: "#1D72E8",
  },
  ctaDisabled: { backgroundColor: "#94A3B8" },
  ctaTxt: { color: "#FFFFFF", fontSize: 16 },
  comingSoonNote: {
    flexDirection: "row", alignItems: "flex-start",
    gap: 8, padding: 12, borderRadius: 12, borderWidth: 1,
  },
  comingSoonTxt: { fontSize: 12, flex: 1, lineHeight: 17 },
  legal: { fontSize: 11, textAlign: "center", lineHeight: 16 },
});
