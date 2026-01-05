import { ReactNode } from "react";

export function Card({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="card-shadow rounded-2xl border border-red-100/60 bg-white/90 p-6 backdrop-blur-sm">
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-2">
          {title && <h3 className="text-lg font-semibold text-[var(--primary)]">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
