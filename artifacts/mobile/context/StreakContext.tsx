import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  xpReward: number;
  unlockedAt?: number;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: "first_challenge", title: "First Step",       desc: "Complete your first daily challenge", icon: "🎯", xpReward: 50 },
  { id: "streak_3",        title: "On a Roll",         desc: "Reach a 3-day streak",               icon: "🔥", xpReward: 30 },
  { id: "streak_7",        title: "Hot Streak",        desc: "Reach a 7-day streak",               icon: "⚡", xpReward: 100 },
  { id: "streak_14",       title: "Two Weeks Strong",  desc: "Reach a 14-day streak",              icon: "💪", xpReward: 200 },
  { id: "streak_30",       title: "Unstoppable",       desc: "Reach a 30-day streak",              icon: "🏆", xpReward: 500 },
  { id: "sessions_10",     title: "Getting Started",   desc: "Complete 10 study sessions",         icon: "📚", xpReward: 75 },
  { id: "sessions_50",     title: "Dedicated Learner", desc: "Complete 50 study sessions",         icon: "🎓", xpReward: 250 },
  { id: "challenges_7",    title: "Challenge Week",    desc: "Complete 7 daily challenges",        icon: "🗓️", xpReward: 150 },
  { id: "challenges_30",   title: "Challenge Master",  desc: "Complete 30 daily challenges",       icon: "👑", xpReward: 600 },
  { id: "minutes_60",      title: "Hour Logged",       desc: "Study for 60 minutes total",         icon: "⏱️", xpReward: 80 },
  { id: "minutes_300",     title: "Study Marathon",    desc: "Study for 5 hours total",            icon: "🏅", xpReward: 300 },
  { id: "silver_league",   title: "Silver League",     desc: "Reach Silver league (500 XP)",       icon: "🥈", xpReward: 0 },
  { id: "gold_league",     title: "Gold League",       desc: "Reach Gold league (2000 XP)",        icon: "🥇", xpReward: 0 },
  { id: "diamond_league",  title: "Diamond League",    desc: "Reach Diamond league (5000 XP)",     icon: "💎", xpReward: 0 },
];

export type League = "Bronze" | "Silver" | "Gold" | "Diamond";

export function getLeague(xp: number): League {
  if (xp >= 5000) return "Diamond";
  if (xp >= 2000) return "Gold";
  if (xp >= 500)  return "Silver";
  return "Bronze";
}

export function getLeagueColor(league: League): string {
  return { Bronze: "#CD7F32", Silver: "#9CA3AF", Gold: "#F59E0B", Diamond: "#7B7FFF" }[league];
}

export function getLeagueIcon(league: League): string {
  return { Bronze: "🥉", Silver: "🥈", Gold: "🥇", Diamond: "💎" }[league];
}

export function xpToNextLeague(xp: number): { needed: number; label: string } {
  if (xp < 500)  return { needed: 500 - xp,  label: "Silver" };
  if (xp < 2000) return { needed: 2000 - xp, label: "Gold" };
  if (xp < 5000) return { needed: 5000 - xp, label: "Diamond" };
  return { needed: 0, label: "Diamond" };
}

interface StreakContextValue {
  streak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  totalXP: number;
  league: League;
  lastActiveDate: string | null;
  completedChallenges: string[];
  earnedAchievements: Achievement[];
  newAchievements: Achievement[];
  clearNewAchievements: () => void;
  recordSession: (minutes: number, xpOverride?: number) => Promise<void>;
  markDailyChallengeComplete: (dateKey: string) => Promise<void>;
  hasDoneChallenge: (dateKey: string) => boolean;
  addXP: (amount: number) => Promise<void>;
}

const STREAK_KEY = "@vitala_streak_v2";

interface StreakData {
  streak: number;
  longestStreak: number;
  totalSessions: number;
  totalMinutes: number;
  totalXP: number;
  lastActiveDate: string | null;
  completedChallenges: string[];
  earnedAchievementIds: string[];
}

const StreakContext = createContext<StreakContextValue | null>(null);

