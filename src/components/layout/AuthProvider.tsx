"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "@/lib/firebase";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

export type UserRole = "admin" | "viewer";

interface AuthContextProps {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        const snap = await getDoc(doc(firestore, "users", nextUser.uid));
        const data = snap.data();
        const userRole = (data?.role as UserRole) ?? null;
        setRole(userRole);
        if (!data?.active) {
          toast.error("Your account is disabled. Contact Imagicity Admin.");
          await firebaseSignOut(auth);
        }
      } else {
        setRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    router.push("/dashboard");
    toast.success("Welcome back to Imagicity Control Tower");
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    router.push("/login");
  };

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      signIn,
      signOut,
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
