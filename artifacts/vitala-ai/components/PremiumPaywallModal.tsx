import * as Haptics from "expo-haptics";
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
import { useColors } from "@/hooks/useColors";
import { purchasePremium, restorePurchases } from "@/utils/premium";

const MONTHLY_PRICE = "$4.99";
const ANNUAL_PRICE = "$29.99";
const ANNUAL_PER_MONTH = "$2.50";
const ANNUAL_SAVINGS = "Save 50%";

const FEATURES_FREE = [
  { label: "3 Feynman AI sessions / day", included: true },
  { label: "Unlimited quizzes & flashcards", included: true },
  { label: "XP, levels & streak tracking", included: true },
  { label: "Global leaderboard", included: true },
  { label: "Unlimited AI sessions", included: false },
  { label: "Advanced progress analytics", included: false },
  { label: "Priority AI response speed", included: false },
  { label: "Early access to new subjects", included: false },
];

const FEATURES_PREMIUM = [
  { label: "Everything in Free", included: true },
  { label: "Unlimited AI chat sessions", included: true },
  { label: "Unlimited Feynman sessions", included: true },
  { label: "Advanced progress analytics", included: true },
  { label: "Priority AI response speed", included: true },
  { label: "Early access to new subjects", included: true },
  { label: "Achievement export & sharing", included: true },
  { label: "Cancel anytime", included: true },
];

type Plan = "monthly" | "annual";

interface Props {
  visible: boolean;
  onClose: () => void;
  onPurchaseSuccess?: () => void;
}

