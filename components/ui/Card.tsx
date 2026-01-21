/**
 * Card Component
 * 
 * Interactive card with animations and theme support
 */

import React from 'react';
import {
    TouchableOpacity,
    View,
    StyleSheet,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius, elevation } from '@/constants/tokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface CardProps {
    children: React.ReactNode;
    onPress?: () => void;
    style?: ViewStyle;
    elevated?: boolean;
    gradient?: boolean;
    padding?: keyof typeof spacing;
}

export default function Card({
    children,
    onPress,
    style,
    elevated = true,
    gradient = false,
    padding = 'md',
}: CardProps) {
    const { theme } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (onPress) {
            scale.value = withSpring(0.98, { damping: 10, stiffness: 400 });
        }
    };

    const handlePressOut = () => {
        if (onPress) {
            scale.value = withSpring(1, { damping: 10, stiffness: 400 });
        }
    };

    const cardStyle: ViewStyle = {
        backgroundColor: elevated ? theme.surfaceElevated : theme.surface,
        padding: spacing[padding],
        borderRadius: borderRadius.lg,
        ...(elevated ? elevation.md : elevation.none),
    };

    if (gradient) {
        cardStyle.borderWidth = 1;
        cardStyle.borderColor = theme.primary + '30'; // 30 = opacity
    }

    const CardWrapper = onPress ? AnimatedTouchable : View;

    return (
        <CardWrapper
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!onPress}
            style={[cardStyle, onPress && animatedStyle, style]}
            activeOpacity={onPress ? 0.9 : 1}
        >
            {children}
        </CardWrapper>
    );
}

const styles = StyleSheet.create({});
