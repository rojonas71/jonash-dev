import { ReactNode } from 'react';
import { useSiteTheme } from '../hooks/useSiteTheme';

type SiteThemeProviderProps = {
  children: ReactNode;
};

export default function SiteThemeProvider({
  children,
}: SiteThemeProviderProps) {
  useSiteTheme();

  return <>{children}</>;
}