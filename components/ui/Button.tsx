/**
 * Button Component
 * 
 * Universal button with multiple variants, sizes, and animations
 */

import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
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
    withSpring
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

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
}: ButtonProps) {
    const { theme } = useTheme();
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.95, { damping: 10, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 400 });
    };

    // Size styles
    const sizeStyles: Record<ButtonSize, { padding: number; fontSize: number; iconSize: number }> = {
        sm: { padding: spacing.sm, fontSize: typography.fontSize.sm, iconSize: 16 },
        md: { padding: spacing.md, fontSize: typography.fontSize.base, iconSize: 20 },
        lg: { padding: spacing.lg, fontSize: typography.fontSize.lg, iconSize: 24 },
    };

    const currentSize = sizeStyles[size];

    // Variant styles
    const getVariantStyles = (): { container: ViewStyle; text: TextStyle } => {
        switch (variant) {
            case 'primary':
                return {
                    container: {
                        backgroundColor: disabled ? theme.border : theme.primary,
                    },
                    text: { color: theme.textInverse },
                };
            case 'secondary':
                return {
                    container: {
                        backgroundColor: disabled ? theme.border : theme.secondary,
                    },
                    text: { color: theme.textInverse },
                };
            case 'outline':
                return {
                    container: {
                        backgroundColor: 'transparent',
                        borderWidth: 1,
                        borderColor: disabled ? theme.border : theme.primary,
                    },
                    text: { color: disabled ? theme.textTertiary : theme.primary },
                };
            case 'ghost':
                return {
                    container: {
                        backgroundColor: 'transparent',
                    },
                    text: { color: disabled ? theme.textTertiary : theme.primary },
                };
            case 'destructive':
                return {
                    container: {
                        backgroundColor: disabled ? theme.border : theme.error,
                    },
                    text: { color: theme.textInverse },
                };
        }
    };

    const variantStyles = getVariantStyles();

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            style={[
                styles.button,
                variantStyles.container,
                {
                    paddingVertical: currentSize.padding * 0.75,
                    paddingHorizontal: currentSize.padding * 1.5,
                    opacity: disabled ? 0.5 : 1,
                    width: fullWidth ? '100%' : 'auto',
                },
                animatedStyle,
                style,
            ]}
            activeOpacity={0.8}
        >
            <View style={styles.content}>
                {loading ? (
                    <ActivityIndicator color={variantStyles.text.color} size="small" />
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
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontWeight: typography.fontWeight.semibold,
    },
    iconLeft: {
        marginRight: spacing.sm,
    },
    iconRight: {
        marginLeft: spacing.sm,
    },
});
