import type { ChatMessage, QuizQuestion } from "@/types";

export const initialMessages: ChatMessage[] = [
  {
    id: "m1",
    role: "user",
    text: "I'm struggling with the Krebs cycle for my biology exam. Can you simplify it?",
    time: "10:02 AM"
  },
  {
    id: "m2",
    role: "assistant",
    text: "Absolutely. Think of it as a cellular power plant turbine: fuel enters, energy carriers leave, and ATP gets topped up. Want a mnemonic for the steps?",
    time: "10:02 AM"
  },
  {
    id: "m3",
    role: "user",
    text: "Yes please. Make it exam friendly.",
    time: "10:03 AM"
  }
];

export const sampleQuestions: QuizQuestion[] = [
  {
    id: "q1",
    type: "mcq",
    prompt: "What is the best Feynman test for understanding a topic?",
    options: ["Reciting definitions", "Teaching it simply", "Reading twice", "Highlighting notes"],
    answer: "Teaching it simply",
    explanation: "If you can explain an idea plainly and fix gaps, you understand it.",
    difficulty: "Easy"
  },
  {
    id: "q2",
    type: "mcq",
    prompt: "Which output belongs in a PDF intelligence report?",
    options: ["Only page count", "Key definitions", "Random flashcards", "File color"],
    answer: "Key definitions",
    explanation: "Definitions are high-value anchors for review and quiz generation.",
    difficulty: "Medium"
  }
];

export const plannerTasks = [
  { title: "Biology: Krebs cycle teach-back", time: "4:30 PM", progress: 0.75 },
  { title: "Math formulas extraction review", time: "5:20 PM", progress: 0.4 },
  { title: "Exam-style quiz: weak topics", time: "6:00 PM", progress: 0.2 }
];

export const notes = [
  { subject: "Biology", title: "Cellular respiration map", body: "Glycolysis starts in cytoplasm. Krebs cycle produces electron carriers. ETC makes most ATP." },
  { subject: "Physics", title: "Forces quick sheet", body: "Net force causes acceleration. Free body diagrams reveal hidden components." }
];
