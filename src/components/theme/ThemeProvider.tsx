'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    applyTheme();
  }, []);

  const applyTheme = () => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
    root.setAttribute('data-theme', 'light');
    localStorage.setItem('corenix-theme', 'light');
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme();
  };

  const toggleTheme = () => {
    setTheme('light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
