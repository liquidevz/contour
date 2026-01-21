/**
 * AnimatedFAB Component
 * 
 * Floating Action Button with entry animations and pulse effect
 */

import React, { useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withRepeat,
    withSequence,
    withDelay,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, elevation, borderRadius, typography } from '@/constants/tokens';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface AnimatedFABProps {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    label?: string;
    position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
    style?: ViewStyle;
}

export default function AnimatedFAB({
    icon,
    onPress,
    label,
    position = 'bottom-right',
    style,
}: AnimatedFABProps) {
    const { theme } = useTheme();
    const scale = useSharedValue(0);
    const pulseScale = useSharedValue(1);

    // Entry animation
    useEffect(() => {
        scale.value = withSpring(1, {
            damping: 12,
            stiffness: 200,
        });

        // Pulse animation after entry
        pulseScale.value = withDelay(
            500,
            withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1,
                true
            )
        );
    }, []);

    const entryAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const pulseAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseScale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.9, { damping: 10, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
    };

    const getPositionStyles = (): ViewStyle => {
        const base = {
            bottom: spacing.lg,
        };

        switch (position) {
            case 'bottom-left':
                return { ...base, left: spacing.lg };
            case 'bottom-center':
                return { ...base, left: '50%', transform: [{ translateX: -30 }] };
            default: // bottom-right
                return { ...base, right: spacing.lg };
        }
    };

    return (
        <Animated.View style={[styles.container, getPositionStyles(), entryAnimatedStyle, style]}>
            <Animated.View style={pulseAnimatedStyle}>
                <AnimatedTouchable
                    onPress={handlePress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    style={[
                        styles.fab,
                        {
                            backgroundColor: theme.primary,
                            ...elevation.lg,
                        },
                        label && styles.extended,
                    ]}
                    activeOpacity={0.9}
                >
                    <Ionicons name={icon} size={24} color={theme.textInverse} />
                    {label && (
                        <Text style={[styles.label, { color: theme.textInverse }]}>
                            {label}
                        </Text>
                    )}
                </AnimatedTouchable>
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    extended: {
        width: 'auto',
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
    },
    label: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
    },
});
