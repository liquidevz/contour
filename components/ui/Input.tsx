/**
 * Input Component
 * 
 * Themed text input with animations, validation states, and icons
 */

import React, { useState } from 'react';
import {
    TextInput,
    View,
    Text,
    StyleSheet,
    TextInputProps,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, borderRadius, typography } from '@/constants/tokens';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    containerStyle?: ViewStyle;
}

export default function Input({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    containerStyle,
    style,
    ...textInputProps
}: InputProps) {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const borderColor = useSharedValue(theme.border);

    const animatedBorderStyle = useAnimatedStyle(() => ({
        borderColor: borderColor.value,
    }));

    const handleFocus = () => {
        setIsFocused(true);
        borderColor.value = withTiming(theme.primary as any, { duration: 200 });
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (error) {
            borderColor.value = withTiming(theme.error as any, { duration: 200 });
        } else {
            borderColor.value = withTiming(theme.border as any, { duration: 200 });
        }
    };

    // Set border color on error
    React.useEffect(() => {
        if (error && !isFocused) {
            borderColor.value = withTiming(theme.error as any, { duration: 200 });
        } else if (!isFocused) {
            borderColor.value = withTiming(theme.border as any, { duration: 200 });
        }
    }, [error, isFocused]);

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <Text style={[styles.label, { color: theme.textSecondary }]}>
                    {label}
                </Text>
            )}
            <Animated.View
                style={[
                    styles.inputContainer,
                    {
                        backgroundColor: theme.surface,
                        borderWidth: 2,
                    },
                    animatedBorderStyle,
                ]}
            >
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={20}
                        color={theme.textTertiary}
                        style={styles.leftIcon}
                    />
                )}
                <TextInput
                    style={[
                        styles.input,
                        {
                            color: theme.textPrimary,
                            flex: 1,
                        },
                        style,
                    ]}
                    placeholderTextColor={theme.textTertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...textInputProps}
                />
                {rightIcon && (
                    <Ionicons
                        name={rightIcon}
                        size={20}
                        color={theme.textTertiary}
                        style={styles.rightIcon}
                    />
                )}
            </Animated.View>
            {(error || helperText) && (
                <Text
                    style={[
                        styles.helperText,
                        { color: error ? theme.error : theme.textTertiary },
                    ]}
                >
                    {error || helperText}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.md,
    },
    input: {
        paddingVertical: spacing.md,
        fontSize: typography.fontSize.base,
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIcon: {
        marginLeft: spacing.sm,
    },
    helperText: {
        fontSize: typography.fontSize.xs,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
    },
});
