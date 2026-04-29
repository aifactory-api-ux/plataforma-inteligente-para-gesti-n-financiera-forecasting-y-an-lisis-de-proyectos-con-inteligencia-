import { useState, useCallback } from "react";
import { authClient, projectClient } from "../client";
import { User, LoginRequest, LoginResponse } from "@/api/types";
import { useAuthStore } from "@/state/authStore";

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const { user, setUser, clearUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authClient.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      const { access_token, user: userData } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authClient.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      clearUser();
      setLoading(false);
    }
  }, [clearUser]);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await authClient.get<User>("/auth/me");
      setUser(response.data);
    } catch (err) {
      clearUser();
    } finally {
      setLoading(false);
    }
  }, [setUser, clearUser]);

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    logout,
    fetchUser,
  };
}
