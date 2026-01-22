/**
 * Input Component - Uber Style (Fixed)
 * 
 * Clean text input with label ABOVE the field (no floating label)
 * This prevents text overlap issues
 */

import { layout, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface InputProps extends TextInputProps {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: keyof typeof Ionicons.glyphMap;
    rightIcon?: keyof typeof Ionicons.glyphMap;
    onRightIconPress?: () => void;
    containerStyle?: ViewStyle;
    variant?: 'default' | 'filled' | 'outline';
    size?: 'sm' | 'md' | 'lg';
}

export default function Input({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    variant = 'default',
    size = 'md',
    style,
    value,
    onFocus,
    onBlur,
    secureTextEntry,
    ...textInputProps
}: InputProps) {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [isSecure, setIsSecure] = useState(secureTextEntry);
    const inputRef = useRef<TextInput>(null);

    // Animation for border
    const focusAnim = useSharedValue(0);

    const handleFocus = (e: any) => {
        setIsFocused(true);
        focusAnim.value = withTiming(1, { duration: 200 });
        onFocus?.(e);
    };

    const handleBlur = (e: any) => {
        setIsFocused(false);
        focusAnim.value = withTiming(0, { duration: 200 });
        onBlur?.(e);
    };

    const borderAnimStyle = useAnimatedStyle(() => ({
        borderColor: error
            ? theme.error
            : (isFocused ? theme.textPrimary : theme.border),
    }));

    // Size configurations
    const sizeConfig = {
        sm: { height: 44, fontSize: typography.fontSize.sm, iconSize: 18 },
        md: { height: 52, fontSize: typography.fontSize.base, iconSize: 20 },
        lg: { height: 60, fontSize: typography.fontSize.lg, iconSize: 22 },
    };

    const currentSize = sizeConfig[size];

    // Variant styles
    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'filled':
                return {
                    backgroundColor: isFocused ? theme.surface : theme.backgroundSecondary,
                    borderWidth: 1.5,
                    borderColor: 'transparent',
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    borderWidth: 1.5,
                };
            default:
                return {
                    backgroundColor: theme.surface,
                    borderWidth: 1.5,
                };
        }
    };

    const { multiline } = textInputProps;

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
                    getVariantStyles(),
                    {
                        height: multiline ? 'auto' : currentSize.height,
                        minHeight: currentSize.height,
                        alignItems: multiline ? 'flex-start' : 'center',
                        paddingVertical: multiline ? spacing.sm : 0,
                    },
                    borderAnimStyle,
                ]}
            >
                {leftIcon && (
                    <Ionicons
                        name={leftIcon}
                        size={currentSize.iconSize}
                        color={isFocused ? theme.textPrimary : theme.textTertiary}
                        style={[styles.leftIcon, multiline && { marginTop: 4 }]}
                    />
                )}

                <TextInput
                    ref={inputRef}
                    style={[
                        styles.input,
                        {
                            color: theme.textPrimary,
                            fontSize: currentSize.fontSize,
                            textAlignVertical: multiline ? 'top' : 'center',
                        },
                        style,
                    ]}
                    placeholderTextColor={theme.textTertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    value={value}
                    secureTextEntry={isSecure}
                    selectionColor={theme.textPrimary}
                    {...textInputProps}
                />

                {secureTextEntry && (
                    <TouchableOpacity
                        onPress={() => setIsSecure(!isSecure)}
                        style={styles.rightIconButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={isSecure ? 'eye-outline' : 'eye-off-outline'}
                            size={currentSize.iconSize}
                            color={theme.textTertiary}
                        />
                    </TouchableOpacity>
                )}

                {rightIcon && !secureTextEntry && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        style={styles.rightIconButton}
                        disabled={!onRightIconPress}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <Ionicons
                            name={rightIcon}
                            size={currentSize.iconSize}
                            color={theme.textTertiary}
                        />
                    </TouchableOpacity>
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
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.xs,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: layout.inputBorderRadius,
        paddingHorizontal: spacing.md,
    },
    input: {
        flex: 1,
        height: '100%',
        fontWeight: typography.fontWeight.normal,
        ...Platform.select({
            web: { outlineStyle: 'none' as any },
        }),
    },
    leftIcon: {
        marginRight: spacing.sm,
    },
    rightIconButton: {
        marginLeft: spacing.sm,
        padding: spacing.xs,
    },
    helperText: {
        fontSize: typography.fontSize.xs,
        marginTop: spacing.xs,
        marginLeft: spacing.xs,
        fontWeight: typography.fontWeight.normal,
    },
});
