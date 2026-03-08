"use client";

import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "@/services/auth.service";
import api from "@/lib/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pending2FA, setPending2FA] = useState(null);

  const isAuthenticated = !!user;

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      if (res?.data?.user) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await new Promise((r) => setTimeout(r, 50));
        await authService.refreshToken();
        await fetchUser();
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const login = async (data) => {
    const res = await authService.login(data);

    if (res?.requiresTwoFactor) {
      setPending2FA({
        email: data.email,
        password: data.password,
      });

      return {
        requiresTwoFactor: true,
      };
    }

    await fetchUser();

    return res;
  };

  const verifyTwoFactor = async (code) => {
    if (!pending2FA) {
      throw new Error("Missing login session");
    }

    const res = await authService.login({
      email: pending2FA.email,
      password: pending2FA.password,
      twoFactorCode: code,
    });

    const me = await api.get("/api/auth/me");

    if (me?.data?.user) {
      setUser(me.data.user);
    }

    setPending2FA(null);

    return res;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    return res;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
    window.location.href = "/";
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        pending2FA,
        login,
        verifyTwoFactor,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);