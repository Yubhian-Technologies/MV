"use client";

import { useAuthStore } from "@/store/authStore";

export function useAuth() {
  const { user, profile, loading } = useAuthStore();
  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isOnboarded: profile?.onboardingComplete ?? false,
    isHost: profile?.role === "host",
    isAdmin: profile?.role === "admin",
  };
}
