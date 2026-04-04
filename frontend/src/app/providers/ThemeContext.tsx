import React, { useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const themePreference = profile?.preferences?.theme || 'light';
  const fontFamily = profile?.preferences?.fontFamily || 'sans';
  const glassmorphism = profile?.preferences?.glassmorphism ?? false;

  useEffect(() => {
    const root = window.document.documentElement;
    
    const applyTheme = (t: string) => {
      root.classList.remove('light', 'dark', 'midnight', 'nord', 'coffee', 'emerald', 'rose', 'amber');
      
      if (t === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.add(isDark ? 'dark' : 'light');
      } else {
        root.classList.add(t);
      }
    };

    applyTheme(themePreference);

    // If system theme, listen for changes
    if (themePreference === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    root.classList.remove('font-sans', 'font-serif', 'font-mono');
    root.classList.add(`font-${fontFamily}`);

    if (glassmorphism) {
      root.classList.add('glass-enabled');
    } else {
      root.classList.remove('glass-enabled');
    }

    if (profile?.preferences?.accentColor) {
      root.style.setProperty('--accent-main', profile.preferences.accentColor);
    } else {
      root.style.removeProperty('--accent-main');
    }
  }, [themePreference, fontFamily, glassmorphism, profile?.preferences?.accentColor]);

  return <>{children}</>;
};
