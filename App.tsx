import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import * as DocumentPicker from "expo-document-picker";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  ArrowUp,
  BarChart3,
  BookOpen,
  Brain,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileQuestion,
  FileText,
  Flame,
  Gauge,
  HelpCircle,
  Home,
  LineChart,
  Lock,
  Mail,
  MessageCircle,
  NotebookText,
  RefreshCw,
  ScanLine,
  Settings,
  Sparkles,
  Trophy,
  Upload,
  User
} from "lucide-react-native";
import { useFonts, Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Markdown from "react-native-markdown-display";

import { initialMessages, notes, plannerTasks, sampleQuestions } from "@/data/study";
import { askTutor, explainFeynman, generateQuiz, reviewTeachBack, summarizeDocument } from "@/services/gemini";
import { colors, radius, shadow } from "@/theme";
import type { ChatMessage, TabKey } from "@/types";

const tabs: Array<{ key: TabKey; label: string; icon: typeof Home }> = [
  { key: "home", label: "Home", icon: Home },
  { key: "assistant", label: "AI", icon: MessageCircle },
  { key: "learn", label: "Learn", icon: Brain },
  { key: "pdf", label: "PDF", icon: FileText },
  { key: "quiz", label: "Quiz", icon: ClipboardList },
  { key: "planner", label: "Plan", icon: CalendarClock },
  { key: "analytics", label: "Stats", icon: BarChart3 },
  { key: "notes", label: "Notes", icon: NotebookText },
  { key: "health", label: "Health", icon: Gauge }
];

function now() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function PixelCloud({ vivid = false }: { vivid?: boolean }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: 86 }).map((_, index) => {
        const size = index % 5 === 0 ? 8 : 5;
        const top = (index * 37) % 310;
        const left = (index * 53) % 360;
        const color = vivid ? (index % 3 === 0 ? colors.coral : colors.primary) : "#DDE7FF";
        return <View key={index} style={[styles.pixel, { width: size, height: size, top, left, backgroundColor: color }]} />;
      })}
    </View>
  );
}

function LogoMark({ size = 54 }: { size?: number }) {
  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={[styles.logoMark, { width: size, height: size, borderRadius: size * 0.28 }]}>
      <Sparkles color={colors.white} size={size * 0.45} strokeWidth={2.8} />
    </LinearGradient>
  );
}

function Orb({ size = 120 }: { size?: number }) {
  return (
    <View style={[styles.orbWrap, { width: size, height: size, borderRadius: size / 2 }]}>
      <View style={[styles.orbBlue, { borderRadius: size / 2 }]} />
      <View style={[styles.orbPurple, { borderRadius: size / 2 }]} />
      <View style={[styles.orbCream, { borderRadius: size / 2 }]} />
      <View style={styles.orbStroke} />
      <View style={styles.orbShine} />
    </View>
  );
}

function Header({ active, setActive }: { active: TabKey; setActive: (tab: TabKey) => void }) {
  if (active === "home") {
    return (
      <View style={styles.homeHeader}>
        <View>
          <Text style={styles.h1}>Hey Alex! 👋</Text>
          <Text style={styles.subhead}>You're on a 12-day streak. Keep it up!</Text>
        </View>
        <Pressable onPress={() => setActive("analytics")} style={styles.avatar}>
          <Text style={styles.avatarText}>AX</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.chatHeader}>
      <Pressable onPress={() => setActive("home")} style={styles.iconButton}>
        <ArrowLeft color={colors.ink} size={26} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text style={styles.headerTitle}>{titleFor(active)}</Text>
        <Text style={styles.activeLine}><Text style={{ color: colors.green }}>●</Text> Active Learning</Text>
      </View>
      <View style={styles.streakPill}>
        <Flame color={colors.ink} size={18} fill={colors.ink} />
        <Text style={styles.pillText}>12</Text>
      </View>
      <View style={[styles.smallAvatar, active === "health" && { backgroundColor: colors.white }]}>
        {active === "health" ? <RefreshCw color={colors.ink} size={24} /> : <Text style={styles.smallAvatarText}>AR</Text>}
      </View>
    </View>
  );
}

function titleFor(tab: TabKey) {
  return {
    home: "Vitala",
    assistant: "Vitala AI",
    learn: "Feynman Mode",
    pdf: "PDF Intelligence",
    quiz: "Quiz Engine",
    planner: "Study Planner",
    analytics: "Progress",
    notes: "Notes",
    health: "System Health"
  }[tab];
}

function InsightCard() {
  return (
    <View style={styles.insightCard}>
      <PixelCloud vivid />
      <BlurView intensity={56} tint="light" style={styles.insightBlur}>
        <Orb size={58} />
        <View style={{ flex: 1 }}>
          <Text style={styles.kicker}>VITALA INSIGHT</Text>
          <Text numberOfLines={2} style={styles.insightText}>You're most productive between 4 PM and 6 PM. Ready for your deep work block?</Text>
        </View>
      </BlurView>
    </View>
  );
}

