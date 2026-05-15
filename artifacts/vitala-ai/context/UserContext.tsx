import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

interface UserState {
  userName: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  totalQuizzes: number;
  rank: number;
  feynmanSessionsToday: number;
  lastActiveDate: string;
  isOnboarded: boolean;
}

interface UserContextType {
  user: UserState;
  addXP: (amount: number) => void;
  incrementFeynman: () => void;
  incrementQuizzes: () => void;
  completeOnboarding: (name: string) => void;
}

const DEFAULT: UserState = {
  userName: "Scholar",
  level: 1,
  xp: 0,
  xpToNext: 500,
  streak: 0,
  totalQuizzes: 0,
  rank: 999,
  feynmanSessionsToday: 0,
  lastActiveDate: "",
  isOnboarded: false,
};

const KEY = "@vitala_user_v2";

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(DEFAULT);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) {
          setLoaded(true);
          return;
        }
        const parsed = JSON.parse(raw) as UserState;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86_400_000).toDateString();

        // Fix streak
        let streak = parsed.streak ?? 0;
        if (parsed.lastActiveDate === today) {
          // already counted today
        } else if (parsed.lastActiveDate === yesterday) {
          streak += 1; // consecutive day!
        } else if (parsed.lastActiveDate !== today) {
          streak = 1; // broke streak, start fresh
        }

        // Reset daily feynman counter
        const feynmanSessionsToday =
          parsed.lastActiveDate === today ? parsed.feynmanSessionsToday : 0;

        setUser({
          ...DEFAULT,
          ...parsed,
          streak,
          feynmanSessionsToday,
          lastActiveDate: today,
        });
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const persist = useCallback((next: UserState) => {
    setUser(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addXP = useCallback((amount: number) => {
    setUser((prev) => {
      let { xp, xpToNext, level } = prev;
      xp += amount;
      while (xp >= xpToNext) {
        xp -= xpToNext;
        level += 1;
        xpToNext = Math.floor(xpToNext * 1.25);
      }
      const next = { ...prev, xp, xpToNext, level };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const incrementFeynman = useCallback(() => {
    setUser((prev) => {
      const next = { ...prev, feynmanSessionsToday: prev.feynmanSessionsToday + 1 };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    addXP(10);
  }, [addXP]);

  const incrementQuizzes = useCallback(() => {
    // XP is awarded separately by QuizModal per correct answer — don't double-add here
    setUser((prev) => {
      const next = { ...prev, totalQuizzes: prev.totalQuizzes + 1 };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const completeOnboarding = useCallback(
    (name: string) => {
      const today = new Date().toDateString();
      persist({
        ...DEFAULT,
        userName: name.trim() || "Scholar",
        isOnboarded: true,
        lastActiveDate: today,
        streak: 1,
      });
    },
    [persist]
  );

  if (!loaded) return null;

  return (
    <UserContext.Provider value={{ user, addXP, incrementFeynman, incrementQuizzes, completeOnboarding }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
