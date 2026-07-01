"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { clearSession, getSession, signIn, signUp, updateUser } from "@/lib/auth";
import type { SessionUser } from "@/lib/types";

interface AuthContextValue {
  user: SessionUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (name: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (name: string) => { success: boolean; error?: string };
  updatePassword: (currentPassword: string, newPassword: string) => { success: boolean; error?: string };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setUser(getSession());
    setIsLoading(false);
  }, []);

  const login = useCallback((email: string, password: string) => {
    const result = signIn(email, password);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, error: result.error };
  }, []);

  const signup = useCallback((name: string, email: string, password: string) => {
    const result = signUp(name, email, password);
    if (result.success && result.user) setUser(result.user);
    return { success: result.success, error: result.error };
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  const updateProfile = useCallback(
    (name: string) => {
      if (!user) return { success: false, error: "Not logged in." };
      const result = updateUser(user.id, { name });
      if (result.success && result.user) setUser(result.user);
      return { success: result.success, error: result.error };
    },
    [user]
  );

  const updatePassword = useCallback(
    (currentPassword: string, newPassword: string) => {
      if (!user) return { success: false, error: "Not logged in." };
      const result = updateUser(user.id, { currentPassword, password: newPassword });
      if (result.success && result.user) setUser(result.user);
      return { success: result.success, error: result.error };
    },
    [user]
  );

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signup, logout, updateProfile, updatePassword }}
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