function todayStr() { return new Date().toISOString().slice(0, 10); }
function yesterdayStr() {
  const d = new Date(); d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StreakData>({
    streak: 0, longestStreak: 0, totalSessions: 0, totalMinutes: 0,
    totalXP: 0, lastActiveDate: null, completedChallenges: [], earnedAchievementIds: [],
  });
  const [newAchievements, setNewAchievements] = useState<Achievement[]>([]);
  const isMounted = useRef(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STREAK_KEY);
        if (stored && isMounted.current) {
          const parsed = JSON.parse(stored) as StreakData;
          if (!parsed.completedChallenges) parsed.completedChallenges = [];
          if (!parsed.earnedAchievementIds) parsed.earnedAchievementIds = [];
          if (!parsed.totalXP) parsed.totalXP = 0;
          const today = todayStr();
          const yesterday = yesterdayStr();
          if (parsed.lastActiveDate !== today && parsed.lastActiveDate !== yesterday) {
            parsed.streak = 0;
          }
          setData(parsed);
        }
      } catch {}
    })();
    return () => { isMounted.current = false; };
  }, []);

  const persist = useCallback(async (next: StreakData) => {
    try { await AsyncStorage.setItem(STREAK_KEY, JSON.stringify(next)); } catch {}
  }, []);

  const checkAchievements = useCallback((d: StreakData): Achievement[] => {
    const unlocked: Achievement[] = [];
    const checks: Record<string, boolean> = {
      first_challenge:  d.completedChallenges.length >= 1,
      streak_3:         d.streak >= 3,
      streak_7:         d.streak >= 7,
      streak_14:        d.streak >= 14,
      streak_30:        d.streak >= 30,
      sessions_10:      d.totalSessions >= 10,
      sessions_50:      d.totalSessions >= 50,
      challenges_7:     d.completedChallenges.length >= 7,
      challenges_30:    d.completedChallenges.length >= 30,
      minutes_60:       d.totalMinutes >= 60,
      minutes_300:      d.totalMinutes >= 300,
      silver_league:    d.totalXP >= 500,
      gold_league:      d.totalXP >= 2000,
      diamond_league:   d.totalXP >= 5000,
    };
    for (const ach of ALL_ACHIEVEMENTS) {
      if (!d.earnedAchievementIds.includes(ach.id) && checks[ach.id]) {
        unlocked.push({ ...ach, unlockedAt: Date.now() });
      }
    }
    return unlocked;
  }, []);

  const applyNewAchievements = useCallback((newlyUnlocked: Achievement[], draft: StreakData): StreakData => {
    if (newlyUnlocked.length === 0) return draft;
    let bonusXP = 0;
    const newIds = newlyUnlocked.map((a) => { bonusXP += a.xpReward; return a.id; });
    const updated = { ...draft, earnedAchievementIds: [...draft.earnedAchievementIds, ...newIds], totalXP: draft.totalXP + bonusXP };
    setNewAchievements((prev) => [...prev, ...newlyUnlocked]);
    return updated;
  }, []);

  const recordSession = useCallback(async (minutes: number, xpOverride?: number) => {
    setData((prev) => {
      const today = todayStr();
      const yesterday = yesterdayStr();
      let newStreak = prev.streak;
      if (prev.lastActiveDate === today) {
        // already counted streak today
      } else if (prev.lastActiveDate === yesterday) {
        newStreak = prev.streak + 1;
      } else {
        newStreak = 1;
      }
      const xpGain = xpOverride ?? Math.max(5, Math.round(minutes * 2));
      let draft: StreakData = {
        ...prev,
        streak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        totalSessions: prev.totalSessions + 1,
        totalMinutes: prev.totalMinutes + minutes,
        totalXP: prev.totalXP + xpGain,
        lastActiveDate: today,
      };
      const newlyUnlocked = checkAchievements(draft);
      draft = applyNewAchievements(newlyUnlocked, draft);
      persist(draft);
      return draft;
    });
  }, [persist, checkAchievements, applyNewAchievements]);

  const addXP = useCallback(async (amount: number) => {
    setData((prev) => {
      const draft = { ...prev, totalXP: prev.totalXP + amount };
      const newlyUnlocked = checkAchievements(draft);
      const final = applyNewAchievements(newlyUnlocked, draft);
      persist(final);
      return final;
    });
  }, [persist, checkAchievements, applyNewAchievements]);

  const markDailyChallengeComplete = useCallback(async (dateKey: string) => {
    setData((prev) => {
      if (prev.completedChallenges.includes(dateKey)) return prev;
      const xpGain = 50;
      let draft: StreakData = {
        ...prev,
        completedChallenges: [...prev.completedChallenges, dateKey],
        totalXP: prev.totalXP + xpGain,
      };
      const newlyUnlocked = checkAchievements(draft);
      draft = applyNewAchievements(newlyUnlocked, draft);
      persist(draft);
      return draft;
    });
  }, [persist, checkAchievements, applyNewAchievements]);

  const hasDoneChallenge = useCallback((dateKey: string) => {
    return data.completedChallenges.includes(dateKey);
  }, [data.completedChallenges]);

  const clearNewAchievements = useCallback(() => setNewAchievements([]), []);

  const earnedAchievements = ALL_ACHIEVEMENTS
    .filter((a) => data.earnedAchievementIds.includes(a.id))
    .map((a) => ({ ...a, unlockedAt: Date.now() }));

  const league = getLeague(data.totalXP);

  return (
    <StreakContext.Provider value={{
      ...data, league, earnedAchievements, newAchievements,
      clearNewAchievements, recordSession, markDailyChallengeComplete,
      hasDoneChallenge, addXP,
    }}>
      {children}
    </StreakContext.Provider>
  );
}

export function useStreak() {
  const ctx = useContext(StreakContext);
  if (!ctx) throw new Error("useStreak must be used within StreakProvider");
  return ctx;
}
