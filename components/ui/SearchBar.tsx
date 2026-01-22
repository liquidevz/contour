/**
 * SearchBar Component - Uber Style
 * 
 * Premium search input with animated focus states and clear functionality
 */

import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

interface SearchBarProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    onFocus?: () => void;
    onBlur?: () => void;
    onClear?: () => void;
    style?: ViewStyle;
    showMicIcon?: boolean;
    autoFocus?: boolean;
}

export default function SearchBar({
    value,
    onChangeText,
    placeholder = 'Search...',
    onFocus,
    onBlur,
    onClear,
    style,
    showMicIcon = false,
    autoFocus = false,
}: SearchBarProps) {
    const { theme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const focusAnim = useSharedValue(0);

    const handleFocus = () => {
        setIsFocused(true);
        focusAnim.value = withTiming(1, { duration: 200 });
        onFocus?.();
    };

    const handleBlur = () => {
        setIsFocused(false);
        focusAnim.value = withTiming(0, { duration: 200 });
        onBlur?.();
    };

    const handleClear = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onChangeText('');
        onClear?.();
        inputRef.current?.focus();
    };

    const containerAnimStyle = useAnimatedStyle(() => {
        const borderWidth = interpolate(focusAnim.value, [0, 1], [0, 1.5]);
        return {
            borderWidth,
            borderColor: theme.textPrimary,
        };
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.backgroundSecondary,
                },
                containerAnimStyle,
                style,
            ]}
        >
            <Ionicons
                name="search"
                size={20}
                color={isFocused ? theme.textPrimary : theme.textTertiary}
                style={styles.searchIcon}
            />

            <TextInput
                ref={inputRef}
                style={[
                    styles.input,
                    {
                        color: theme.textPrimary,
                    },
                ]}
                placeholder={placeholder}
                placeholderTextColor={theme.textTertiary}
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus}
                onBlur={handleBlur}
                autoFocus={autoFocus}
                returnKeyType="search"
                selectionColor={theme.textPrimary}
            />

            {value.length > 0 && (
                <TouchableOpacity
                    onPress={handleClear}
                    style={styles.clearButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <View style={[styles.clearIcon, { backgroundColor: theme.textTertiary }]}>
                        <Ionicons name="close" size={12} color={theme.surface} />
                    </View>
                </TouchableOpacity>
            )}

            {showMicIcon && value.length === 0 && (
                <TouchableOpacity
                    style={styles.micButton}
                    onPress={() => {
                        if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                    }}
                >
                    <Ionicons
                        name="mic"
                        size={20}
                        color={theme.textTertiary}
                    />
                </TouchableOpacity>
            )}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 48,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.md,
    },
    searchIcon: {
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        height: '100%',
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.normal,
        ...Platform.select({
            web: { outlineStyle: 'none' as any },
        }),
    },
    clearButton: {
        marginLeft: spacing.sm,
    },
    clearIcon: {
        width: 18,
        height: 18,
        borderRadius: 9,
        alignItems: 'center',
        justifyContent: 'center',
    },
    micButton: {
        marginLeft: spacing.sm,
        paddingLeft: spacing.sm,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(0,0,0,0.1)',
    },
});
