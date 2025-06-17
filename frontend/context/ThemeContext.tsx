import React, { createContext, useContext, useState, useEffect } from 'react';
import { ColorScheme, getColors } from '../constants/ThemeColors';
import * as SecureStore from 'expo-secure-store';
import { useColorScheme as useSystemColorScheme, Appearance } from 'react-native';

const THEME_KEY = 'user-theme-preference';

type ThemeContextType = {
  colorScheme: ColorScheme;
  setColorScheme: (scheme: ColorScheme) => void;
  colors: ReturnType<typeof getColors>;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useSystemColorScheme() as ColorScheme;
  const [colorScheme, setColorScheme] = useState<ColorScheme>(systemColorScheme);
  const colors = getColors(colorScheme);

  // Load saved theme when app starts
  useEffect(() => {
    async function loadTheme() {
      try {
        const savedTheme = await SecureStore.getItemAsync(THEME_KEY);
        if (savedTheme) {
          setColorScheme(savedTheme as ColorScheme);
        } else {
          // If no saved theme, use system theme
          setColorScheme(systemColorScheme);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
        // Fallback to system theme on error
        setColorScheme(systemColorScheme);
      }
    }
    loadTheme();
  }, [systemColorScheme]); // Add systemColorScheme as dependency

  // Save theme whenever it changes
  const handleSetColorScheme = async (scheme: ColorScheme) => {
    try {
      await SecureStore.setItemAsync(THEME_KEY, scheme);
      setColorScheme(scheme);
      // Update system theme
      Appearance.setColorScheme(scheme);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        colorScheme,
        setColorScheme: handleSetColorScheme,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}; 