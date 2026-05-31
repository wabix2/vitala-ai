export type TabKey = "home" | "assistant" | "learn" | "pdf" | "quiz" | "planner" | "analytics" | "notes" | "health";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  time: string;
};

export type QuizQuestion = {
  id: string;
  type: "mcq" | "short";
  prompt: string;
  options?: string[];
  answer: string;
  explanation: string;
  difficulty: "Easy" | "Medium" | "Hard";
};
