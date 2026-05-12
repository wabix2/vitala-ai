import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  language: string;
  avatarColor: string;
}

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  hasOnboarded: boolean;
  completeOnboarding: () => Promise<void>;
}

const AUTH_KEY = "@vitala_user";
const ONBOARD_KEY = "@vitala_onboarded";

const AVATAR_COLORS = [
  "#5B5FEF", "#00B4D8", "#00D4AA", "#F97316",
  "#EC4899", "#8B5CF6", "#14B8A6", "#F59E0B",
];

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasOnboarded, setHasOnboarded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [stored, onboarded] = await Promise.all([
          AsyncStorage.getItem(AUTH_KEY),
          AsyncStorage.getItem(ONBOARD_KEY),
        ]);
        if (stored) setUser(JSON.parse(stored) as UserProfile);
        if (onboarded) setHasOnboarded(true);
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, _password: string) => {
    const stored = await AsyncStorage.getItem(AUTH_KEY);
    if (stored) {
      const u = JSON.parse(stored) as UserProfile;
      if (u.email === email) {
        setUser(u);
        return;
      }
    }
    const u: UserProfile = {
      id: Date.now().toString(),
      name: email.split("@")[0] ?? "Learner",
      email,
      language: "en",
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] ?? "#5B5FEF",
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const register = useCallback(async (name: string, email: string, _password: string) => {
    const u: UserProfile = {
      id: Date.now().toString(),
      name,
      email,
      language: "en",
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] ?? "#5B5FEF",
    };
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(u));
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      AsyncStorage.setItem(AUTH_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const completeOnboarding = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARD_KEY, "true");
    setHasOnboarded(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, register, logout, updateProfile, hasOnboarded, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
