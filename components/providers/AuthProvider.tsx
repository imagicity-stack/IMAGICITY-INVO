"use client";

import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { initializeClientApp } from "@/lib/firebase/client";

export type Role = "admin" | "viewer" | "editor";

interface AuthContextShape {
  user: User | null;
  role: Role | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextShape | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const app = initializeClientApp();
    const auth = getAuth(app);
    const db = getFirestore(app);

    setPersistence(auth, browserLocalPersistence);

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const userDoc = await getDoc(doc(db, "users", nextUser.uid));
        const data = userDoc.data();
        const nextRole = data?.role as Role | undefined;
        setRole(nextRole ?? null);
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      signIn: async (email: string, password: string) => {
        const app = initializeClientApp();
        const auth = getAuth(app);
        await signInWithEmailAndPassword(auth, email, password);
      },
      signOutUser: async () => {
        const app = initializeClientApp();
        const auth = getAuth(app);
        await signOut(auth);
      },
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
