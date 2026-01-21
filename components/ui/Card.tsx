/**
 * Card Component - Uber Style
 * 
 * Clean, minimal card with subtle shadows and smooth interactions
 */

import { borderRadius, elevation, spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    elevated?: boolean;
    variant?: 'default' | 'outlined' | 'ghost';
    padding?: keyof typeof spacing | 'none';
    borderRadiusSize?: keyof typeof borderRadius;
}

export default function Card({
    children,
    onPress,
    style,
    elevated = true,
    variant = 'default',
    padding = 'md',
    borderRadiusSize = 'xl',
}: CardProps) {
    const { theme } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (onPress) {
            scale.value = withSpring(0.98, { damping: 15, stiffness: 400 });
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        }
    };

    // Variant styles
    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'outlined':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: theme.border,
                };
            case 'ghost':
                return {
                    backgroundColor: 'transparent',
                };
            default:
                return {
                    backgroundColor: theme.cardBackground,
                };
        }
    };

    const cardStyle: ViewStyle = {
        ...getVariantStyles(),
        padding: padding === 'none' ? 0 : spacing[padding],
        borderRadius: borderRadius[borderRadiusSize],
        ...(elevated && variant === 'default' ? elevation.md : elevation.none),
    };

    const CardWrapper = onPress ? AnimatedTouchable : View;

    return (
        <CardWrapper
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!onPress}
            style={[cardStyle, onPress && animatedStyle, style]}
            activeOpacity={onPress ? 0.95 : 1}
        >
            {children}
        </CardWrapper>
    );
}

const styles = StyleSheet.create({});