function MetricCard({ icon: Icon, value, label, tint }: { icon: typeof Flame; value: string; label: string; tint: string }) {
  return (
    <View style={styles.metricCard}>
      <View style={[styles.iconSoft, { backgroundColor: tint }]}>
        <Icon color={colors.text} size={22} fill={Icon === Flame ? colors.text : "transparent"} />
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function TrendCard() {
  const points = [105, 86, 98, 58, 42, 70, 36];
  return (
    <View style={styles.panel}>
      <View style={styles.rowBetween}>
        <Text style={styles.panelTitle}>Productivity Trends</Text>
        <LineChart color={colors.muted} size={28} />
      </View>
      <View style={styles.chart}>
        {points.map((height, index) => (
          <View key={index} style={styles.chartColumn}>
            <View style={[styles.chartDot, { bottom: height }]} />
            {index > 0 && <View style={[styles.chartSegment, { height: Math.abs(points[index - 1] - height) + 5, bottom: Math.min(points[index - 1], height) + 7, transform: [{ rotate: points[index - 1] > height ? "18deg" : "-18deg" }] }]} />}
            <View style={[styles.chartFill, { height }]} />
            <Text style={styles.chartDay}>{["M", "T", "W", "T", "F", "S", "S"][index]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function HomeScreen({ setActive }: { setActive: (tab: TabKey) => void }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <InsightCard />
      <View style={styles.metricsRow}>
        <MetricCard icon={Flame} value="12" label="Day Streak" tint="#F7E9EE" />
        <MetricCard icon={Brain} value="84%" label="Focus Score" tint="#E7E7FF" />
        <MetricCard icon={Gauge} value="4.5h" label="Study Time" tint="#F8E6EF" />
      </View>
      <Text style={styles.sectionTitle}>Daily Progress</Text>
      <View style={styles.progressTrack}><View style={[styles.progressFill, { width: "78%" }]} /></View>
      <TrendCard />
      <View style={styles.rowBetween}>
        <Text style={styles.sectionTitle}>Up Next</Text>
        <Pressable onPress={() => setActive("planner")}><Text style={styles.linkText}>View All</Text></Pressable>
      </View>
      {plannerTasks.map((task) => (
        <Pressable key={task.title} onPress={() => setActive("planner")} style={styles.listItem}>
          <View style={styles.listIcon}><BookOpen color={colors.primary} size={22} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listTitle}>{task.title}</Text>
            <Text style={styles.listMeta}>{task.time}</Text>
          </View>
          <ChevronRight color={colors.line} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

function ChatScreen({ memory, setMemory }: { memory: string[]; setMemory: (items: string[]) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = useCallback(async (quick?: string) => {
    const text = (quick ?? input).trim();
    if (!text) return;
    Haptics.selectionAsync();
    setInput("");
    const nextMessages = [...messages, { id: String(Date.now()), role: "user" as const, text, time: now() }];
    setMessages(nextMessages);
    setLoading(true);
    try {
      const reply = await askTutor(text, memory);
      setMessages([...nextMessages, { id: `${Date.now()}a`, role: "assistant", text: reply, time: now() }]);
      setMemory([...memory.slice(-6), text]);
    } catch (error) {
      Alert.alert("Vitala AI", error instanceof Error ? error.message : "The tutor could not respond.");
    } finally {
      setLoading(false);
    }
  }, [input, memory, messages, setMemory]);

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.screenPad, { paddingBottom: 220 }]}>
        <View style={styles.heroPattern}>
          <PixelCloud />
          <Orb size={130} />
        </View>
        <Text style={styles.chatPrompt}>How can I help you excel today?</Text>
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageBubble, message.role === "user" ? styles.userBubble : styles.aiBubble]}>
            <Text style={[styles.messageText, message.role === "user" && { color: colors.white }]}>{message.text}</Text>
            <Text style={[styles.timeText, message.role === "user" && { color: "#DDE2FF" }]}>✦ {message.time}</Text>
          </View>
        ))}
        {loading && <ActivityIndicator color={colors.primary} size="large" style={{ marginTop: 18 }} />}
      </ScrollView>
      <View style={styles.composerWrap}>
        <View style={styles.quickRow}>
          {[
            ["Scan Doc", ScanLine],
            ["Summarize", FileText],
            ["Quiz Me", FileQuestion]
          ].map(([label, Icon]) => (
            <Pressable key={label as string} onPress={() => send(label as string)} style={styles.quickPill}>
              <Icon color={colors.primary} size={21} />
              <Text style={styles.quickText}>{label as string}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.composer}>
          <Settings color={colors.ink} size={21} />
          <TextInput value={input} onChangeText={setInput} placeholder="Ask Vitala anything..." placeholderTextColor={colors.muted} style={styles.input} multiline />
          <Pressable onPress={() => send()} style={styles.sendButton}>
            <ArrowUp color={colors.white} size={32} />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function FeynmanScreen() {
  const [topic, setTopic] = useState("Photosynthesis");
  const [level, setLevel] = useState<"simple" | "intermediate" | "expert">("simple");
  const [teachBack, setTeachBack] = useState("");
  const [result, setResult] = useState("Vitala will explain your topic in three levels, then check your teach-back for gaps.");
  const [loading, setLoading] = useState(false);

  const run = async (mode: "explain" | "review") => {
    setLoading(true);
    try {
      setResult(mode === "explain" ? await explainFeynman(topic, level) : await reviewTeachBack(topic, teachBack));
    } catch (error) {
      Alert.alert("Feynman Mode", error instanceof Error ? error.message : "Could not complete learning mode.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <ActionPanel title="Choose a Topic" icon={Brain}>
        <TextInput value={topic} onChangeText={setTopic} style={styles.largeInput} placeholder="Topic or concept" />
        <View style={styles.segment}>
          {(["simple", "intermediate", "expert"] as const).map((item) => (
            <Pressable key={item} onPress={() => setLevel(item)} style={[styles.segmentItem, level === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, level === item && { color: colors.white }]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton label="Generate Explanation" icon={Sparkles} onPress={() => run("explain")} />
      </ActionPanel>
      <OutputPanel loading={loading} text={result} />
      <ActionPanel title="Teach It Back" icon={MessageCircle}>
        <TextInput value={teachBack} onChangeText={setTeachBack} style={[styles.largeInput, { minHeight: 120 }]} placeholder="Type your explanation in your own words..." multiline />
        <PrimaryButton label="Correct My Understanding" icon={CheckCircle2} onPress={() => run("review")} />
      </ActionPanel>
    </ScrollView>
  );
}

function PdfScreen() {
  const [documentName, setDocumentName] = useState("No PDF selected");
  const [report, setReport] = useState("Upload a PDF to generate summaries, formulas, definitions, chapter breakdowns, important questions, and Ask PDF responses.");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf", copyToCacheDirectory: true });
    if (!result.canceled) setDocumentName(result.assets[0].name);
  };

  const analyze = async (ask?: string) => {
    setLoading(true);
    try {
      const prompt = ask ? `${documentName}. Student question: ${ask}` : documentName;
      setReport(await summarizeDocument(prompt));
    } catch (error) {
      Alert.alert("PDF Intelligence", error instanceof Error ? error.message : "Could not analyze PDF.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <ActionPanel title="Upload PDF" icon={Upload}>
        <View style={styles.uploadBox}>
          <FileText color={colors.primary} size={38} />
          <Text style={styles.listTitle}>{documentName}</Text>
          <Text style={styles.listMeta}>Summary, concepts, formulas, definitions, questions, and Ask PDF mode.</Text>
        </View>
        <PrimaryButton label="Select PDF" icon={Upload} onPress={pick} />
        <PrimaryButton label="Analyze Document" icon={Sparkles} onPress={() => analyze()} muted />
      </ActionPanel>
      <OutputPanel loading={loading} text={report} />
      <ActionPanel title="Ask PDF" icon={HelpCircle}>
        <TextInput value={question} onChangeText={setQuestion} style={styles.largeInput} placeholder="Ask about a chapter, formula, or idea..." />
        <PrimaryButton label="Ask Document" icon={ArrowUp} onPress={() => analyze(question)} />
      </ActionPanel>
    </ScrollView>
  );
}

function QuizScreen() {
  const [source, setSource] = useState("Krebs cycle and cellular respiration");
  const [difficulty, setDifficulty] = useState("Medium");
  const [quiz, setQuiz] = useState("");
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      setQuiz(await generateQuiz(source, difficulty));
    } catch (error) {
      Alert.alert("Quiz Engine", error instanceof Error ? error.message : "Could not generate quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <ActionPanel title="Generate Quiz" icon={ClipboardList}>
        <TextInput value={source} onChangeText={setSource} style={styles.largeInput} placeholder="PDF, notes, or topic" />
        <View style={styles.segment}>
          {["Easy", "Medium", "Hard"].map((item) => (
            <Pressable key={item} onPress={() => setDifficulty(item)} style={[styles.segmentItem, difficulty === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, difficulty === item && { color: colors.white }]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton label="Build Exam Set" icon={FileQuestion} onPress={run} />
      </ActionPanel>
      <View style={styles.panel}>
        <View style={styles.rowBetween}>
          <Text style={styles.panelTitle}>Scoring</Text>
          <Text style={styles.score}>{score}/2</Text>
        </View>
        {sampleQuestions.map((item) => (
          <Pressable key={item.id} onPress={() => setScore((value) => Math.min(2, value + 1))} style={styles.questionCard}>
            <Text style={styles.listTitle}>{item.prompt}</Text>
            <Text style={styles.listMeta}>{item.difficulty} · tap to mark reviewed</Text>
            <Text style={styles.answerText}>{item.answer} — {item.explanation}</Text>
          </Pressable>
        ))}
      </View>
      <OutputPanel loading={loading} text={quiz || "Generated MCQs, short answers, exam-style tests, answer explanations, and review mode will appear here."} />
    </ScrollView>
  );
}

function PlannerScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <View style={styles.bigCard}>
        <PixelCloud vivid />
        <Text style={styles.kicker}>SMART SCHEDULE</Text>
        <Text style={styles.bigValue}>4:00-6:00 PM</Text>
        <Text style={styles.insightText}>Best focus window based on your streak, quiz history, and weak topics.</Text>
      </View>
      {plannerTasks.map((task) => (
        <View key={task.title} style={styles.planCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.listTitle}>{task.title}</Text>
            <Text style={styles.listMeta}>{task.time}</Text>
          </View>
          <View style={styles.progressTrackSmall}><View style={[styles.progressFill, { width: `${task.progress * 100}%` }]} /></View>
        </View>
      ))}
    </ScrollView>
  );
}

function AnalyticsScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <View style={styles.metricsGrid}>
        <MetricCard icon={Trophy} value="92%" label="Biology Mastery" tint="#E7E7FF" />
        <MetricCard icon={FileQuestion} value="78%" label="Quiz Accuracy" tint="#E6F7EF" />
        <MetricCard icon={Flame} value="12" label="Learning Streak" tint="#F7E9EE" />
        <MetricCard icon={Brain} value="3" label="Weak Topics" tint="#EEF4FA" />
      </View>
      <TrendCard />
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Weak Topic Detection</Text>
        {["Electron transport chain", "Quadratic vertex form", "Newton's third law"].map((topic) => (
          <View key={topic} style={styles.listItemFlat}>
            <HelpCircle color={colors.coral} size={22} />
            <Text style={styles.listTitle}>{topic}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function NotesScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <PrimaryButton label="Generate AI Notes" icon={Sparkles} onPress={() => Alert.alert("Notes", "AI notes are generated from your chat, PDFs, and quiz reviews.")} />
      {notes.map((note) => (
        <View key={note.title} style={styles.noteCard}>
          <Text style={styles.kicker}>{note.subject.toUpperCase()}</Text>
          <Text style={styles.panelTitle}>{note.title}</Text>
          <Markdown style={markdownStyles}>{note.body}</Markdown>
        </View>
      ))}
    </ScrollView>
  );
}

function HealthScreen() {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.screenPad}>
      <View style={styles.metricsRow}>
        <View style={styles.healthMetric}><Text style={styles.listMeta}>API Latency</Text><Text style={styles.metricValue}>124ms</Text><Text style={styles.good}>◇ 12%</Text></View>
        <View style={styles.healthMetric}><Text style={styles.listMeta}>Error Rate</Text><Text style={styles.metricValue}>0.04%</Text><Text style={styles.bad}>◇ 0.01%</Text></View>
      </View>
      <View style={styles.bigCard}>
        <PixelCloud vivid />
        <Text style={styles.listMeta}>Neural Engine Load</Text>
        <Text style={styles.bigValue}>42.8% <Text style={styles.badge}>STABLE</Text></Text>
      </View>
      <View style={styles.panel}>
        <Text style={styles.sectionTitle}>Service Infrastructure</Text>
        {[
          ["Gemini Pro API", "Latency: 850ms", Brain, "Operational"],
          ["Vector Database", "Latency: 42ms", HelpCircle, "Operational"],
          ["Expo Push Service", "Latency: 110ms", Gauge, "Operational"],
          ["Auth Middleware", "Latency: 15ms", CheckCircle2, "Operational"],
          ["Sentry Logging", "Needs DSN", Settings, "Pending"]
        ].map(([name, latency, Icon, status]) => (
          <View key={name as string} style={styles.serviceRow}>
            <View style={styles.iconSoft}><Icon color={colors.primary} size={23} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.listTitle}>{name as string}</Text>
              <Text style={styles.listMeta}>{latency as string}</Text>
            </View>
            <View style={[styles.statusPill, status === "Pending" && { backgroundColor: "#FCE2E5" }]}>
              <Text style={[styles.statusText, status === "Pending" && { color: colors.coral }]}>{status as string}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function ActionPanel({ title, icon: Icon, children }: { title: string; icon: typeof Brain; children: ReactNode }) {
  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <View style={styles.iconSoft}><Icon color={colors.primary} size={24} /></View>
        <Text style={styles.panelTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function OutputPanel({ loading, text }: { loading: boolean; text: string }) {
  return (
    <View style={styles.outputPanel}>
      {loading ? <ActivityIndicator color={colors.primary} /> : <Markdown style={markdownStyles}>{text}</Markdown>}
    </View>
  );
}

function PrimaryButton({ label, icon: Icon, onPress, muted }: { label: string; icon: typeof Sparkles; onPress: () => void; muted?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.primaryButton, muted && styles.secondaryButton]}>
      <Icon color={muted ? colors.primary : colors.white} size={22} />
      <Text style={[styles.primaryButtonText, muted && { color: colors.primary }]}>{label}</Text>
    </Pressable>
  );
}

function AuthScreen({ onDone }: { onDone: () => void }) {
  return (
    <View style={styles.authScreen}>
      <PixelCloud vivid />
      <View style={styles.authHeader}>
        <LogoMark size={72} />
        <Text style={styles.authTitle}>Vitala AI</Text>
        <Text style={styles.subhead}>Your AI Study Companion</Text>
      </View>
      <View style={styles.authSegment}>
        <Text style={styles.authSegmentActive}>Sign In</Text>
        <Text style={styles.authSegmentText}>Create Account</Text>
        <Text style={styles.authSegmentText}>Reports</Text>
      </View>
      <View style={styles.authField}>
        <Mail color={colors.primary} size={28} />
        <Text style={styles.authPlaceholder}>name@student.com</Text>
      </View>
      <View style={styles.authField}>
        <Lock color={colors.primary} size={28} />
        <Text style={styles.authPlaceholder}>••••••••</Text>
      </View>
      <Pressable onPress={onDone} style={styles.authButton}>
        <Flame color={colors.ink} fill={colors.ink} />
        <Text style={styles.primaryButtonText}>Create Account</Text>
      </Pressable>
      <View style={styles.socialRow}>
        <Text style={styles.social}>G</Text>
        <Text style={styles.social}></Text>
        <Text style={styles.social}>⌘</Text>
      </View>
    </View>
  );
}

function Onboarding({ onDone }: { onDone: () => void }) {
  return (
    <SafeAreaView style={styles.onboarding}>
      <PixelCloud />
      <View style={styles.brandRow}><LogoMark /><Text style={styles.brandText}>Vitala AI</Text></View>
      <View style={styles.heroArt}><Orb size={260} /></View>
      <Text style={styles.onboardingTitle}>Meet Your New Study Partner</Text>
      <Text style={styles.onboardingCopy}>Vitala uses advanced AI to help you crush your goals, stay focused, and learn faster than ever.</Text>
      <View style={styles.dots}><View style={styles.dotWide} /><View style={styles.dot} /><View style={styles.dot} /></View>
      <View style={styles.bottomSheet}>
        <Text style={styles.joined}>Joined by 10k+ students today</Text>
        <Pressable onPress={onDone} style={styles.getStarted}>
          <Flame color={colors.ink} fill={colors.ink} />
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </Pressable>
        <Text style={styles.signInText}>Already using Vitala? <Text style={styles.linkText}>Sign In</Text></Text>
      </View>
    </SafeAreaView>
  );
}

function AppShell() {
  const [active, setActive] = useState<TabKey>("home");
  const [memory, setMemory] = useState<string[]>(["Biology exam", "Krebs cycle"]);
  const content = useMemo(() => {
    if (active === "home") return <HomeScreen setActive={setActive} />;
    if (active === "assistant") return <ChatScreen memory={memory} setMemory={setMemory} />;
    if (active === "learn") return <FeynmanScreen />;
    if (active === "pdf") return <PdfScreen />;
    if (active === "quiz") return <QuizScreen />;
    if (active === "planner") return <PlannerScreen />;
    if (active === "analytics") return <AnalyticsScreen />;
    if (active === "notes") return <NotesScreen />;
    if (active === "health") return <HealthScreen />;
    return <ChatScreen memory={memory} setMemory={setMemory} />;
  }, [active, memory]);

  return (
    <SafeAreaView style={styles.app}>
      <Header active={active} setActive={setActive} />
      <View style={styles.content}>{content}</View>
      {active === "home" && (
        <Pressable onPress={() => setActive("assistant")} style={styles.askFloat}>
          <Sparkles color={colors.white} size={28} />
          <Text style={styles.askText}>Ask Vitala</Text>
        </Pressable>
      )}
      <View style={styles.tabBar}>
        {tabs.slice(0, 5).map(({ key, label, icon: Icon }) => (
          <Pressable key={key} onPress={() => setActive(key)} style={styles.tabItem}>
            <Icon color={active === key ? colors.primary : colors.ink} size={24} strokeWidth={active === key ? 3 : 2} />
            <Text style={[styles.tabText, active === key && { color: colors.primary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  const [stage, setStage] = useState<"onboard" | "auth" | "app">("onboard");

  if (!fontsLoaded) return <View style={styles.center}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {stage === "onboard" && <Onboarding onDone={() => setStage("auth")} />}
      {stage === "auth" && <AuthScreen onDone={() => setStage("app")} />}
      {stage === "app" && <AppShell />}
    </SafeAreaProvider>
  );
}

const markdownStyles = {
  body: { color: colors.ink, fontSize: 16, lineHeight: 25, fontFamily: "Inter_400Regular" },
  heading1: { fontSize: 23, fontFamily: "Inter_800ExtraBold", color: colors.ink },
  heading2: { fontSize: 20, fontFamily: "Inter_700Bold", color: colors.ink },
  bullet_list: { marginBottom: 8 }
};

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.white },
  content: { flex: 1 },
  screenPad: { paddingHorizontal: 24, paddingTop: 18, paddingBottom: 112, gap: 20 },
  pixel: { position: "absolute", opacity: 0.45 },
  logoMark: { alignItems: "center", justifyContent: "center" },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 14, marginLeft: 32, marginTop: 22 },
  brandText: { fontSize: 28, fontFamily: "Inter_800ExtraBold", color: colors.ink },
  onboarding: { flex: 1, backgroundColor: colors.white },
  heroArt: { alignItems: "center", justifyContent: "center", height: 360, marginTop: 38 },
  onboardingTitle: { fontFamily: "Inter_800ExtraBold", fontSize: 40, lineHeight: 48, color: colors.ink, textAlign: "center", paddingHorizontal: 32 },
  onboardingCopy: { fontFamily: "Inter_400Regular", fontSize: 20, lineHeight: 31, color: colors.muted, textAlign: "center", paddingHorizontal: 44, marginTop: 24 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 12, marginTop: 46 },
  dotWide: { width: 38, height: 10, borderRadius: 8, backgroundColor: colors.primary },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.line },
  bottomSheet: { position: "absolute", left: 0, right: 0, bottom: 0, borderTopLeftRadius: 42, borderTopRightRadius: 42, borderTopWidth: 2, borderColor: colors.line, backgroundColor: colors.mist, padding: 32, gap: 26 },
  joined: { textAlign: "center", color: colors.muted, fontSize: 17, fontFamily: "Inter_700Bold" },
  getStarted: { height: 70, borderRadius: 28, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 14 },
  signInText: { textAlign: "center", color: colors.muted, fontSize: 18, fontFamily: "Inter_400Regular" },
  authScreen: { flex: 1, backgroundColor: colors.white, paddingHorizontal: 28, paddingTop: 90, gap: 28, overflow: "hidden" },
  authHeader: { alignItems: "center", gap: 8 },
  authTitle: { fontFamily: "Inter_800ExtraBold", fontSize: 38, color: colors.ink },
  authSegment: { height: 62, borderRadius: 24, borderWidth: 1.8, borderColor: colors.line, flexDirection: "row", alignItems: "center", justifyContent: "space-around", backgroundColor: "rgba(238,244,250,0.6)" },
  authSegmentActive: { backgroundColor: "#EEE3FB", paddingHorizontal: 24, paddingVertical: 13, borderRadius: 12, color: colors.ink, fontFamily: "Inter_700Bold", fontSize: 16 },
  authSegmentText: { color: colors.muted, fontFamily: "Inter_700Bold", fontSize: 16, textAlign: "center" },
  authField: { height: 76, borderRadius: 22, borderWidth: 1.8, borderColor: colors.line, flexDirection: "row", alignItems: "center", gap: 18, paddingHorizontal: 22, backgroundColor: "rgba(255,255,255,0.72)" },
  authPlaceholder: { color: "#9AA6B8", fontSize: 20, fontFamily: "Inter_400Regular" },
  authButton: { alignSelf: "center", marginTop: 18, width: "68%", height: 70, borderRadius: 28, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12 },
  socialRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 40 },
  social: { width: 104, height: 64, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.7)", textAlign: "center", textAlignVertical: "center", fontSize: 28, color: colors.line, fontFamily: "Inter_800ExtraBold" },
  homeHeader: { padding: 24, paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  h1: { fontFamily: "Inter_800ExtraBold", fontSize: 36, color: colors.ink },
  subhead: { fontFamily: "Inter_400Regular", fontSize: 19, color: colors.muted, marginTop: 8 },
  avatar: { width: 78, height: 78, borderRadius: 39, borderWidth: 2.5, borderColor: colors.primary, alignItems: "center", justifyContent: "center", backgroundColor: colors.mist },
  avatarText: { color: colors.primary, fontSize: 26, fontFamily: "Inter_800ExtraBold" },
  chatHeader: { minHeight: 92, paddingHorizontal: 22, paddingBottom: 14, borderBottomWidth: 1.5, borderColor: colors.line, flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.white },
  iconButton: { width: 44, height: 44, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Inter_800ExtraBold", color: colors.ink, fontSize: 26 },
  activeLine: { fontFamily: "Inter_700Bold", color: colors.muted, fontSize: 15 },
  streakPill: { height: 44, minWidth: 86, borderRadius: 16, borderWidth: 1.8, borderColor: colors.line, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
  pillText: { fontFamily: "Inter_800ExtraBold", color: colors.ink, fontSize: 18 },
  smallAvatar: { width: 54, height: 54, borderRadius: 27, alignItems: "center", justifyContent: "center", backgroundColor: colors.coral },
  smallAvatarText: { color: colors.white, fontFamily: "Inter_800ExtraBold", fontSize: 19 },
  insightCard: { height: 220, borderRadius: 34, overflow: "hidden", backgroundColor: "#DCD8EA", ...shadow },
  insightBlur: { height: 120, padding: 26, flexDirection: "row", gap: 22, alignItems: "center" },
  kicker: { color: colors.primary, fontFamily: "Inter_800ExtraBold", fontSize: 13, letterSpacing: 0 },
  insightText: { fontSize: 22, lineHeight: 31, color: colors.ink, fontFamily: "Inter_400Regular", marginTop: 6 },
  orbWrap: { overflow: "hidden", backgroundColor: "#EFEFFF" },
  orbBlue: { position: "absolute", width: "88%", height: "56%", left: "20%", top: "20%", backgroundColor: "#064DFF" },
  orbPurple: { position: "absolute", width: "52%", height: "85%", left: "2%", top: "14%", backgroundColor: "#7A00FF" },
  orbCream: { position: "absolute", width: "54%", height: "50%", right: "0%", bottom: "0%", backgroundColor: "#FEDDB2" },
  orbStroke: { position: "absolute", left: "5%", bottom: "6%", width: "90%", height: "32%", borderBottomWidth: 17, borderColor: "#050505", borderRadius: 80 },
  orbShine: { position: "absolute", right: "18%", top: "19%", width: "46%", height: "20%", borderRadius: 30, backgroundColor: colors.white, transform: [{ rotate: "16deg" }] },
  metricsRow: { flexDirection: "row", gap: 16 },
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
  metricCard: { flex: 1, minWidth: 145, minHeight: 150, borderRadius: 26, borderWidth: 1.8, borderColor: colors.line, backgroundColor: colors.card, padding: 20, justifyContent: "center", ...shadow },
  iconSoft: { width: 58, height: 58, borderRadius: 20, backgroundColor: "#E4EAF2", alignItems: "center", justifyContent: "center" },
  metricValue: { fontFamily: "Inter_800ExtraBold", fontSize: 32, color: colors.ink, marginTop: 10 },
  metricLabel: { fontFamily: "Inter_700Bold", fontSize: 15, color: colors.muted, marginTop: 4 },
  sectionTitle: { fontFamily: "Inter_800ExtraBold", color: colors.text, fontSize: 25 },
  progressTrack: { height: 18, backgroundColor: "#DBE8F6", borderRadius: 20, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: colors.line, borderRadius: 20 },
  panel: { borderWidth: 1.8, borderColor: colors.line, borderRadius: 30, backgroundColor: colors.card, padding: 24, gap: 18 },
  outputPanel: { borderWidth: 1.4, borderColor: colors.line, borderRadius: 26, backgroundColor: colors.white, padding: 22, minHeight: 160, ...shadow },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  row: { flexDirection: "row", alignItems: "center", gap: 14 },
  panelTitle: { fontFamily: "Inter_800ExtraBold", color: colors.ink, fontSize: 21 },
  chart: { height: 210, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 30 },
  chartColumn: { flex: 1, height: 180, alignItems: "center", justifyContent: "flex-end" },
  chartFill: { width: 35, backgroundColor: "#DBDFFE", opacity: 0.9 },
  chartDot: { position: "absolute", width: 16, height: 16, borderRadius: 8, backgroundColor: colors.primary, zIndex: 2 },
  chartSegment: { position: "absolute", width: 6, backgroundColor: colors.primary, borderRadius: 4 },
  chartDay: { color: colors.muted, fontSize: 14, fontFamily: "Inter_600SemiBold", marginTop: 6 },
  linkText: { color: colors.primary, fontFamily: "Inter_800ExtraBold", fontSize: 16 },
  listItem: { borderWidth: 1.5, borderColor: colors.line, borderRadius: 24, backgroundColor: colors.card, padding: 18, flexDirection: "row", alignItems: "center", gap: 16 },
  listItemFlat: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 },
  listIcon: { width: 52, height: 52, borderRadius: 18, backgroundColor: colors.lavender, alignItems: "center", justifyContent: "center" },
  listTitle: { color: colors.ink, fontFamily: "Inter_800ExtraBold", fontSize: 18 },
  listMeta: { color: colors.muted, fontFamily: "Inter_700Bold", fontSize: 14, marginTop: 4 },
  askFloat: { position: "absolute", right: 24, bottom: 86, backgroundColor: colors.primary, height: 64, borderRadius: 28, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 24, ...shadow },
  askText: { color: colors.white, fontFamily: "Inter_800ExtraBold", fontSize: 19 },
  tabBar: { position: "absolute", left: 0, right: 0, bottom: 0, height: 74, borderTopWidth: 1.4, borderColor: colors.line, backgroundColor: colors.card, flexDirection: "row", alignItems: "center", justifyContent: "space-around" },
  tabItem: { alignItems: "center", gap: 4, minWidth: 58 },
  tabText: { fontSize: 11, fontFamily: "Inter_700Bold", color: colors.ink },
  heroPattern: { height: 260, alignItems: "center", justifyContent: "center" },
  chatPrompt: { fontFamily: "Inter_800ExtraBold", color: colors.text, fontSize: 34, lineHeight: 42, textAlign: "center", paddingHorizontal: 30, marginBottom: 20 },
  messageBubble: { width: "78%", borderRadius: 22, padding: 22, marginVertical: 12, ...shadow },
  userBubble: { backgroundColor: colors.primary, alignSelf: "flex-end" },
  aiBubble: { backgroundColor: colors.card, alignSelf: "flex-start" },
  messageText: { fontFamily: "Inter_400Regular", color: colors.ink, fontSize: 19, lineHeight: 29 },
  timeText: { marginTop: 10, color: colors.muted, fontFamily: "Inter_700Bold" },
  composerWrap: { position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: colors.card, borderTopWidth: 1.5, borderColor: colors.line, padding: 18, gap: 14 },
  quickRow: { flexDirection: "row", gap: 10 },
  quickPill: { flex: 1, borderWidth: 1.6, borderColor: colors.line, borderRadius: 22, height: 52, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  quickText: { color: colors.ink, fontFamily: "Inter_800ExtraBold", fontSize: 14 },
  composer: { minHeight: 72, flexDirection: "row", alignItems: "center", gap: 10 },
  input: { flex: 1, color: colors.ink, fontFamily: "Inter_400Regular", fontSize: 18, maxHeight: 90 },
  sendButton: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", ...shadow },
  largeInput: { minHeight: 62, borderRadius: 20, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.white, paddingHorizontal: 18, paddingVertical: 14, fontSize: 17, color: colors.ink, fontFamily: "Inter_400Regular" },
  segment: { height: 54, borderRadius: 20, backgroundColor: "#DDE8F4", flexDirection: "row", padding: 5, gap: 5 },
  segmentItem: { flex: 1, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  segmentActive: { backgroundColor: colors.primary },
  segmentText: { color: colors.muted, fontFamily: "Inter_800ExtraBold", textTransform: "capitalize" },
  primaryButton: { height: 62, borderRadius: 24, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 10, ...shadow },
  secondaryButton: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.line },
  primaryButtonText: { color: colors.white, fontFamily: "Inter_800ExtraBold", fontSize: 17 },
  uploadBox: { borderRadius: 24, borderWidth: 1.5, borderStyle: "dashed", borderColor: colors.line, alignItems: "center", gap: 10, padding: 24, backgroundColor: colors.white },
  questionCard: { borderTopWidth: 1, borderColor: colors.line, paddingTop: 14, gap: 6 },
  answerText: { color: colors.ink, lineHeight: 22, fontFamily: "Inter_400Regular" },
  score: { color: colors.primary, fontFamily: "Inter_800ExtraBold", fontSize: 26 },
  bigCard: { minHeight: 190, borderRadius: 30, overflow: "hidden", borderWidth: 1.6, borderColor: colors.line, padding: 24, justifyContent: "flex-end", backgroundColor: colors.white },
  bigValue: { fontFamily: "Inter_800ExtraBold", fontSize: 40, color: colors.ink, marginTop: 8 },
  badge: { fontSize: 16, color: colors.green },
  planCard: { borderRadius: 24, borderWidth: 1.5, borderColor: colors.line, backgroundColor: colors.card, padding: 20, gap: 16 },
  progressTrackSmall: { height: 12, backgroundColor: "#DDE8F4", borderRadius: 20, overflow: "hidden" },
  noteCard: { borderRadius: 26, borderWidth: 1.6, borderColor: colors.line, backgroundColor: colors.card, padding: 22, gap: 8 },
  healthMetric: { flex: 1, borderRadius: 24, borderWidth: 1.6, borderColor: colors.line, padding: 22, backgroundColor: colors.card },
  good: { color: colors.green, fontFamily: "Inter_800ExtraBold", fontSize: 15 },
  bad: { color: colors.coral, fontFamily: "Inter_800ExtraBold", fontSize: 15 },
  serviceRow: { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderColor: colors.line },
  statusPill: { backgroundColor: "#CFEFE8", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 8 },
  statusText: { color: colors.green, fontFamily: "Inter_800ExtraBold", fontSize: 13 }
});
