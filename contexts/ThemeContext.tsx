/**
 * Theme Context
 * 
 * Provides theme management throughout the app:
 * - Light/Dark/System theme modes
 * - Theme persistence with AsyncStorage
 * - Theme toggle functionality
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import { lightColors, darkColors, ThemeColors, ColorScheme } from '@/constants/tokens';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeColors;
    colorScheme: ColorScheme;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@contact_crm_theme_mode';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useSystemColorScheme();
    const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

    // Determine active color scheme based on mode
    const colorScheme: ColorScheme =
        themeMode === 'system'
            ? (systemColorScheme || 'dark') as ColorScheme
            : themeMode;

    const theme = colorScheme === 'light' ? lightColors : darkColors;

    // Load saved theme preference
    useEffect(() => {
        loadThemePreference();
    }, []);

    // Save theme preference when it changes
    useEffect(() => {
        saveThemePreference(themeMode);
    }, [themeMode]);

    const loadThemePreference = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
                setThemeModeState(savedTheme as ThemeMode);
            }
        } catch (error) {
            console.error('Failed to load theme preference:', error);
        }
    };

    const saveThemePreference = async (mode: ThemeMode) => {
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
        } catch (error) {
            console.error('Failed to save theme preference:', error);
        }
    };

    const setThemeMode = (mode: ThemeMode) => {
        setThemeModeState(mode);
    };

    const toggleTheme = () => {
        // Simple toggle between light and dark
        setThemeModeState(prev => {
            if (prev === 'system') return 'light';
            if (prev === 'light') return 'dark';
            return 'light';
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, themeMode, setThemeMode, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