export default function PremiumPaywallModal({ visible, onClose, onPurchaseSuccess }: Props) {
  const colors = useColors();
  const [plan, setPlan] = useState<Plan>("annual");
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Premium", "Purchase is available on iOS and Android only.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    try {
      const success = await purchasePremium();
      if (success) {
        Alert.alert(
          "Welcome to Premium!",
          "You now have unlimited access to all features.",
          [{ text: "Let's go!", onPress: () => { onPurchaseSuccess?.(); onClose(); } }]
        );
      } else {
        Alert.alert("Purchase Cancelled", "You can try again anytime.");
      }
    } catch {
      Alert.alert("Purchase Failed", "Please try again or restore purchases.");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      const restored = await restorePurchases();
      if (restored) {
        Alert.alert("Restored!", "Your premium access has been restored.", [
          { text: "Continue", onPress: () => { onPurchaseSuccess?.(); onClose(); } },
        ]);
      } else {
        Alert.alert("Nothing to Restore", "No previous purchases found for this account.");
      }
    } catch {
      Alert.alert("Restore Failed", "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.heroSection, { backgroundColor: "#1D72E8" }]}>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={22} color="rgba(255,255,255,0.8)" />
          </Pressable>
          <View style={styles.heroContent}>
            <View style={styles.heroIconWrap}>
              <Ionicons name="flash" size={38} color="#FFFFFF" />
            </View>
            <Text style={[styles.heroTitle, { fontFamily: "Inter_700Bold" }]}>
              Vitala Premium
            </Text>
            <Text style={[styles.heroSub, { fontFamily: "Inter_400Regular" }]}>
              Unlock unlimited AI learning, powered by the Feynman Technique
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
          {/* Plan Selector */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: "Inter_600SemiBold" }]}>
            CHOOSE YOUR PLAN
          </Text>

          <View style={styles.plansRow}>
            {/* Monthly */}
            <Pressable
              style={[
                styles.planCard,
                {
                  backgroundColor: plan === "monthly" ? colors.primary + "10" : colors.card,
                  borderColor: plan === "monthly" ? colors.primary : colors.border,
                  borderWidth: plan === "monthly" ? 2 : 1,
                },
              ]}
              onPress={() => { setPlan("monthly"); Haptics.selectionAsync(); }}
            >
              <Text style={[styles.planName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                Monthly
              </Text>
              <Text style={[styles.planPrice, { color: plan === "monthly" ? colors.primary : colors.text, fontFamily: "Inter_700Bold" }]}>
                {MONTHLY_PRICE}
              </Text>
              <Text style={[styles.planPer, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                per month
              </Text>
              {plan === "monthly" && (
                <View style={[styles.selectedDot, { backgroundColor: colors.primary }]} />
              )}
            </Pressable>

            {/* Annual — highlighted */}
            <Pressable
              style={[
                styles.planCard,
                styles.planCardFeatured,
                {
                  backgroundColor: plan === "annual" ? "#1D72E8" : colors.card,
                  borderColor: plan === "annual" ? "#1D72E8" : colors.border,
                  borderWidth: plan === "annual" ? 2 : 1,
                },
              ]}
              onPress={() => { setPlan("annual"); Haptics.selectionAsync(); }}
            >
              <View style={styles.savingsBadge}>
                <Text style={[styles.savingsTxt, { fontFamily: "Inter_700Bold" }]}>
                  {ANNUAL_SAVINGS}
                </Text>
              </View>
              <Text style={[styles.planName, { color: plan === "annual" ? "#FFFFFF" : colors.text, fontFamily: "Inter_600SemiBold" }]}>
                Annual
              </Text>
              <Text style={[styles.planPrice, { color: plan === "annual" ? "#FFFFFF" : colors.text, fontFamily: "Inter_700Bold" }]}>
                {ANNUAL_PRICE}
              </Text>
              <Text style={[styles.planPer, { color: plan === "annual" ? "rgba(255,255,255,0.7)" : colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                {ANNUAL_PER_MONTH}/mo · billed yearly
              </Text>
              {plan === "annual" && (
                <View style={[styles.selectedDot, { backgroundColor: "#FFFFFF" }]} />
              )}
            </Pressable>
          </View>

          {/* What's included */}
          <Text style={[styles.sectionLabel, { color: colors.textMuted, fontFamily: "Inter_600SemiBold" }]}>
            WHAT YOU GET
          </Text>

          <View style={[styles.featuresCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {FEATURES_PREMIUM.map((f, i) => (
              <View
                key={i}
                style={[
                  styles.featureRow,
                  i < FEATURES_PREMIUM.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                ]}
              >
                <View style={[styles.featureCheck, { backgroundColor: "#DCFCE7" }]}>
                  <Ionicons name="checkmark" size={13} color="#10B981" />
                </View>
                <Text style={[styles.featureTxt, { color: colors.text, fontFamily: "Inter_400Regular" }]}>
                  {f.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Free vs Premium side-note */}
          <View style={[styles.comparisonNote, { backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }]}>
            <Ionicons name="information-circle" size={16} color="#F59E0B" />
            <Text style={[styles.comparisonTxt, { color: "#92400E", fontFamily: "Inter_400Regular" }]}>
              Free plan includes 3 Feynman sessions per day and full quiz & flashcard access.
            </Text>
          </View>

          {/* CTA */}
          <Pressable
            style={({ pressed }) => [
              styles.ctaBtn,
              { backgroundColor: "#1D72E8", opacity: pressed || loading ? 0.88 : 1 },
            ]}
            onPress={handlePurchase}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name="flash" size={18} color="#FFFFFF" />
                <Text style={[styles.ctaTxt, { fontFamily: "Inter_700Bold" }]}>
                  {plan === "annual"
                    ? `Start Premium — ${ANNUAL_PRICE}/year`
                    : `Start Premium — ${MONTHLY_PRICE}/month`}
                </Text>
              </>
            )}
          </Pressable>

          {/* Legal */}
          <Text style={[styles.legalTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {plan === "annual"
              ? `${ANNUAL_PRICE} billed annually. Auto-renews unless cancelled 24h before the renewal date.`
              : `${MONTHLY_PRICE} billed monthly. Cancel anytime from your Google Play account.`}
          </Text>

          {/* Restore */}
          <Pressable style={styles.restoreBtn} onPress={handleRestore} disabled={loading}>
            <Text style={[styles.restoreTxt, { color: colors.primary, fontFamily: "Inter_500Medium" }]}>
              Already purchased? Restore
            </Text>
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  closeBtn: { alignSelf: "flex-end", padding: 4, marginBottom: 8 },
  heroContent: { alignItems: "center", gap: 10 },
  heroIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: { fontSize: 26, color: "#FFFFFF" },
  heroSub: { fontSize: 14, color: "rgba(255,255,255,0.8)", textAlign: "center", lineHeight: 20, paddingHorizontal: 16 },
  scrollBody: { padding: 20, gap: 14, paddingBottom: 40 },
  sectionLabel: { fontSize: 11, letterSpacing: 1.2, marginBottom: 2 },
  plansRow: { flexDirection: "row", gap: 12, marginBottom: 4 },
  planCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    alignItems: "center",
    gap: 4,
    position: "relative",
  },
  planCardFeatured: { overflow: "visible" },
  planName: { fontSize: 14 },
  planPrice: { fontSize: 26 },
  planPer: { fontSize: 11, textAlign: "center" },
  selectedDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  savingsBadge: {
    position: "absolute",
    top: -10,
    backgroundColor: "#F59E0B",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  savingsTxt: { color: "#FFFFFF", fontSize: 11 },
  featuresCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 4 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 13, paddingHorizontal: 16 },
  featureCheck: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  featureTxt: { fontSize: 14, flex: 1 },
  comparisonNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  comparisonTxt: { fontSize: 12, flex: 1, lineHeight: 17 },
  ctaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#1D72E8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 4,
  },
  ctaTxt: { color: "#FFFFFF", fontSize: 16 },
  legalTxt: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  restoreBtn: { alignItems: "center", paddingVertical: 4 },
  restoreTxt: { fontSize: 13 },
});
