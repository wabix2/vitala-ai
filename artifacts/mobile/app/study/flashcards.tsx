import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { useGenerateFlashcards } from "@workspace/api-client-react";
import { FlashCard } from "@/components/FlashCard";

interface Card {
  front: string;
  back: string;
}

export default function FlashcardsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const lang = user?.language ?? "en";

  const [topic, setTopic] = useState("");
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const generateCards = useGenerateFlashcards();
  const topPadding = Platform.OS === "web" ? 67 : insets.top;

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const res = await generateCards.mutateAsync({
        topic: topic.trim(),
        language: lang,
        count: 8,
      });
      setCards((res.flashcards as Card[]) ?? []);
      setCurrentIndex(0);
    } catch {}
  };

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPadding + 12, borderBottomColor: colors.border },
        ]}
      >
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Flashcards</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.input, { color: colors.foreground }]}
            placeholder="Enter topic or paste text..."
            placeholderTextColor={colors.mutedForeground}
            value={topic}
            onChangeText={setTopic}
            onSubmitEditing={handleGenerate}
            returnKeyType="done"
          />
          <Pressable
            onPress={handleGenerate}
            disabled={!topic.trim() || generateCards.isPending}
            style={[styles.genBtn, { backgroundColor: colors.primary }]}
          >
            {generateCards.isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Feather name="zap" size={18} color="#fff" />
            )}
          </Pressable>
        </View>

        {generateCards.isPending && (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={[styles.loadingText, { color: colors.mutedForeground }]}>
              Generating flashcards...
            </Text>
          </View>
        )}

        {cards.length > 0 && !generateCards.isPending && (
          <Animated.View entering={FadeInDown.duration(400)} style={styles.cardSection}>
            <FlashCard
              front={cards[currentIndex]?.front ?? ""}
              back={cards[currentIndex]?.back ?? ""}
              index={currentIndex}
              total={cards.length}
            />
            <View style={styles.navRow}>
              <Pressable
                onPress={handlePrev}
                disabled={currentIndex === 0}
                style={[
                  styles.navBtn,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: currentIndex === 0 ? 0.4 : 1 },
                ]}
              >
                <Feather name="chevron-left" size={22} color={colors.foreground} />
              </Pressable>
              <View style={styles.dotRow}>
                {cards.map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.navDot,
                      {
                        backgroundColor: i === currentIndex ? colors.primary : colors.border,
                        width: i === currentIndex ? 20 : 6,
                      },
                    ]}
                  />
                ))}
              </View>
              <Pressable
                onPress={handleNext}
                disabled={currentIndex === cards.length - 1}
                style={[
                  styles.navBtn,
                  { backgroundColor: colors.card, borderColor: colors.border, opacity: currentIndex === cards.length - 1 ? 0.4 : 1 },
                ]}
              >
                <Feather name="chevron-right" size={22} color={colors.foreground} />
              </Pressable>
            </View>
            <Pressable
              onPress={() => { setCards([]); setTopic(""); }}
              style={styles.resetBtn}
            >
              <Text style={[styles.resetText, { color: colors.mutedForeground }]}>
                Generate new set
              </Text>
            </Pressable>
          </Animated.View>
        )}

        {!cards.length && !generateCards.isPending && (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: `${colors.primary}15` }]}>
              <Feather name="layers" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              Generate Flashcards
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.mutedForeground }]}>
              Enter any topic and AI will create study cards for you instantly
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontFamily: "Inter_700Bold" },
  placeholder: { width: 30 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, gap: 24 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
    height: 52,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  genBtn: { width: 52, height: 52, alignItems: "center", justifyContent: "center" },
  loadingBox: { alignItems: "center", gap: 12, paddingVertical: 40 },
  loadingText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  cardSection: { gap: 24 },
  navRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  navBtn: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  dotRow: { flexDirection: "row", gap: 5, alignItems: "center", flex: 1, justifyContent: "center" },
  navDot: { height: 6, borderRadius: 3 },
  resetBtn: { alignItems: "center", paddingVertical: 8 },
  resetText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_600SemiBold" },
  emptyDesc: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 21 },
});
