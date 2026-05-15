import React from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useColors } from "@/hooks/useColors";

const LAST_UPDATED = "May 15, 2026";
const APP_NAME = "Vitala AI";
const CONTACT_EMAIL = "support@vitala-ai.app";
const DEVELOPER_NAME = "Vitala AI";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: `We collect the following information when you use ${APP_NAME}:

• Study Progress — quiz scores, flashcard results, XP earned, streak count, and level, stored locally on your device.
• Username — a display name you choose during onboarding, used for the leaderboard.
• Device Information — device type, operating system version, and app version, collected automatically to improve app stability.
• Purchase Information — when you subscribe to Premium, transactions are processed by Google Play. We do not store your payment card details. RevenueCat (our payment platform) records your subscription status and entitlements.
• Notification Preferences — whether you have opted in to daily reminders, stored locally on your device.`,
  },
  {
    title: "2. How We Use Your Information",
    body: `We use the information we collect to:

• Power core app features (quizzes, flashcards, AI chat, Feynman sessions).
• Display your rank on the global leaderboard.
• Manage and verify your Premium subscription status.
• Send you optional daily study reminders (only if you enable them).
• Diagnose crashes and improve app performance.

We do not sell, rent, or share your personal information with third parties for marketing purposes.`,
  },
  {
    title: "3. Third-Party Services",
    body: `${APP_NAME} uses the following third-party services:

• RevenueCat — handles subscription purchases, entitlement verification, and purchase restoration. Privacy policy: https://www.revenuecat.com/privacy
• Google Play Billing — processes all Android in-app purchases. Privacy policy: https://policies.google.com/privacy
• Expo / EAS — provides the app build and update infrastructure. Privacy policy: https://expo.dev/privacy

Each service operates under its own privacy policy. We encourage you to review them.`,
  },
  {
    title: "4. Data Storage",
    body: `Most of your study data (XP, streaks, quiz history) is stored locally on your device using AsyncStorage and is not transmitted to our servers unless you appear on the leaderboard.

Leaderboard data (username, XP, level, streak) is stored on our servers to power the global rankings. This data is visible to other users of the app.

We retain leaderboard data for as long as you use the app. You can request deletion at any time by contacting us.`,
  },
  {
    title: "5. In-App Purchases & Subscriptions",
    body: `${APP_NAME} offers an optional Premium subscription with two plans:

• Monthly: $4.99 / month
• Annual: $29.99 / year

Subscriptions automatically renew unless cancelled at least 24 hours before the end of the current period. You can manage or cancel your subscription at any time through your Google Play account settings.

We do not issue refunds directly — refund requests must be submitted through Google Play.`,
  },
  {
    title: "6. Children's Privacy",
    body: `${APP_NAME} is designed for students of all ages. We do not knowingly collect personally identifiable information from children under 13 without parental consent.

If you believe a child under 13 has provided personal data without consent, please contact us immediately at ${CONTACT_EMAIL} and we will delete it promptly.`,
  },
  {
    title: "7. Notifications",
    body: `We may send you push notifications to remind you to study and maintain your streak. Notifications are entirely optional — you can enable or disable them at any time from the Profile screen under Settings.

We will never use notifications for advertising or promotional offers from third parties.`,
  },
  {
    title: "8. Your Rights",
    body: `Depending on your location, you may have the right to:

• Access the personal data we hold about you.
• Request correction of inaccurate data.
• Request deletion of your data.
• Withdraw consent for data processing at any time.

To exercise any of these rights, contact us at ${CONTACT_EMAIL}.`,
  },
  {
    title: "9. Security",
    body: `We take reasonable technical and organisational measures to protect your information against unauthorised access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "10. Changes to This Policy",
    body: `We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. We encourage you to review this policy periodically. Continued use of the app after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: "11. Contact Us",
    body: `If you have any questions about this Privacy Policy or how we handle your data, please contact us:

Email: ${CONTACT_EMAIL}
Developer: ${DEVELOPER_NAME}`,
  },
];

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom + 24;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: botPad }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backBtn, { opacity: pressed ? 0.6 : 1 }]}
          hitSlop={12}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
          Privacy Policy
        </Text>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.body}>
        {/* Intro */}
        <View style={[styles.introCard, { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" }]}>
          <Ionicons name="shield-checkmark" size={20} color="#1D72E8" />
          <Text style={[styles.introTxt, { color: "#1E40AF", fontFamily: "Inter_400Regular" }]}>
            {APP_NAME} is committed to protecting your privacy. This policy explains how we collect,
            use, and protect your information.
          </Text>
        </View>

        <Text style={[styles.metaTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
          Last updated: {LAST_UPDATED}
        </Text>

        {/* Sections */}
        {SECTIONS.map((section, i) => (
          <View key={i} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {section.title}
            </Text>
            <Text style={[styles.sectionBody, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
              {section.body}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <Text style={[styles.footerTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            {APP_NAME} · {DEVELOPER_NAME} · {CONTACT_EMAIL}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17 },
  body: { paddingHorizontal: 20, paddingTop: 20, gap: 20 },
  introCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  introTxt: { fontSize: 13, lineHeight: 19, flex: 1 },
  metaTxt: { fontSize: 12 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 15 },
  sectionBody: { fontSize: 13, lineHeight: 21 },
  footer: { borderTopWidth: 1, paddingTop: 16, paddingBottom: 8 },
  footerTxt: { fontSize: 11, textAlign: "center" },
});
