/**
 * Avatar Component
 * 
 * User avatar with gradient background and sizes
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/tokens';

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
    name: string;
    size?: AvatarSize;
    style?: ViewStyle;
}

export default function Avatar({ name, size = 'md', style }: AvatarProps) {
    const { theme } = useTheme();

    const sizeStyles: Record<AvatarSize, { dimension: number; fontSize: number }> = {
        sm: { dimension: 32, fontSize: typography.fontSize.sm },
        md: { dimension: 40, fontSize: typography.fontSize.base },
        lg: { dimension: 56, fontSize: typography.fontSize.lg },
        xl: { dimension: 80, fontSize: typography.fontSize['2xl'] },
    };

    const currentSize = sizeStyles[size];
    const initial = name ? name[0].toUpperCase() : '?';

    return (
        <LinearGradient
            colors={theme.gradientPrimary as unknown as string[]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
                styles.avatar,
                {
                    width: currentSize.dimension,
                    height: currentSize.dimension,
                    borderRadius: currentSize.dimension / 2,
                },
                style,
            ]}
        >
            <Text
                style={[
                    styles.text,
                    {
                        fontSize: currentSize.fontSize,
                        color: theme.textInverse,
                    },
                ]}
            >
                {initial}
            </Text>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontWeight: typography.fontWeight.bold,
    },
});
