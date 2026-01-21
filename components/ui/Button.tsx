/**
 * Button Component - Uber Style
 * 
 * Modern button with multiple variants, sizes, and micro-interactions
 * Clean black/white aesthetic with subtle animations
 */

import { elevation, layout, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextStyle,
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

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    iconPosition?: 'left' | 'right';
    fullWidth?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    haptic?: boolean;
}

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    style,
    textStyle: customTextStyle,
    haptic = true,
}: ButtonProps) {
    const { theme } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    const handlePress = () => {
        if (haptic && Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
    };

    // Size configurations
    const sizeStyles: Record<ButtonSize, {
        paddingVertical: number;
        paddingHorizontal: number;
        fontSize: number;
        iconSize: number;
        minHeight: number;
    }> = {
        xs: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm,
            fontSize: typography.fontSize.xs,
            iconSize: 14,
            minHeight: 28,
        },
        sm: {
            paddingVertical: spacing.xs + 2,
            paddingHorizontal: spacing.md,
            fontSize: typography.fontSize.sm,
            iconSize: 16,
            minHeight: 36,
        },
        md: {
            paddingVertical: spacing.sm + 2,
            paddingHorizontal: spacing.lg,
            fontSize: typography.fontSize.base,
            iconSize: 20,
            minHeight: 48,
        },
        lg: {
            paddingVertical: spacing.md,
            paddingHorizontal: spacing.xl,
            fontSize: typography.fontSize.lg,
            iconSize: 22,
            minHeight: 56,
        },
        xl: {
            paddingVertical: spacing.md + 4,
            paddingHorizontal: spacing.xl,
            fontSize: typography.fontSize.xl,
            iconSize: 24,
            minHeight: 64,
        },
    };

    const currentSize = sizeStyles[size];

    // Variant styles - Uber aesthetic
    const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
        const baseStyles = {
            container: {} as ViewStyle,
            text: {} as TextStyle,
        };

        switch (variant) {
            case 'primary':
                return {
                    container: {
                        backgroundColor: disabled ? theme.border : theme.textPrimary,
                        ...elevation.sm,
                    },
                    text: {
                        color: theme.textInverse,
                        fontWeight: typography.fontWeight.semibold,
                    },
                };
            case 'secondary':
                return {
                    container: {
                        backgroundColor: disabled ? theme.border : theme.backgroundSecondary,
                    },
                    text: {
                        color: disabled ? theme.textTertiary : theme.textPrimary,
                        fontWeight: typography.fontWeight.semibold,
                    },
                };
            case 'outline':
                return {
                    container: {
                        backgroundColor: 'transparent',
                        borderWidth: 1.5,
                        borderColor: disabled ? theme.border : theme.textPrimary,
                    },
                    text: {
                        color: disabled ? theme.textTertiary : theme.textPrimary,
                        fontWeight: typography.fontWeight.semibold,
                    },
                };
            case 'ghost':
                return {
                    container: {
                        backgroundColor: 'transparent',
                    },
                    text: {
                        color: disabled ? theme.textTertiary : theme.textPrimary,
                        fontWeight: typography.fontWeight.medium,
                    },
                };
            case 'destructive':
                return {
                    container: {
                        backgroundColor: disabled ? theme.border : theme.error,
                        ...elevation.sm,
                    },
                    text: {
                        color: '#FFFFFF',
                        fontWeight: typography.fontWeight.semibold,
                    },
                };
            default:
                return baseStyles;
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <AnimatedTouchable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={[
                styles.button,
                variantStyles.container,
                {
                    paddingVertical: currentSize.paddingVertical,
                    paddingHorizontal: currentSize.paddingHorizontal,
                    minHeight: currentSize.minHeight,
                    opacity: disabled ? 0.5 : 1,
                    width: fullWidth ? '100%' : undefined,
                },
                animatedStyle,
                style,
            ]}
            activeOpacity={0.85}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator
                        color={variantStyles.text.color}
                        size={currentSize.iconSize < 20 ? 'small' : 'small'}
                    />
                ) : (
                    <>
                        {icon && iconPosition === 'left' && (
                            <Ionicons
                                name={icon}
                                size={currentSize.iconSize}
                                color={variantStyles.text.color}
                                style={styles.iconLeft}
                            />
                        )}
                        <Text
                            style={[
                                styles.text,
                                variantStyles.text,
                                { fontSize: currentSize.fontSize },
                                customTextStyle,
                            ]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                        {icon && iconPosition === 'right' && (
                            <Ionicons
                                name={icon}
                                size={currentSize.iconSize}
                                color={variantStyles.text.color}
                                style={styles.iconRight}
                            />
                        )}
                    </>
                )}
            </View>
        </AnimatedTouchable>
    );
}

const styles = StyleSheet.create({
    button: {
        borderRadius: layout.buttonBorderRadius,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        textAlign: 'center',
        letterSpacing: typography.letterSpacing.wide,
    },
    iconLeft: {
        marginRight: spacing.sm,
    },
    iconRight: {
        marginLeft: spacing.sm,
    },
});
