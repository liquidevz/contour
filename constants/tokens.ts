/**
 * Design Tokens - Uber-Style Design System
 * 
 * Modern, minimal design tokens with:
 * - Uber-style black/white palette for light theme
 * - Uber black palette for dark theme
 * - No gradients - clean, professional aesthetic
 */

import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Responsive scaling utilities
const baseWidth = 375; // iPhone design base
const baseHeight = 812;

export const wp = (widthPercent: number) => {
    const elemWidth = typeof widthPercent === 'number' ? widthPercent : parseFloat(widthPercent);
    return PixelRatio.roundToNearestPixel((SCREEN_WIDTH * elemWidth) / 100);
};

export const hp = (heightPercent: number) => {
    const elemHeight = typeof heightPercent === 'number' ? heightPercent : parseFloat(heightPercent);
    return PixelRatio.roundToNearestPixel((SCREEN_HEIGHT * elemHeight) / 100);
};

export const normalize = (size: number) => {
    const scale = SCREEN_WIDTH / baseWidth;
    const newSize = size * scale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

// Spacing scale (4, 8, 12, 16, 24, 32, 48)
export const spacing = {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
} as const;

// Modern border radius scale
export const borderRadius = {
    none: 0,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
    full: 9999,
} as const;

// Typography - Inter/SF Pro style
export const typography = {
    fontSize: {
        xxs: 10,
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
        '5xl': 48,
    },
    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },
    lineHeight: {
        tight: 1.2,
        snug: 1.375,
        normal: 1.5,
        relaxed: 1.625,
        loose: 2,
    },
    letterSpacing: {
        tighter: -0.5,
        tight: -0.25,
        normal: 0,
        wide: 0.25,
        wider: 0.5,
    },
} as const;

// Animation durations
export const animations = {
    duration: {
        instant: 100,
        fast: 150,
        normal: 250,
        slow: 350,
        slower: 500,
    },
    easing: {
        default: 'ease-in-out' as const,
        in: 'ease-in' as const,
        out: 'ease-out' as const,
    },
} as const;

/**
 * UBER-STYLE LIGHT THEME
 * Clean black & white aesthetic with minimal accents
 */
export const lightColors = {
    // Primary - Uber Black
    primary: '#000000',
    primaryLight: '#333333',
    primaryDark: '#000000',

    // Secondary - Subtle gray accent
    secondary: '#545454',
    secondaryLight: '#757575',
    secondaryDark: '#333333',

    // Accent - Uber green for success/CTA
    accent: '#09B83E',
    accentLight: '#34D058',
    accentDark: '#078C2C',

    // Backgrounds - Pure whites and subtle grays
    background: '#FFFFFF',
    backgroundSecondary: '#F6F6F6',
    backgroundTertiary: '#EEEEEE',

    // Surfaces (cards, modals)
    surface: '#FFFFFF',
    surfaceSecondary: '#FAFAFA',
    surfaceElevated: '#FFFFFF',

    // Text - High contrast blacks
    textPrimary: '#000000',
    textSecondary: '#545454',
    textTertiary: '#8E8E93',
    textInverse: '#FFFFFF',
    textMuted: '#B3B3B3',

    // Borders - Subtle grays
    border: '#E5E5E5',
    borderSecondary: '#D1D1D1',
    borderLight: '#F0F0F0',

    // Semantic colors
    success: '#09B83E',
    successLight: '#E8F9ED',
    error: '#E11900',
    errorLight: '#FDEBE8',
    warning: '#FF9500',
    warningLight: '#FFF4E6',
    info: '#007AFF',
    infoLight: '#E6F2FF',

    // App-specific
    cardBackground: '#FFFFFF',
    headerBackground: '#FFFFFF',
    tabBarBackground: '#FFFFFF',

    // No gradients - solid colors
    gradientPrimary: ['#000000', '#000000'],
    gradientSecondary: ['#333333', '#333333'],
    gradientSuccess: ['#09B83E', '#09B83E'],

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.2)',
    overlayDark: 'rgba(0, 0, 0, 0.75)',

    // Special
    skeleton: '#E8E8E8',
    skeletonHighlight: '#F5F5F5',
    divider: '#E5E5E5',

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.08)',
    shadowMedium: 'rgba(0, 0, 0, 0.12)',
    shadowDark: 'rgba(0, 0, 0, 0.16)',
} as const;

/**
 * UBER-STYLE DARK THEME
 * Deep black with subtle gray accents
 */
export const darkColors = {
    // Primary - White on black
    primary: '#FFFFFF',
    primaryLight: '#F5F5F5',
    primaryDark: '#E0E0E0',

    // Secondary
    secondary: '#A3A3A3',
    secondaryLight: '#B8B8B8',
    secondaryDark: '#8E8E8E',

    // Accent - Uber green
    accent: '#34D058',
    accentLight: '#4AE96E',
    accentDark: '#09B83E',

    // Backgrounds - Uber deep blacks
    background: '#000000',
    backgroundSecondary: '#0D0D0D',
    backgroundTertiary: '#1A1A1A',

    // Surfaces
    surface: '#141414',
    surfaceSecondary: '#1C1C1E',
    surfaceElevated: '#2C2C2E',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textTertiary: '#6B6B6B',
    textInverse: '#000000',
    textMuted: '#4A4A4A',

    // Borders
    border: '#2C2C2E',
    borderSecondary: '#3A3A3C',
    borderLight: '#1C1C1E',

    // Semantic colors
    success: '#34D058',
    successLight: '#1A3D2A',
    error: '#FF453A',
    errorLight: '#3D1F1E',
    warning: '#FFD60A',
    warningLight: '#3D3519',
    info: '#0A84FF',
    infoLight: '#1A2F4A',

    // App-specific
    cardBackground: '#141414',
    headerBackground: '#000000',
    tabBarBackground: '#000000',

    // Solid colors (no gradients)
    gradientPrimary: ['#FFFFFF', '#FFFFFF'],
    gradientSecondary: ['#E0E0E0', '#E0E0E0'],
    gradientSuccess: ['#34D058', '#34D058'],

    // Overlays
    overlay: 'rgba(0, 0, 0, 0.7)',
    overlayLight: 'rgba(0, 0, 0, 0.4)',
    overlayDark: 'rgba(0, 0, 0, 0.85)',

    // Special
    skeleton: '#2C2C2E',
    skeletonHighlight: '#3A3A3C',
    divider: '#2C2C2E',

    // Shadows
    shadow: 'rgba(0, 0, 0, 0.3)',
    shadowMedium: 'rgba(0, 0, 0, 0.4)',
    shadowDark: 'rgba(0, 0, 0, 0.5)',
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
    xs: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 2,
        elevation: 1,
    },
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    xl: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.16,
        shadowRadius: 24,
        elevation: 12,
    },
} as const;

// Glassmorphism tokens (for modals/sheets)
export const glass = {
    blur: Platform.select({
        ios: 20,
        android: 10,
    }),
    opacity: 0.85,
    borderOpacity: 0.1,
} as const;

// Layout constants
export const layout = {
    headerHeight: Platform.select({ ios: 44, android: 56 }) ?? 56,
    tabBarHeight: Platform.select({ ios: 83, android: 65 }) ?? 65,
    cardBorderRadius: borderRadius.xl,
    buttonBorderRadius: borderRadius.lg,
    inputBorderRadius: borderRadius.md,
} as const;

// Type exports
export type ThemeColors = typeof lightColors | typeof darkColors;
export type ColorScheme = 'light' | 'dark';
