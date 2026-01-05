"use client";

import { AuthProvider } from "@/components/layout/AuthProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer position="bottom-right" theme="colored" autoClose={3200} hideProgressBar closeOnClick draggable />
    </AuthProvider>
  );
}
