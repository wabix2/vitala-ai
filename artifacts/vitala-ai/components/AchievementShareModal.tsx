import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Linking,
  Modal,
  Platform,
  Pressable,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";

const APP_LINK = "https://vitala-ai.replit.app";
const APP_NAME = "Vitala AI";

interface Achievement {
  id: string;
  icon: string;
  label: string;
  unlocked: boolean;
  color: string;
  description?: string;
}

interface Props {
  achievement: Achievement | null;
  userName: string;
  userLevel: number;
  onClose: () => void;
}

export default function AchievementShareModal({ achievement, userName, userLevel, onClose }: Props) {
  const colors = useColors();
  if (!achievement) return null;

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message:
          `I unlocked "${achievement.label}" on ${APP_NAME}.\n\n` +
          `Level ${userLevel}. Better study habits, one session at a time.\n\n` +
          `Study smarter with ${APP_NAME}: ${APP_LINK}`,
        title: `${achievement.label} on ${APP_NAME}`,
        url: APP_LINK,
      });
    } catch {
      Linking.openURL(APP_LINK);
    }
  };

  return (
    <Modal visible={!!achievement} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.sheetHeader}>
            <View>
              <Text style={[styles.sheetTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                Share achievement
              </Text>
              <Text style={[styles.sheetSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                A polished progress card for your story
              </Text>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <LinearGradient
            colors={["#0F172A", "#1E3A8A", achievement.color]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shareCard}
          >
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Ionicons name="school" size={15} color="#0F172A" />
              </View>
              <Text style={[styles.brandName, { fontFamily: "Inter_700Bold" }]}>{APP_NAME}</Text>
              <View style={styles.brandLine} />
              <Text style={[styles.cardMeta, { fontFamily: "Inter_500Medium" }]}>STUDY PROGRESS</Text>
            </View>

            <View style={styles.cardCenter}>
              <View style={styles.cardIconHalo}>
                <View style={styles.cardIconWrap}>
                  <Ionicons name={achievement.icon as any} size={42} color="#FFFFFF" />
                </View>
              </View>
              <Text style={[styles.cardEyebrow, { fontFamily: "Inter_700Bold" }]}>ACHIEVEMENT UNLOCKED</Text>
              <Text style={[styles.cardTitle, { fontFamily: "Inter_700Bold" }]}>{achievement.label}</Text>
              {!!achievement.description && (
                <Text style={[styles.cardDesc, { fontFamily: "Inter_400Regular" }]}>
                  {achievement.description}
                </Text>
              )}
            </View>

            <View style={styles.metricsRow}>
              <View style={styles.metric}>
                <Text style={[styles.metricValue, { fontFamily: "Inter_700Bold" }]}>L{userLevel}</Text>
                <Text style={[styles.metricLabel, { fontFamily: "Inter_500Medium" }]}>Level</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.userBlock}>
                <View style={styles.userAvatar}>
                  <Text style={[styles.userAvatarTxt, { fontFamily: "Inter_700Bold" }]}>
                    {userName.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.cardUserName, { fontFamily: "Inter_700Bold" }]}>{userName}</Text>
                  <Text style={[styles.cardLink, { fontFamily: "Inter_500Medium" }]}>vitala-ai.replit.app</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <Pressable
            style={({ pressed }) => [
              styles.shareBtn,
              { backgroundColor: colors.primary, opacity: pressed ? 0.88 : 1 },
            ]}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={19} color="#fff" />
            <Text style={[styles.shareBtnTxt, { fontFamily: "Inter_700Bold" }]}>Share card</Text>
          </Pressable>

          <Pressable
            style={[styles.copyBtn, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.selectionAsync();
              Linking.openURL(APP_LINK);
            }}
          >
            <Ionicons name="link-outline" size={16} color={colors.textSecondary} />
            <Text style={[styles.copyBtnTxt, { color: colors.textSecondary, fontFamily: "Inter_500Medium" }]}>
              Open public link
            </Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#020617AA",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 20,
    gap: 14,
    paddingBottom: Platform.OS === "ios" ? 38 : 22,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 18 },
  sheetSub: { fontSize: 12, marginTop: 3 },
  closeBtn: { padding: 6 },
  shareCard: {
    minHeight: 420,
    borderRadius: 26,
    padding: 22,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: { color: "#FFFFFF", fontSize: 14 },
  brandLine: { flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.22)" },
  cardMeta: { color: "rgba(255,255,255,0.72)", fontSize: 10, letterSpacing: 1.4 },
  cardCenter: { alignItems: "center", gap: 10 },
  cardIconHalo: {
    width: 116,
    height: 116,
    borderRadius: 38,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
  },
  cardIconWrap: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  cardEyebrow: { color: "rgba(255,255,255,0.72)", fontSize: 11, letterSpacing: 1.8, marginTop: 4 },
  cardTitle: { color: "#FFFFFF", fontSize: 32, lineHeight: 38, textAlign: "center" },
  cardDesc: { color: "rgba(255,255,255,0.78)", fontSize: 14, lineHeight: 20, textAlign: "center" },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 20,
    padding: 14,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  metric: { width: 62 },
  metricValue: { color: "#FFFFFF", fontSize: 22 },
  metricLabel: { color: "rgba(255,255,255,0.65)", fontSize: 11, marginTop: 1 },
  metricDivider: { width: 1, height: 34, backgroundColor: "rgba(255,255,255,0.22)", marginRight: 14 },
  userBlock: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarTxt: { color: "#0F172A", fontSize: 15 },
  cardUserName: { color: "#FFFFFF", fontSize: 14 },
  cardLink: { color: "rgba(255,255,255,0.62)", fontSize: 11, marginTop: 2 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    paddingVertical: 16,
    borderRadius: 18,
  },
  shareBtnTxt: { color: "#FFFFFF", fontSize: 16 },
  copyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  copyBtnTxt: { fontSize: 13 },
});
