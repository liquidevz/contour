/**
 * SkeletonLoader Component
 * 
 * Animated skeleton loader with shimmer effect
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { borderRadius } from '@/constants/tokens';

type SkeletonShape = 'text' | 'circle' | 'rectangle';

interface SkeletonLoaderProps {
    shape?: SkeletonShape;
    width?: DimensionValue;
    height?: number;
    style?: ViewStyle;
}

export default function SkeletonLoader({
    shape = 'text',
    width = '100%',
    height = 16,
    style,
}: SkeletonLoaderProps) {
    const { theme } = useTheme();
    const shimmerTranslate = useSharedValue(-1);

    useEffect(() => {
        shimmerTranslate.value = withRepeat(
            withTiming(1, { duration: 1500 }),
            -1,
            false
        );
    }, []);

    const shimmerAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            shimmerTranslate.value,
            [-1, 1],
            [-300, 300]
        );

        return {
            transform: [{ translateX }],
        };
    });

    const getShapeStyles = (): ViewStyle => {
        switch (shape) {
            case 'circle':
                return {
                    width: height,
                    height: height,
                    borderRadius: height / 2,
                };
            case 'rectangle':
                return {
                    width,
                    height,
                    borderRadius: borderRadius.md,
                };
            default: // text
                return {
                    width,
                    height,
                    borderRadius: borderRadius.sm,
                };
        }
    };

    return (
        <View
            style={[
                styles.skeleton,
                getShapeStyles(),
                { backgroundColor: theme.skeleton },
                style,
            ]}
        >
            <Animated.View style={[styles.shimmerContainer, shimmerAnimatedStyle]}>
                <LinearGradient
                    colors={[
                        'transparent',
                        theme.skeletonHighlight,
                        'transparent',
                    ]}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
                    style={styles.shimmer}
                />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    skeleton: {
        overflow: 'hidden',
    },
    shimmerContainer: {
        width: '100%',
        height: '100%',
    },
    shimmer: {
        width: 300,
        height: '100%',
    },
});
