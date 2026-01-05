"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "solid" | "ghost" | "outline";
  children: ReactNode;
}

export function Button({ variant = "solid", className, children, ...rest }: Props) {
  const styles = clsx(
    "rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200",
    {
      solid:
        "bg-[var(--primary)] text-white shadow-lg shadow-red-200 hover:-translate-y-0.5 hover:shadow-xl",
      ghost: "text-[var(--primary)] hover:bg-red-50",
      outline:
        "border border-[var(--primary)] text-[var(--primary)] hover:bg-red-50 disabled:border-gray-300 disabled:text-gray-400",
    }[variant],
    className
  );

  return <button className={styles} {...rest}>{children}</button>;
}
