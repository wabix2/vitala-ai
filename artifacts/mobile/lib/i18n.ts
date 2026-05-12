export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "am", label: "አማርኛ", flag: "🇪🇹" },
  { code: "om", label: "Afaan Oromo", flag: "🇪🇹" },
  { code: "sw", label: "Kiswahili", flag: "🇰🇪" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
];

type Translations = {
  home: string;
  chat: string;
  study: string;
  pdf: string;
  profile: string;
  newChat: string;
  typeMessage: string;
  send: string;
  flashcards: string;
  quiz: string;
  summarize: string;
  enterTopic: string;
  generate: string;
  question: string;
  answer: string;
  next: string;
  finish: string;
  score: string;
  uploadPdf: string;
  askAboutDoc: string;
  settings: string;
  language: string;
  theme: string;
  logout: string;
  login: string;
  register: string;
  email: string;
  password: string;
  name: string;
  welcome: string;
  getStarted: string;
  darkMode: string;
  lightMode: string;
  systemMode: string;
  conversations: string;
  noConversations: string;
  deleteConversation: string;
  correct: string;
  incorrect: string;
  explanation: string;
  summary: string;
  keyPoints: string;
  copy: string;
  copied: string;
  homeworkHelper: string;
  notes: string;
  selectLanguage: string;
  tapToReveal: string;
  askQuestion: string;
  pasteOrUpload: string;
};

const en: Translations = {
  home: "Home",
  chat: "Chat",
  study: "Study",
  pdf: "PDF AI",
  profile: "Profile",
  newChat: "New Chat",
  typeMessage: "Ask Vitala anything...",
  send: "Send",
  flashcards: "Flashcards",
  quiz: "Quiz",
  summarize: "Summarize",
  enterTopic: "Enter topic or paste text...",
  generate: "Generate",
  question: "Question",
  answer: "Answer",
  next: "Next",
  finish: "Finish",
  score: "Score",
  uploadPdf: "Upload PDF",
  askAboutDoc: "Ask about document...",
  settings: "Settings",
  language: "Language",
  theme: "Theme",
  logout: "Log Out",
  login: "Sign In",
  register: "Create Account",
  email: "Email",
  password: "Password",
  name: "Full Name",
  welcome: "Welcome to Vitala AI",
  getStarted: "Get Started",
  darkMode: "Dark",
  lightMode: "Light",
  systemMode: "System",
  conversations: "Conversations",
  noConversations: "No conversations yet",
  deleteConversation: "Delete",
  correct: "Correct",
  incorrect: "Incorrect",
  explanation: "Explanation",
  summary: "Summary",
  keyPoints: "Key Points",
  copy: "Copy",
  copied: "Copied!",
  homeworkHelper: "Homework Helper",
  notes: "Notes Summarizer",
  selectLanguage: "Select Language",
  tapToReveal: "Tap to reveal",
  askQuestion: "Ask a question...",
  pasteOrUpload: "Paste text or pick a file",
};

const am: Translations = {
  home: "መነሻ",
  chat: "ንግግር",
  study: "ጥናት",
  pdf: "PDF AI",
  profile: "መገለጫ",
  newChat: "አዲስ ንግግር",
  typeMessage: "ቪታላን ጠይቅ...",
  send: "ላክ",
  flashcards: "ፍላሽካርዶች",
  quiz: "ጥያቄዎች",
  summarize: "ማጠቃለያ",
  enterTopic: "ርዕስ አስገባ...",
  generate: "ፍጠር",
  question: "ጥያቄ",
  answer: "መልስ",
  next: "ቀጣይ",
  finish: "ጨርስ",
  score: "ውጤት",
  uploadPdf: "PDF ጫን",
  askAboutDoc: "ስለ ሰነዱ ጠይቅ...",
  settings: "ቅንብሮች",
  language: "ቋንቋ",
  theme: "ገጽታ",
  logout: "ውጣ",
  login: "ግባ",
  register: "መለያ ፍጠር",
  email: "ኢሜይል",
  password: "የይለፍ ቃል",
  name: "ሙሉ ስም",
  welcome: "ወደ ቪታላ AI እንኳን ደህና መጡ",
  getStarted: "ጀምር",
  darkMode: "ጨለማ",
  lightMode: "ብርሃን",
  systemMode: "ሥርዓት",
  conversations: "ንግግሮች",
  noConversations: "ምንም ንግግሮች የሉም",
  deleteConversation: "ሰርዝ",
  correct: "ትክክል",
  incorrect: "ስህተት",
  explanation: "ማብራሪያ",
  summary: "ማጠቃለያ",
  keyPoints: "ቁልፍ ነጥቦች",
  copy: "ቅዳ",
  copied: "ተቀድቷል!",
  homeworkHelper: "የቤት ስራ ረዳት",
  notes: "ማስታወሻ ማጠቃለያ",
  selectLanguage: "ቋንቋ ምረጥ",
  tapToReveal: "ለማሳየት ንካ",
  askQuestion: "ጥያቄ ጠይቅ...",
  pasteOrUpload: "ጽሑፍ ለጥፍ ወይም ፋይል ምረጥ",
};

