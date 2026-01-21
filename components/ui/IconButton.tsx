/**
 * IconButton Component
 * 
 * Animated icon-only button with haptic feedback
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius } from '@/constants/tokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type IconButtonSize = 'sm' | 'md' | 'lg';
type IconButtonVariant = 'default' | 'primary' | 'destructive' | 'ghost';

interface IconButtonProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    size?: IconButtonSize;
    variant?: IconButtonVariant;
    color?: string; // Added color prop
    disabled?: boolean;
    style?: ViewStyle;
}

export default function IconButton({
    icon,
    onPress,
    size = 'md',
    variant = 'default',
    color,
    disabled = false,
    style,
}: IconButtonProps) {
    const { theme } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.9, { damping: 10, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const sizeStyles: Record<IconButtonSize, { buttonSize: number; iconSize: number }> = {
        sm: { buttonSize: 32, iconSize: 18 },
        md: { buttonSize: 40, iconSize: 22 },
        lg: { buttonSize: 48, iconSize: 26 },
    };

    const currentSize = sizeStyles[size];

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: theme.primary + '20',
                    iconColor: theme.primary,
                };
            case 'destructive':
                return {
                    backgroundColor: theme.error + '20',
                    iconColor: theme.error,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                    iconColor: theme.textPrimary,
                };
            default:
                return {
                    backgroundColor: theme.surfaceSecondary,
                    iconColor: theme.textPrimary,
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <AnimatedTouchable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[
                styles.button,
                {
                    width: currentSize.buttonSize,
                    height: currentSize.buttonSize,
                    backgroundColor: variantStyles.backgroundColor,
                    opacity: disabled ? 0.5 : 1,
                },
                animatedStyle,
                style,
            ]}
            activeOpacity={0.8}
        >
            <Ionicons
                name={icon}
                size={currentSize.iconSize}
                color={color || variantStyles.iconColor}
            />
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: borderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
