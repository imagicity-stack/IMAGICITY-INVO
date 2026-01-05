import { ReactNode } from "react";
import clsx from "clsx";

export function Card({ title, actions, children, className }: { title?: string; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-lg border border-slate-200 bg-white p-4 shadow-sm", className)}>
      {(title || actions) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
          {actions}
        </div>
      )}
      {children}
    </div>
  );
}
