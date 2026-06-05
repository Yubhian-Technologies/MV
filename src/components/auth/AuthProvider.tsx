"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { getUserProfile } from "@/lib/firebase/firestore";
import { useAuthStore } from "@/store/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Hold loading=true for the entire cycle so layouts never see a
      // half-resolved state (user set, profile not yet fetched).
      setLoading(true);
      setUser(user);
      if (user) {
        try {
          const profile = await getUserProfile(user.uid);
          setProfile(profile);
        } catch (err) {
          // Firestore rules may not be deployed yet — non-fatal, auth still works
          console.warn("Could not load user profile:", err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setProfile, setLoading]);

  return <>{children}</>;
}
