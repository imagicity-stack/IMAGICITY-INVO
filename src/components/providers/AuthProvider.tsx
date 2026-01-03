"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/client";

export type UserRole = "admin" | "viewer" | null;

interface AuthState {
  user: User | null;
  role: UserRole;
  loading: boolean;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", nextUser.uid));
        const data = userDoc.data();
        setRole((data?.role as UserRole) ?? null);
      } catch (error) {
        console.error("Unable to resolve user role", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      signOutUser: () => signOut(auth),
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
