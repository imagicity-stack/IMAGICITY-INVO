import { ReactNode } from 'react';
import { ShellChrome } from '@/components/layouts/shell-chrome';

export default function ShellLayout({ children }: { children: ReactNode }) {
  return <ShellChrome>{children}</ShellChrome>;
}
