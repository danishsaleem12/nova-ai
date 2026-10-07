// frontend/src/context/AuthContext.js
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until the first /me check finishes

  // On first load, ask the backend if the cookie is still valid
  useEffect(() => {
    let cancelled = false;
    authApi
      .me()
      .then((data) => !cancelled && setUser(data.user))
      .catch(() => !cancelled && setUser(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  // Each of these throws an ApiError on failure, so forms can show err.message
  const signup = useCallback(async (payload) => {
    const data = await authApi.signup(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(async (payload) => {
    const data = await authApi.login(payload);
    setUser(data.user);
    return data.user;
  }, []);

  const googleLogin = useCallback(async (credential) => {
    const data = await authApi.google(credential);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthenticated: Boolean(user), signup, login, googleLogin, logout }),
    [user, loading, signup, login, googleLogin, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}