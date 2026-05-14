import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import ViewShot from "react-native-view-shot";

import { useColors } from "@/hooks/useColors";
import { useTheme } from "@/context/ThemeContext";
import { Achievement, League, useStreak } from "@/context/StreakContext";
import { useAuth } from "@/context/AuthContext";
import {
  AchievementShareCard,
  StreakShareCard,
  LeagueShareCard,
} from "@/components/ShareCard";
import { captureAndShare, saveToGallery } from "@/lib/shareUtils";

export type ShareType =
  | { kind: "achievement"; achievement: Achievement }
  | { kind: "streak" }
  | { kind: "league"; rank: number };

interface Props {
  visible: boolean;
  shareType: ShareType | null;
  onClose: () => void;
}

const TEMPLATE_LABELS: Record<string, string> = {
  achievement: "Achievement Card",
  streak: "Streak Card",
  league: "League Card",
};

export function ShareModal({ visible, shareType, onClose }: Props) {
  const colors = useColors();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { streak, longestStreak, totalXP, totalSessions, league } = useStreak();
  const shotRef = useRef<ViewShot>(null);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const userName = user?.name ?? "Learner";

  const handleShare = async () => {
    setSharing(true);
    const result = await captureAndShare(shotRef);
    setSharing(false);
    if (result !== "cancelled") { setDone(true); setTimeout(() => { setDone(false); onClose(); }, 1200); }
  };

  const handleSave = async () => {
    setSaving(true);
    const ok = await saveToGallery(shotRef);
    setSaving(false);
    if (ok) { setDone(true); setTimeout(() => { setDone(false); onClose(); }, 1500); }
  };

  const renderCard = () => {
    if (!shareType) return null;
    if (shareType.kind === "achievement") {
      return (
        <AchievementShareCard
          achievement={shareType.achievement}
          streak={streak}
          totalXP={totalXP}
          league={league}
          userName={userName}
          shotRef={shotRef as any}
        />
      );
    }
    if (shareType.kind === "streak") {
      return (
        <StreakShareCard
          streak={streak}
          longestStreak={longestStreak}
          totalXP={totalXP}
          league={league}
          totalSessions={totalSessions}
          userName={userName}
          shotRef={shotRef as any}
        />
      );
    }
    if (shareType.kind === "league") {
      return (
        <LeagueShareCard
          league={league}
          totalXP={totalXP}
          streak={streak}
          rank={shareType.rank}
          userName={userName}
          shotRef={shotRef as any}
        />
      );
    }
    return null;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <Animated.View entering={FadeInDown.springify().damping(16)} style={[styles.sheet, { backgroundColor: colors.card }]}>
          <View style={styles.sheetHandle} />

          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.foreground }]}>
              {shareType ? TEMPLATE_LABELS[shareType.kind] : "Share"}
            </Text>
            <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.surfaceAlt ?? colors.border }]}>
              <Feather name="x" size={16} color={colors.foreground} />
            </Pressable>
          </View>

          <Text style={[styles.sheetSubtitle, { color: colors.mutedForeground }]}>
            Save to your camera roll and post on Instagram, WhatsApp, or TikTok
          </Text>

          {/* Card preview */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardScroll}>
            <Animated.View entering={ZoomIn.duration(400).delay(100)}>
              {renderCard()}
            </Animated.View>
          </ScrollView>

          {/* Social hints */}
          <View style={styles.socialRow}>
            {["📸 Instagram", "📱 WhatsApp", "🎵 TikTok", "🐦 Twitter"].map((label) => (
              <View key={label} style={[styles.socialPill, { backgroundColor: colors.surfaceAlt ?? colors.border }]}>
                <Text style={[styles.socialPillText, { color: colors.mutedForeground }]}>{label}</Text>
              </View>
            ))}
          </View>

          {done ? (
            <Animated.View entering={ZoomIn.duration(300)} style={[styles.doneBox, { backgroundColor: "#00D4AA15" }]}>
              <Feather name="check-circle" size={22} color="#00D4AA" />
              <Text style={[styles.doneText, { color: "#00D4AA" }]}>Done! Go post it 🎉</Text>
            </Animated.View>
          ) : (
            <View style={styles.actions}>
              <Pressable
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSave}
                disabled={saving || sharing}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather name="download" size={18} color="#fff" />
                    <Text style={styles.saveBtnText}>Save to Camera Roll</Text>
                  </>
                )}
              </Pressable>

              <Pressable
                style={[styles.shareBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
                onPress={handleShare}
                disabled={sharing || saving}
              >
                {sharing ? (
                  <ActivityIndicator color={colors.primary} size="small" />
                ) : (
                  <>
                    <Feather name="share-2" size={18} color={colors.primary} />
                    <Text style={[styles.shareBtnText, { color: colors.primary }]}>Share directly</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.6)" },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingBottom: 40, paddingTop: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: "rgba(120,120,120,0.3)", alignSelf: "center", marginBottom: 16 },
  sheetHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 6 },
  sheetTitle: { fontSize: 20, fontFamily: "Inter_700Bold" },
  closeBtn: { width: 30, height: 30, borderRadius: 15, alignItems: "center", justifyContent: "center" },
  sheetSubtitle: { fontSize: 13, fontFamily: "Inter_400Regular", paddingHorizontal: 20, marginBottom: 20, lineHeight: 18 },
  cardScroll: { paddingHorizontal: 20, paddingBottom: 4 },
  socialRow: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginTop: 16, marginBottom: 8, flexWrap: "wrap" },
  socialPill: { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  socialPillText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  actions: { paddingHorizontal: 20, gap: 10, marginTop: 12 },
  saveBtn: { borderRadius: 16, padding: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
  shareBtn: { borderRadius: 16, borderWidth: 1.5, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  shareBtnText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  doneBox: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 20, marginTop: 12, borderRadius: 14, padding: 16 },
  doneText: { fontSize: 16, fontFamily: "Inter_700Bold" },
});
