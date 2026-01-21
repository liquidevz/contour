/**
 * Design Tokens - Comprehensive Theme System
 * 
 * Centralized design tokens for consistent theming across the app.
 * Supports both light and dark modes with a complete design system.
 */

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const borderRadius = {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
} as const;

export const typography = {
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },
    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
} as const;

export const animations = {
    duration: {
        fast: 150,
        normal: 250,
        slow: 350,
    },
    easing: {
        default: 'ease-in-out' as const,
        in: 'ease-in' as const,
        out: 'ease-out' as const,
    },
} as const;

// Light Theme Colors
export const lightColors = {
    // Primary palette
    primary: '#6366f1', // Indigo
    primaryLight: '#818cf8',
    primaryDark: '#4f46e5',

    // Secondary palette
    secondary: '#ec4899', // Pink
    secondaryLight: '#f472b6',
    secondaryDark: '#db2777',

    // Backgrounds
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#f1f3f5',

    // Surfaces (cards, modals, etc.)
    surface: '#ffffff',
    surfaceSecondary: '#f8f9fa',
    surfaceElevated: '#ffffff',

    // Text
    textPrimary: '#1a1a1a',
    textSecondary: '#6b7280',
    textTertiary: '#9ca3af',
    textInverse: '#ffffff',

    // Borders
    border: '#e5e7eb',
    borderSecondary: '#d1d5db',

    // Semantic colors
    success: '#10b981',
    successLight: '#6ee7b7',
    error: '#ef4444',
    errorLight: '#fca5a5',
    warning: '#f59e0b',
    warningLight: '#fcd34d',
    info: '#3b82f6',
    infoLight: '#93c5fd',

    // Gradients
    gradientPrimary: ['#6366f1', '#ec4899'],
    gradientSecondary: ['#3b82f6', '#8b5cf6'],
    gradientSuccess: ['#10b981', '#059669'],

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',

    // Special
    skeleton: '#e5e7eb',
    skeletonHighlight: '#f3f4f6',
    divider: '#e5e7eb',

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

// Dark Theme Colors
export const darkColors = {
    // Primary palette
    primary: '#818cf8', // Lighter indigo for dark mode
    primaryLight: '#a5b4fc',
    primaryDark: '#6366f1',

    // Secondary palette
    secondary: '#f472b6', // Lighter pink for dark mode
    secondaryLight: '#f9a8d4',
    secondaryDark: '#ec4899',

    // Backgrounds
    background: '#0a0a0a',
    backgroundSecondary: '#141414',
    backgroundTertiary: '#1a1a1a',

    // Surfaces (cards, modals, etc.)
    surface: '#1a1a1a',
    surfaceSecondary: '#212121',
    surfaceElevated: '#2a2a2a',

    // Text
    textPrimary: '#f3f4f6',
    textSecondary: '#9ca3af',
    textTertiary: '#6b7280',
    textInverse: '#1a1a1a',

    // Borders
    border: '#2a2a2a',
    borderSecondary: '#333333',

    // Semantic colors
    success: '#34d399',
    successLight: '#6ee7b7',
    error: '#f87171',
    errorLight: '#fca5a5',
    warning: '#fbbf24',
    warningLight: '#fcd34d',
    info: '#60a5fa',
    infoLight: '#93c5fd',

    // Gradients
    gradientPrimary: ['#818cf8', '#f472b6'],
    gradientSecondary: ['#60a5fa', '#a78bfa'],
    gradientSuccess: ['#34d399', '#10b981'],

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',

    // Special
    skeleton: '#2a2a2a',
    skeletonHighlight: '#333333',
    divider: '#2a2a2a',

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.4)',
} as const;

// Elevation system (shadows)
export const elevation = {
    none: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
        elevation: 0,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },
} as const;

// Type exports for theme
export type ThemeColors = typeof lightColors | typeof darkColors;
export type ColorScheme = 'light' | 'dark';
