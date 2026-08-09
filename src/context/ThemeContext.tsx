import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type ThemeMode = 'blue' | 'rose';

export interface ThemeColors {
  primaryBg: string;
  primaryBgSolid: string;
  primaryText: string;
  primaryTextHover: string;
  primaryBorder: string;
  primaryBadgeBg: string;
  primaryShadow: string;
  gradientHeader: string;
  ringFocus: string;
  accentDot: string;
}

const THEME_TOKENS: Record<ThemeMode, ThemeColors> = {
  blue: {
    primaryBg: 'bg-sky-500 hover:bg-sky-400 text-slate-950',
    primaryBgSolid: 'bg-sky-600',
    primaryText: 'text-sky-400',
    primaryTextHover: 'hover:text-sky-300',
    primaryBorder: 'border-sky-500/30',
    primaryBadgeBg: 'bg-sky-500/10',
    primaryShadow: 'shadow-sky-500/20',
    gradientHeader: 'from-sky-600 to-cyan-500',
    ringFocus: 'focus:border-sky-500',
    accentDot: 'bg-sky-400',
  },
  rose: {
    primaryBg: 'bg-pink-400 hover:bg-pink-300 text-slate-950',
    primaryBgSolid: 'bg-pink-500',
    primaryText: 'text-pink-400',
    primaryTextHover: 'hover:text-pink-300',
    primaryBorder: 'border-pink-400/30',
    primaryBadgeBg: 'bg-pink-400/10',
    primaryShadow: 'shadow-pink-400/20',
    gradientHeader: 'from-pink-500 to-fuchsia-400',
    ringFocus: 'focus:border-pink-400',
    accentDot: 'bg-pink-400',
  },
};

export const USER_DEFAULT_THEMES: Record<string, ThemeMode> = {
  "1675cf50-82b8-4e59-8de5-36a35fbd0348": "blue",
  "b798d5a0-4048-486a-8f14-b347c355a476": "rose",
};

export function getDefaultThemeForUser(userId?: string): ThemeMode {
  if (userId && USER_DEFAULT_THEMES[userId]) {
    return USER_DEFAULT_THEMES[userId];
  }
  return 'blue';
}

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>('blue');

  const setTheme = useCallback((mode: ThemeMode) => {
    setThemeState(mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'blue' ? 'rose' : 'blue';
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
      colors: THEME_TOKENS[theme],
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser utilizado dentro de um ThemeProvider');
  }
  return context;
};

