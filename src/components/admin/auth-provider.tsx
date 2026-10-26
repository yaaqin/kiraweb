"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import * as api from "@/lib/api";
import type { SessionUser } from "@/lib/types";

type AuthState =
  | { status: "loading"; user: null }
  | { status: "authenticated"; user: SessionUser }
  | { status: "unauthenticated"; user: null };

interface AuthContextValue {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const toState = (user: SessionUser | null | undefined): AuthState =>
  user ? { status: "authenticated", user } : { status: "unauthenticated", user: null };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading", user: null });

  useEffect(() => {
    api.onSessionChange((session) => setState(toState(session?.user)));
    api.refreshSession().then((session) => setState(toState(session?.user)));
    return () => api.onSessionChange(null);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const session = await api.login(email, password);
    setState(toState(session.user));
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setState(toState(null));
  }, []);

  return <AuthContext value={{ state, login, logout }}>{children}</AuthContext>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
