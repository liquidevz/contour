/**
 * Custom Animated Splash Screen
 * 
 * Beautiful splash screen with logo animation that displays on app startup
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    withSequence,
    withDelay,
    runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { typography } from '@/constants/tokens';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const { theme, colorScheme } = useTheme();

    // Animation values
    const logoScale = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const titleTranslateY = useSharedValue(30);
    const titleOpacity = useSharedValue(0);
    const containerOpacity = useSharedValue(1);

    useEffect(() => {
        // Logo animation sequence
        logoOpacity.value = withTiming(1, { duration: 400 });
        logoScale.value = withSequence(
            withSpring(1.2, { damping: 8, stiffness: 100 }),
            withSpring(1, { damping: 10, stiffness: 200 })
        );

        // Title animation (delayed)
        titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
        titleTranslateY.value = withDelay(300, withSpring(0, { damping: 12, stiffness: 100 }));

        // Fade out after delay
        containerOpacity.value = withDelay(
            1800,
            withTiming(0, { duration: 400 }, (finished) => {
                if (finished) {
                    runOnJS(onFinish)();
                }
            })
        );
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const titleAnimatedStyle = useAnimatedStyle(() => ({
        opacity: titleOpacity.value,
        transform: [{ translateY: titleTranslateY.value }],
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
            <LinearGradient
                colors={
                    colorScheme === 'dark'
                        ? ['#0a0a0a', '#1a1a1a', '#0a0a0a']
                        : ['#ffffff', '#f8f9fa', '#ffffff']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {/* Animated Logo */}
                    <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                        <LinearGradient
                            colors={theme.gradientPrimary as unknown as string[]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logoGradient}
                        >
                            <Ionicons name="people" size={64} color={theme.textInverse} />
                        </LinearGradient>
                    </Animated.View>

                    {/* Animated Title */}
                    <Animated.View style={titleAnimatedStyle}>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>
                            ContourZ
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Contact CRM
                        </Text>
                    </Animated.View>
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
    },
    gradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoGradient: {
        width: 120,
        height: 120,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: typography.fontWeight.bold,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
    },
});
