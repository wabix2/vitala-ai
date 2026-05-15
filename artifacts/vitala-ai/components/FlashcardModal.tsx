import * as Haptics from "expo-haptics";
import React, { useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useUser } from "@/context/UserContext";

interface Card {
  front: string;
  back: string;
}

const CARD_BANK: Record<string, Card[]> = {
  Biology: [
    { front: "Mitochondria", back: "The organelle responsible for producing ATP energy through cellular respiration — the 'powerhouse of the cell'." },
    { front: "DNA", back: "Deoxyribonucleic acid — the molecule that carries genetic instructions for all living organisms." },
    { front: "Photosynthesis", back: "The process by which plants convert CO₂ + water + sunlight → glucose + oxygen." },
    { front: "Osmosis", back: "The movement of water molecules through a semipermeable membrane from low to high solute concentration." },
    { front: "Meiosis", back: "Cell division that produces 4 haploid sex cells (gametes), each with half the parent's chromosomes." },
    { front: "Enzyme", back: "A biological catalyst that speeds up chemical reactions without being consumed in the process." },
    { front: "Homeostasis", back: "The ability of an organism to maintain stable internal conditions (e.g. body temperature, blood pH)." },
    { front: "Ribosome", back: "Cellular organelle that reads mRNA and synthesises proteins — found in all living cells." },
    { front: "Allele", back: "One of two or more versions of a gene. Dominant alleles mask recessive ones." },
    { front: "Ecosystem", back: "A community of living organisms interacting with each other and their physical environment." },
  ],
  Math: [
    { front: "Quadratic Formula", back: "x = (−b ± √(b²−4ac)) / 2a — used to find roots of ax² + bx + c = 0." },
    { front: "Euler's Number (e)", back: "e ≈ 2.71828 — the base of natural logarithms; constant rate of continuous growth." },
    { front: "Derivative", back: "Measures the instantaneous rate of change of a function. d/dx(xⁿ) = nxⁿ⁻¹." },
    { front: "Integral", back: "The antiderivative; measures the area under a curve. ∫xⁿ dx = xⁿ⁺¹/(n+1) + C." },
    { front: "Prime Number", back: "A natural number greater than 1 divisible only by 1 and itself. E.g. 2, 3, 5, 7, 11..." },
    { front: "Pythagorean Theorem", back: "In a right triangle: a² + b² = c², where c is the hypotenuse." },
    { front: "Probability", back: "P(Event) = Number of favourable outcomes / Total outcomes. Range: 0 to 1." },
    { front: "Matrix", back: "A rectangular array of numbers arranged in rows and columns, used in linear algebra." },
    { front: "Standard Deviation", back: "Measures the spread of data from the mean. Low σ = data clustered; high σ = data spread out." },
    { front: "Complex Number", back: "A number in the form a + bi, where i = √(−1). Used in engineering and physics." },
  ],
  Chemistry: [
    { front: "Covalent Bond", back: "A chemical bond formed by the sharing of electron pairs between atoms." },
    { front: "Ionic Bond", back: "A bond formed by the electrostatic attraction between oppositely charged ions." },
    { front: "Mole", back: "A unit equal to 6.022 × 10²³ particles (Avogadro's number). Used to measure amounts of substance." },
    { front: "Enthalpy (ΔH)", back: "The heat content of a system. ΔH < 0 = exothermic; ΔH > 0 = endothermic." },
    { front: "Le Chatelier's Principle", back: "If a system at equilibrium is disturbed, it shifts to counteract the disturbance." },
    { front: "Oxidation State", back: "The hypothetical charge an atom would have if all bonds were ionic. Oxidation = loss of electrons." },
    { front: "Electron Configuration", back: "Describes the distribution of electrons in an atom's orbitals. E.g. Carbon: 1s² 2s² 2p²." },
    { front: "Buffer Solution", back: "A solution that resists changes in pH when small amounts of acid or base are added." },
    { front: "Electronegativity", back: "The tendency of an atom to attract electrons in a covalent bond. Fluorine is most electronegative." },
    { front: "Catalyst", back: "A substance that increases the rate of a reaction without being consumed. Lowers activation energy." },
  ],
  Physics: [
    { front: "Newton's Second Law", back: "F = ma — Force equals mass times acceleration. The foundation of classical mechanics." },
    { front: "Gravitational Potential Energy", back: "GPE = mgh — Energy stored due to position in a gravitational field." },
    { front: "Electromagnetic Spectrum", back: "The range of all types of light, from radio waves (longest) to gamma rays (shortest)." },
    { front: "Ohm's Law", back: "V = IR — Voltage equals current multiplied by resistance." },
    { front: "Thermodynamics 2nd Law", back: "The entropy of an isolated system always increases. Heat flows from hot to cold." },
    { front: "Momentum", back: "p = mv — The product of mass and velocity. Conserved in collisions." },
    { front: "Wave-Particle Duality", back: "Light and matter exhibit properties of both waves and particles (quantum mechanics)." },
    { front: "Centripetal Force", back: "F = mv²/r — Force directed toward the centre keeping an object in circular motion." },
    { front: "Half-Life", back: "The time it takes for half of a radioactive substance's nuclei to decay." },
    { front: "Doppler Effect", back: "The change in frequency of a wave as its source moves relative to an observer." },
  ],
  History: [
    { front: "Renaissance", back: "Cultural rebirth in Europe (14th–17th c.) emphasising art, science, and humanism, starting in Italy." },
    { front: "Industrial Revolution", back: "Shift from agrarian to industrial economy in Britain (c. 1760–1840), powered by steam and coal." },
    { front: "Cold War", back: "1947–1991 geopolitical tension between the USA and USSR — never direct military conflict." },
    { front: "French Revolution", back: "1789–1799 upheaval that abolished the French monarchy and established republican ideals." },
    { front: "Magna Carta", back: "1215 document signed by King John limiting royal power — an early foundation of democracy." },
    { front: "Colonialism", back: "Policy of acquiring and exploiting foreign territories. European powers colonised Africa, Asia, Americas." },
    { front: "The Holocaust", back: "Nazi Germany's systematic genocide of 6 million Jews and millions of others during WWII." },
    { front: "Silk Road", back: "Ancient network of trade routes connecting China to the Mediterranean, active from ~130 BCE." },
    { front: "The Enlightenment", back: "18th-century intellectual movement emphasising reason, science, and individual rights." },
    { front: "Apartheid", back: "South Africa's institutionalised racial segregation system (1948–1994), ended by Nelson Mandela." },
  ],
};

