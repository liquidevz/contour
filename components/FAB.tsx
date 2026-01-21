/**
 * Floating Action Button Component
 * 
 * Positioned at bottom-right of screen
 * Used for primary actions like adding new items
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';

interface FABProps {
    onPress: () => void;
    icon?: string;
    style?: ViewStyle;
}

export default function FAB({ onPress, icon = '+', style }: FABProps) {
    return (
        <TouchableOpacity
            style={[styles.fab, style]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={styles.icon}>{icon}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    icon: {
        color: '#fff',
        fontSize: 28,
        fontWeight: '300',
        marginTop: -2,
    },
});
