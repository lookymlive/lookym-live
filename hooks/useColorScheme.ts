import { useState, useEffect } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define theme colors
const lightColors = {
  primary: '#5E72E4',
  primaryLight: '#EDF0FD',
  secondary: '#F7FAFC',
  background: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1F36',
  textSecondary: '#8898AA',
  border: '#E9ECEF',
  error: '#F5365C',
  errorLight: '#FEECF0',
  success: '#2DCE89',
  warning: '#FB6340',
  disabled: '#ADB5BD',
};

const darkColors = {
  primary: '#5E72E4',
  primaryLight: '#2A3158',
  secondary: '#2D3748',
  background: '#1A202C',
  card: '#2D3748',
  text: '#F7FAFC',
  textSecondary: '#A0AEC0',
  border: '#4A5568',
  error: '#F5365C',
  errorLight: '#4A2630',
  success: '#2DCE89',
  warning: '#FB6340',
  disabled: '#4A5568',
};

export function useColorScheme() {
  const nativeColorScheme = useNativeColorScheme();
  const [isDark, setIsDark] = useState(nativeColorScheme === 'dark');
  
  useEffect(() => {
    // Load user preference from storage
    const loadColorScheme = async () => {
      try {
        const storedScheme = await AsyncStorage.getItem('colorScheme');
        if (storedScheme !== null) {
          setIsDark(storedScheme === 'dark');
        } else {
          setIsDark(nativeColorScheme === 'dark');
        }
      } catch (error) {
        console.error('Failed to load color scheme preference:', error);
      }
    };
    
    loadColorScheme();
  }, [nativeColorScheme]);
  
  const toggleColorScheme = async () => {
    const newMode = !isDark;
    setIsDark(newMode);
    
    try {
      await AsyncStorage.setItem('colorScheme', newMode ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save color scheme preference:', error);
    }
  };
  
  return {
    isDark,
    colorScheme: isDark ? 'dark' : 'light',
    colors: isDark ? darkColors : lightColors,
    toggleColorScheme,
  };
}