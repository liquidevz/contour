import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { Tag } from '@/types/profile';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface TagChipProps {
    tag: Tag;
    onRemove?: () => void;
    removing?: boolean;
}

export default function TagChip({ tag, onRemove, removing }: TagChipProps) {
    const { theme } = useTheme();

    return (
        <View style={[styles.container, {
            backgroundColor: theme.cardBackground,
            borderColor: theme.border,
            opacity: removing ? 0.5 : 1
        }]}>
            <Text style={[styles.text, { color: theme.textPrimary }]}>
                {tag.name}
            </Text>
            {onRemove && (
                <TouchableOpacity
                    onPress={onRemove}
                    style={styles.removeButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    disabled={removing}
                >
                    <Ionicons
                        name="close-circle"
                        size={16}
                        color={theme.textSecondary}
                    />
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.xs,
        paddingHorizontal: spacing.sm,
        borderRadius: borderRadius.full,
        borderWidth: 1,
        marginRight: spacing.xs,
        marginBottom: spacing.xs,
    },
    text: {
        fontSize: typography.fontSize.sm,
        marginRight: spacing.xs,
    },
    removeButton: {
        marginLeft: 2,
    }
});
