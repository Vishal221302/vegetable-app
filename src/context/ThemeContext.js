import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_MODE_KEY = '@app_dark_mode';

// ── Light palette ──────────────────────────────────────────────────────────
const lightColors = {
  primary: '#01B763',
  primaryLight: '#E6F8EF',
  secondary: '#FF7A00',
  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceSecondary: '#F0F2F5',
  card: '#FFFFFF',
  text: '#1C1C28',
  textSecondary: '#5A5F7A',
  textLight: '#8F92A1',
  border: '#E8EAF0',
  borderLight: '#F0F0F0',
  inputBg: '#F8F9FB',
  icon: '#333333',
  headerBg: '#FFFFFF',
  tabBarBg: '#FFFFFF',
  error: '#FF3B30',
  success: '#01B763',
  overlay: 'rgba(0,0,0,0.5)',
  skeleton: '#E8EAF0',
  skeletonHighlight: '#F5F6FA',
  shadow: '#00000012',
};

// ── Dark palette ───────────────────────────────────────────────────────────
const darkColors = {
  primary: '#01B763',
  primaryLight: '#0A2E1C',
  secondary: '#FF7A00',
  background: '#0D0F14',
  surface: '#161B24',
  surfaceSecondary: '#1E2533',
  card: '#1A2033',
  text: '#EAEDF5',
  textSecondary: '#A0A8BF',
  textLight: '#666D85',
  border: '#252B3D',
  borderLight: '#252B3D',
  inputBg: '#1E2533',
  icon: '#EAEDF5',
  headerBg: '#161B24',
  tabBarBg: '#161B24',
  error: '#FF5555',
  success: '#01B763',
  overlay: 'rgba(0,0,0,0.75)',
  skeleton: '#1E2533',
  skeletonHighlight: '#252B3D',
  shadow: '#00000040',
};

const ThemeContext = createContext({
  isDark: false,
  colors: lightColors,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load persisted preference
  useEffect(() => {
    AsyncStorage.getItem(DARK_MODE_KEY)
      .then(value => {
        if (value === 'true') setIsDark(true);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const toggleTheme = async () => {
    const newVal = !isDark;
    setIsDark(newVal);
    try {
      await AsyncStorage.setItem(DARK_MODE_KEY, String(newVal));
    } catch (_) {}
  };

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ isDark, colors: isDark ? darkColors : lightColors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeContext;
