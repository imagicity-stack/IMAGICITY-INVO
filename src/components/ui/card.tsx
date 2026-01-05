import { ReactNode } from 'react';

export const Card = ({ children, title, actions }: { children: ReactNode; title?: string; actions?: ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-3">
    {(title || actions) && (
      <div className="flex items-center justify-between">
        {title && <h3 className="text-sm font-semibold text-slate-800">{title}</h3>}
        {actions}
      </div>
    )}
    <div>{children}</div>
  </div>
);
