'use client';
import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; };

export const Button = ({ variant = 'primary', className, ...props }: Props) => {
  const base = 'px-3 py-2 rounded-md text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variants: Record<typeof variant, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700 focus:ring-brand-500',
    secondary: 'bg-white text-brand-700 border border-brand-200 hover:bg-brand-50 focus:ring-brand-500',
    ghost: 'text-slate-600 hover:bg-slate-100 focus:ring-brand-500'
  };
  return <button className={twMerge(base, variants[variant], className)} {...props} />;
};
