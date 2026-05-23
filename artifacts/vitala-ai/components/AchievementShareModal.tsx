import * as Haptics from "expo-haptics";
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
          `I just unlocked "${achievement.label}" on ${APP_NAME}!\n\n` +
          `Level ${userLevel} and consistently hitting my study goals.\n\n` +
          `${APP_NAME} — AI-powered studying that actually works.\n` +
          APP_LINK,
        title: `${achievement.label} — ${APP_NAME}`,
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
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.textMuted} />
          </Pressable>

          {/* Share card */}
          <View style={[styles.card, { backgroundColor: colors.background, borderColor: achievement.color + "44" }]}>
            <View style={[styles.cardBrand, { borderBottomColor: achievement.color + "33" }]}>
              <View style={[styles.brandDot, { backgroundColor: achievement.color }]} />
              <Text style={[styles.brandName, { color: achievement.color, fontFamily: "Inter_700Bold" }]}>
                {APP_NAME}
              </Text>
            </View>

            <View style={[styles.cardIconWrap, { backgroundColor: achievement.color + "22" }]}>
              <Ionicons name={achievement.icon as any} size={48} color={achievement.color} />
            </View>

            <View style={[styles.glowRing, { borderColor: achievement.color + "44" }]} />

            <Text style={[styles.cardUnlocked, { color: colors.textMuted, fontFamily: "Inter_500Medium" }]}>
              ACHIEVEMENT UNLOCKED
            </Text>
            <Text style={[styles.cardTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              {achievement.label}
            </Text>
            {achievement.description && (
              <Text style={[styles.cardDesc, { color: colors.textSecondary, fontFamily: "Inter_400Regular" }]}>
                {achievement.description}
              </Text>
            )}

            <View style={[styles.cardUser, { borderTopColor: achievement.color + "33" }]}>
              <View style={[styles.userAvatar, { backgroundColor: achievement.color + "33" }]}>
                <Text style={[styles.userAvatarTxt, { color: achievement.color, fontFamily: "Inter_700Bold" }]}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.cardUserName, { color: colors.text, fontFamily: "Inter_600SemiBold" }]}>
                  {userName}
                </Text>
                <Text style={[styles.cardLevel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  Level {userLevel} Scholar
                </Text>
              </View>
              <View style={{ flex: 1 }} />
              <Text style={[styles.cardLink, { color: achievement.color, fontFamily: "Inter_500Medium" }]}>
                vitala-ai.replit.app
              </Text>
            </View>
          </View>

          <Text style={[styles.shareHint, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
            Share your achievement and invite friends to study smarter
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.shareBtn,
              { backgroundColor: achievement.color, opacity: pressed ? 0.85 : 1 },
            ]}
            onPress={handleShare}
          >
            <Ionicons name="share-social" size={20} color="#fff" />
            <Text style={[styles.shareBtnTxt, { fontFamily: "Inter_700Bold" }]}>
              Share Achievement
            </Text>
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
              {APP_LINK}
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
    backgroundColor: "#00000088",
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderBottomWidth: 0,
    padding: 24,
    gap: 16,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
  },
  closeBtn: { alignSelf: "flex-end", padding: 4 },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: "hidden",
    alignItems: "center",
    gap: 10,
    paddingBottom: 0,
  },
  cardBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  brandDot: { width: 8, height: 8, borderRadius: 4 },
  brandName: { fontSize: 13, letterSpacing: 0.5 },
  cardIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    zIndex: 1,
  },
  glowRing: {
    position: "absolute",
    top: 48,
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 12,
  },
  cardUnlocked: { fontSize: 11, letterSpacing: 2, marginTop: 4 },
  cardTitle: { fontSize: 24, textAlign: "center", paddingHorizontal: 20 },
  cardDesc: { fontSize: 13, textAlign: "center", paddingHorizontal: 24, lineHeight: 19 },
  cardUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    marginTop: 8,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  userAvatarTxt: { fontSize: 14 },
  cardUserName: { fontSize: 14 },
  cardLevel: { fontSize: 11, marginTop: 1 },
  cardLink: { fontSize: 11 },
  shareHint: { fontSize: 13, textAlign: "center", lineHeight: 18 },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: 18,
  },
  shareBtnTxt: { color: "#fff", fontSize: 16 },
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
