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
}

interface UserContextType {
  user: UserState;
  addXP: (amount: number) => void;
  incrementFeynman: () => void;
  incrementQuizzes: () => void;
}

const DEFAULT: UserState = {
  userName: "Scholar",
  level: 4,
  xp: 1240,
  xpToNext: 1500,
  streak: 7,
  totalQuizzes: 42,
  rank: 3,
  feynmanSessionsToday: 1,
  lastActiveDate: new Date().toDateString(),
};

const KEY = "@vitala_user_v1";

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>(DEFAULT);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as UserState;
        const today = new Date().toDateString();
        if (parsed.lastActiveDate !== today) {
          parsed.feynmanSessionsToday = 0;
          parsed.lastActiveDate = today;
        }
        setUser({ ...DEFAULT, ...parsed });
      })
      .catch(() => {});
  }, []);

  const persist = useCallback((next: UserState) => {
    setUser(next);
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addXP = useCallback((amount: number) => {
    setUser((prev) => {
      let { xp, xpToNext, level } = prev;
      xp += amount;
      if (xp >= xpToNext) {
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
    persist({ ...user, feynmanSessionsToday: user.feynmanSessionsToday + 1 });
  }, [user, persist]);

  const incrementQuizzes = useCallback(() => {
    persist({ ...user, totalQuizzes: user.totalQuizzes + 1 });
    addXP(50);
  }, [user, persist, addXP]);

  return (
    <UserContext.Provider value={{ user, addXP, incrementFeynman, incrementQuizzes }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
