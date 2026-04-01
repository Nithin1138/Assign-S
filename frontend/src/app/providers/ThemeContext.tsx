import React, { useEffect } from 'react';
import { useAuth } from '../../features/auth/context/AuthContext';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const theme = profile?.preferences?.theme || 'light';
  const fontFamily = profile?.preferences?.fontFamily || 'sans';
  const glassmorphism = profile?.preferences?.glassmorphism ?? false;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'midnight', 'emerald', 'rose', 'amber', 'nord', 'coffee');
    root.classList.add(theme);

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
  }, [theme, fontFamily, glassmorphism, profile?.preferences?.accentColor]);

  return <>{children}</>;
};
