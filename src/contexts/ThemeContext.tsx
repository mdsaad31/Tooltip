import React, { createContext, useContext, useEffect, useState } from 'react';

export interface Theme {
  mode: 'light' | 'dark' | 'auto';
  accentColor: 'indigo' | 'purple' | 'pink' | 'red' | 'orange' | 'yellow' | 'green' | 'blue';
  backgroundStyle: 'gradient' | 'animated' | 'minimal' | 'cosmic';
  transparency: number;
  soundEnabled: boolean;
}

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  updateTheme: (updates: Partial<Theme>) => void;
  resetTheme: () => void;
}

const defaultTheme: Theme = {
  mode: 'dark',
  accentColor: 'indigo',
  backgroundStyle: 'gradient',
  transparency: 0.15,
  soundEnabled: true
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('tooltip-theme');
    return savedTheme ? { ...defaultTheme, ...JSON.parse(savedTheme) } : defaultTheme;
  });
  
  const [isDark, setIsDark] = useState(false);

  const updateTheme = (updates: Partial<Theme>) => {
    setTheme(prev => ({ ...prev, ...updates }));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem('tooltip-theme');
  };

  // Update dark mode based on theme preference and system preference
  useEffect(() => {
    const updateDarkMode = () => {
      if (theme.mode === 'auto') {
        setIsDark(window.matchMedia('(prefers-color-scheme: dark)').matches);
      } else {
        setIsDark(theme.mode === 'dark');
      }
    };

    updateDarkMode();

    if (theme.mode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', updateDarkMode);
      return () => mediaQuery.removeEventListener('change', updateDarkMode);
    }
  }, [theme.mode]);

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem('tooltip-theme', JSON.stringify(theme));
    
    // Apply theme CSS variables
    const root = document.documentElement;
    const body = document.body;
    
    // Accent color mapping
    const accentColors = {
      indigo: { primary: '#6366f1', secondary: '#818cf8' },
      purple: { primary: '#8b5cf6', secondary: '#a78bfa' },
      pink: { primary: '#ec4899', secondary: '#f472b6' },
      red: { primary: '#ef4444', secondary: '#f87171' },
      orange: { primary: '#f97316', secondary: '#fb923c' },
      yellow: { primary: '#eab308', secondary: '#facc15' },
      green: { primary: '#22c55e', secondary: '#4ade80' },
      blue: { primary: '#3b82f6', secondary: '#60a5fa' }
    };
    
    const colors = accentColors[theme.accentColor];
    root.style.setProperty('--accent-primary', colors.primary);
    root.style.setProperty('--accent-secondary', colors.secondary);
    
    // Background style
    root.style.setProperty('--theme-mode', theme.mode);
    root.style.setProperty('--bg-style', theme.backgroundStyle);
    root.style.setProperty('--transparency', theme.transparency.toString());
    
    // Apply background style to body
    body.setAttribute('data-bg-style', theme.backgroundStyle);
    body.setAttribute('data-theme-mode', theme.mode);
    
    // Update background gradients based on accent color
    const backgroundVariations = {
      gradient: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
      animated: `radial-gradient(circle at 20% 80%, ${colors.primary} 0%, ${colors.secondary} 50%, #1a1a2e 100%)`,
      minimal: `linear-gradient(to bottom, #1a202c, #2d3748)`,
      cosmic: `linear-gradient(135deg, #2c1810 0%, ${colors.primary}40 25%, #1a1a2e 50%, #16213e 100%)`
    };
    
    root.style.setProperty('--bg-gradient', backgroundVariations.gradient);
    root.style.setProperty('--bg-animated', backgroundVariations.animated);
    root.style.setProperty('--bg-cosmic', backgroundVariations.cosmic);
    
    // Dark mode class toggle
    document.documentElement.classList.toggle('dark', isDark);
  }, [theme, isDark]);

  const value: ThemeContextType = {
    theme,
    isDark,
    updateTheme,
    resetTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};