function getCards(subject: string): Card[] {
  const pool =
    subject === "All"
      ? Object.values(CARD_BANK).flat().sort(() => Math.random() - 0.5).slice(0, 12)
      : CARD_BANK[subject] ?? CARD_BANK["Biology"];
  return pool;
}

interface Props {
  visible: boolean;
  subject: string;
  onClose: () => void;
}

export default function FlashcardModal({ visible, subject, onClose }: Props) {
  const colors = useColors();
  const { addXP } = useUser();

  const [cards] = useState(() => getCards(subject));
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });

  const flip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue: flipped ? 0 : 1,
      useNativeDriver: true,
      friction: 8,
    }).start();
    setFlipped((f) => !f);
  };

  const next = (knew: boolean) => {
    Haptics.selectionAsync();
    if (knew) setKnownCount((k) => k + 1);
    const nextIdx = current + 1;
    if (nextIdx >= cards.length) {
      addXP(25);
      setDone(true);
    } else {
      flipAnim.setValue(0);
      setFlipped(false);
      setCurrent(nextIdx);
    }
  };

  const progress = (current + 1) / cards.length;
  const card = cards[current];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {!done ? (
          <>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Pressable onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
              <View style={{ flex: 1 }}>
                <Text style={[styles.title, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                  {subject === "All" ? "Mixed Flashcards" : `${subject} Flashcards`}
                </Text>
                <Text style={[styles.sub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                  {current + 1} of {cards.length} · Tap card to flip
                </Text>
              </View>
              <View style={[styles.xpPill, { backgroundColor: "#2DD4BF22" }]}>
                <Ionicons name="layers" size={13} color="#2DD4BF" />
                <Text style={[styles.xpTxt, { color: "#2DD4BF", fontFamily: "Inter_700Bold" }]}>
                  +25 XP
                </Text>
              </View>
            </View>

            {/* Progress */}
            <View style={[styles.progressTrack, { backgroundColor: colors.card }]}>
              <View style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: "#2DD4BF" }]} />
            </View>

            <View style={styles.body}>
              {/* Flip Hint */}
              {!flipped && (
                <View style={styles.hintRow}>
                  <Ionicons name="refresh" size={14} color={colors.textMuted} />
                  <Text style={[styles.hintTxt, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
                    Tap the card to reveal the definition
                  </Text>
                </View>
              )}

              {/* Flashcard */}
              <Pressable onPress={flip} style={styles.cardWrap}>
                {/* Front */}
                <Animated.View
                  style={[
                    styles.card,
                    { backgroundColor: colors.card, borderColor: "#2DD4BF55" },
                    { transform: [{ rotateY: frontRotate }], backfaceVisibility: "hidden" },
                  ]}
                >
                  <View style={[styles.cardTag, { backgroundColor: "#2DD4BF22" }]}>
                    <Text style={[styles.cardTagTxt, { color: "#2DD4BF", fontFamily: "Inter_600SemiBold" }]}>
                      TERM
                    </Text>
                  </View>
                  <Text style={[styles.cardFront, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
                    {card.front}
                  </Text>
                </Animated.View>

                {/* Back */}
                <Animated.View
                  style={[
                    styles.card,
                    styles.cardBack,
                    { backgroundColor: "#2DD4BF15", borderColor: "#2DD4BF88" },
                    { transform: [{ rotateY: backRotate }], backfaceVisibility: "hidden" },
                  ]}
                >
                  <View style={[styles.cardTag, { backgroundColor: "#2DD4BF33" }]}>
                    <Text style={[styles.cardTagTxt, { color: "#2DD4BF", fontFamily: "Inter_600SemiBold" }]}>
                      DEFINITION
                    </Text>
                  </View>
                  <Text style={[styles.cardBackText, { color: colors.text, fontFamily: "Inter_500Medium" }]}>
                    {card.back}
                  </Text>
                </Animated.View>
              </Pressable>

              {/* Action buttons — only after flip */}
              {flipped && (
                <View style={styles.actions}>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, { backgroundColor: "#F8717122", borderColor: "#F87171", opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => next(false)}
                  >
                    <Ionicons name="close" size={22} color="#F87171" />
                    <Text style={[styles.actionTxt, { color: "#F87171", fontFamily: "Inter_600SemiBold" }]}>
                      Still learning
                    </Text>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [styles.actionBtn, { backgroundColor: "#00C89922", borderColor: "#00C899", opacity: pressed ? 0.8 : 1 }]}
                    onPress={() => next(true)}
                  >
                    <Ionicons name="checkmark" size={22} color="#00C899" />
                    <Text style={[styles.actionTxt, { color: "#00C899", fontFamily: "Inter_600SemiBold" }]}>
                      Got it!
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </>
        ) : (
          /* Results */
          <View style={styles.results}>
            <View style={[styles.resultIcon, { backgroundColor: "#2DD4BF22" }]}>
              <Ionicons name="layers" size={48} color="#2DD4BF" />
            </View>
            <Text style={[styles.resultTitle, { color: colors.text, fontFamily: "Inter_700Bold" }]}>
              Deck Complete!
            </Text>
            <Text style={[styles.resultSub, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>
              You knew {knownCount} out of {cards.length} cards
            </Text>
            <View style={styles.resultStats}>
              <View style={[styles.stat, { backgroundColor: "#2DD4BF22", borderColor: "#2DD4BF55" }]}>
                <Ionicons name="star" size={18} color="#2DD4BF" />
                <Text style={[styles.statVal, { color: "#2DD4BF", fontFamily: "Inter_700Bold" }]}>+25 XP</Text>
                <Text style={[styles.statLabel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>earned</Text>
              </View>
              <View style={[styles.stat, { backgroundColor: "#00C89922", borderColor: "#00C89955" }]}>
                <Ionicons name="checkmark-circle" size={18} color="#00C899" />
                <Text style={[styles.statVal, { color: "#00C899", fontFamily: "Inter_700Bold" }]}>
                  {Math.round((knownCount / cards.length) * 100)}%
                </Text>
                <Text style={[styles.statLabel, { color: colors.textMuted, fontFamily: "Inter_400Regular" }]}>mastered</Text>
              </View>
            </View>
            <Pressable style={[styles.doneBtn, { backgroundColor: "#2DD4BF" }]} onPress={onClose}>
              <Text style={[styles.doneTxt, { fontFamily: "Inter_700Bold" }]}>Done</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, borderBottomWidth: 1 },
  closeBtn: { padding: 4 },
  title: { fontSize: 17 },
  sub: { fontSize: 12, marginTop: 2 },
  xpPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  xpTxt: { fontSize: 13 },
  progressTrack: { height: 4 },
  progressFill: { height: 4, borderRadius: 2 },
  body: { flex: 1, padding: 20, gap: 16 },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  hintTxt: { fontSize: 12 },
  cardWrap: { flex: 1 },
  card: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  cardBack: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  cardTag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  cardTagTxt: { fontSize: 11, letterSpacing: 1.5 },
  cardFront: { fontSize: 28, textAlign: "center" },
  cardBackText: { fontSize: 16, lineHeight: 24, textAlign: "center" },
  actions: { flexDirection: "row", gap: 12 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 16, borderRadius: 18, borderWidth: 1.5 },
  actionTxt: { fontSize: 15 },
  results: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 16 },
  resultIcon: { width: 100, height: 100, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  resultTitle: { fontSize: 28 },
  resultSub: { fontSize: 15, textAlign: "center" },
  resultStats: { flexDirection: "row", gap: 12, marginTop: 8 },
  stat: { flex: 1, alignItems: "center", padding: 18, borderRadius: 18, borderWidth: 1, gap: 6 },
  statVal: { fontSize: 20 },
  statLabel: { fontSize: 12 },
  doneBtn: { width: "100%", paddingVertical: 16, borderRadius: 18, alignItems: "center", marginTop: 16 },
  doneTxt: { color: "#fff", fontSize: 16 },
});