const om: Translations = {
  home: "Mana",
  chat: "Haasaa",
  study: "Barnoota",
  pdf: "PDF AI",
  profile: "Profaayilii",
  newChat: "Haasaa Haaraa",
  typeMessage: "Vitala gaafadhu...",
  send: "Ergi",
  flashcards: "Kaardoota",
  quiz: "Gaaffilee",
  summarize: "Cuunfaa",
  enterTopic: "Mata duree galchi...",
  generate: "Uumi",
  question: "Gaaffii",
  answer: "Deebii",
  next: "Itti Aanaa",
  finish: "Xumuri",
  score: "Qabxii",
  uploadPdf: "PDF fe'i",
  askAboutDoc: "Sanadaa irratti gaafadhu...",
  settings: "Qindaa'ina",
  language: "Afaan",
  theme: "Teemaa",
  logout: "Ba'i",
  login: "Seeni",
  register: "Account Uumi",
  email: "Imeelii",
  password: "Jecha darbii",
  name: "Maqaa Guutuu",
  welcome: "Vitala AI Baga Dhuftan",
  getStarted: "Jalqabi",
  darkMode: "Dukkana",
  lightMode: "Ifa",
  systemMode: "Siistama",
  conversations: "Haasaawwan",
  noConversations: "Haasaa hin jiru",
  deleteConversation: "Haqi",
  correct: "Sirrii",
  incorrect: "Dogoggora",
  explanation: "Ibsa",
  summary: "Cuunfaa",
  keyPoints: "Qabxiilee Ijoo",
  copy: "Garagalchi",
  copied: "Garagalfame!",
  homeworkHelper: "Gargaaraa Hojii Mana",
  notes: "Cuunfaa Yaadannoo",
  selectLanguage: "Afaan Filadhu",
  tapToReveal: "Agarsisuuf tuqi",
  askQuestion: "Gaaffii gaafadhu...",
  pasteOrUpload: "Barruu maxxansi ykn faayilii filadhu",
};

const sw: Translations = {
  home: "Nyumbani",
  chat: "Gumzo",
  study: "Kujifunza",
  pdf: "PDF AI",
  profile: "Wasifu",
  newChat: "Gumzo Jipya",
  typeMessage: "Uliza Vitala...",
  send: "Tuma",
  flashcards: "Kadi za Flash",
  quiz: "Maswali",
  summarize: "Muhtasari",
  enterTopic: "Ingiza mada...",
  generate: "Tengeneza",
  question: "Swali",
  answer: "Jibu",
  next: "Inayofuata",
  finish: "Maliza",
  score: "Alama",
  uploadPdf: "Pakia PDF",
  askAboutDoc: "Uliza kuhusu hati...",
  settings: "Mipangilio",
  language: "Lugha",
  theme: "Mandhari",
  logout: "Toka",
  login: "Ingia",
  register: "Fungua Akaunti",
  email: "Barua pepe",
  password: "Nenosiri",
  name: "Jina Kamili",
  welcome: "Karibu Vitala AI",
  getStarted: "Anza",
  darkMode: "Giza",
  lightMode: "Mwanga",
  systemMode: "Mfumo",
  conversations: "Mazungumzo",
  noConversations: "Hakuna mazungumzo bado",
  deleteConversation: "Futa",
  correct: "Sahihi",
  incorrect: "Kosa",
  explanation: "Maelezo",
  summary: "Muhtasari",
  keyPoints: "Pointi Muhimu",
  copy: "Nakili",
  copied: "Imenakiliwa!",
  homeworkHelper: "Msaidizi wa Kazi ya Nyumbani",
  notes: "Muhtasari wa Maelezo",
  selectLanguage: "Chagua Lugha",
  tapToReveal: "Gusa kuonyesha",
  askQuestion: "Uliza swali...",
  pasteOrUpload: "Bandika maandishi au chagua faili",
};

const ar: Translations = {
  home: "الرئيسية",
  chat: "محادثة",
  study: "دراسة",
  pdf: "PDF AI",
  profile: "الملف",
  newChat: "محادثة جديدة",
  typeMessage: "اسأل فيتالا...",
  send: "إرسال",
  flashcards: "بطاقات تعليمية",
  quiz: "اختبار",
  summarize: "ملخص",
  enterTopic: "أدخل الموضوع...",
  generate: "إنشاء",
  question: "سؤال",
  answer: "إجابة",
  next: "التالي",
  finish: "إنهاء",
  score: "النتيجة",
  uploadPdf: "رفع PDF",
  askAboutDoc: "اسأل عن المستند...",
  settings: "الإعدادات",
  language: "اللغة",
  theme: "المظهر",
  logout: "تسجيل الخروج",
  login: "تسجيل الدخول",
  register: "إنشاء حساب",
  email: "البريد الإلكتروني",
  password: "كلمة المرور",
  name: "الاسم الكامل",
  welcome: "مرحباً بك في Vitala AI",
  getStarted: "ابدأ الآن",
  darkMode: "داكن",
  lightMode: "فاتح",
  systemMode: "النظام",
  conversations: "المحادثات",
  noConversations: "لا توجد محادثات بعد",
  deleteConversation: "حذف",
  correct: "صحيح",
  incorrect: "خطأ",
  explanation: "شرح",
  summary: "ملخص",
  keyPoints: "النقاط الرئيسية",
  copy: "نسخ",
  copied: "تم النسخ!",
  homeworkHelper: "مساعد الواجبات",
  notes: "ملخص الملاحظات",
  selectLanguage: "اختر اللغة",
  tapToReveal: "اضغط للكشف",
  askQuestion: "اطرح سؤالاً...",
  pasteOrUpload: "الصق النص أو اختر ملفاً",
};

const TRANSLATIONS: Record<string, Translations> = { en, am, om, sw, ar };

export function t(key: keyof Translations, lang: string): string {
  const dict = TRANSLATIONS[lang] ?? TRANSLATIONS["en"];
  return (dict as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key;
}

export function langName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.label ?? code;
}

export function langFlag(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.flag ?? "🌐";
}
