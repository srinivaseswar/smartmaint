import { useEffect, type ReactNode } from 'react';
import { useAppSelector } from '@/store';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useAppSelector((s) => s.theme.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return <>{children}</>;
}
