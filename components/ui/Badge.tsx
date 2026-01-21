/**
 * Badge Component
 * 
 * Tag/status badge with variants and removable option
 */

import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline' | string;

interface BadgeProps {
    label: string;
    variant?: BadgeVariant;
    onRemove?: () => void;
    onPress?: () => void;
    style?: ViewStyle;
    textStyle?: any; // Allow custom text style override
}

export default function Badge({
    label,
    variant = 'default',
    onRemove,
    onPress,
    style,
    textStyle,
}: BadgeProps) {
    const { theme } = useTheme();

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: theme.primary + '20',
                    color: theme.primary,
                };
            case 'success':
                return {
                    backgroundColor: theme.success + '20',
                    color: theme.success,
                };
            case 'warning':
                return {
                    backgroundColor: theme.warning + '20',
                    color: theme.warning,
                };
            case 'error':
                return {
                    backgroundColor: theme.error + '20',
                    color: theme.error,
                };
            case 'outline':
                return {
                    backgroundColor: 'transparent',
                    color: theme.textSecondary,
                    borderWidth: 1,
                    borderColor: theme.border,
                };
            default:
                return {
                    backgroundColor: theme.surfaceSecondary,
                    color: theme.textSecondary,
                };
        }
    };

    const variantStyles = getVariantStyles();

    const content = (
        <View
            style={[
                styles.badge,
                { backgroundColor: variantStyles.backgroundColor },
                // @ts-ignore
                variant === 'outline' && { borderWidth: 1, borderColor: theme.border },
                style,
            ]}
        >
            <Text
                style={[
                    styles.label,
                    { color: variantStyles.color },
                    textStyle,
                ]}
            >
                {label}
            </Text>
            {onRemove && (
                <TouchableOpacity onPress={onRemove} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close-circle" size={14} color={variantStyles.color} />
                </TouchableOpacity>
            )}
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
        gap: spacing.xs,
    },
    label: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
    },
});
