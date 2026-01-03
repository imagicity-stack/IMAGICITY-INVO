"use client";

import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { auth } from "@/lib/firebase/client";
import { bootstrapUser } from "@/lib/firebase/firestore";
import { UserDoc } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  profile: UserDoc | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

import { createContext, useContext } from "react";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (next) => {
      setUser(next);
      if (next) {
        try {
          const profileDoc = await bootstrapUser(next.uid, next.email || "");
          setProfile(profileDoc);
        } catch (err) {
          console.error(err);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      login: async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
      },
      logout: async () => {
        await signOut(auth);
      },
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
