/**
 * Contact Card Component
 * 
 * WhatsApp-style contact list item with:
 * - Avatar with initials
 * - Name and phone
 * - Profile completion indicator
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface ContactCardProps {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    isCompletedProfile?: boolean;
    onPress: (id: string) => void;
}

/**
 * Get initials from name (max 2 characters)
 */
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Generate a consistent color based on name
 */
function getAvatarColor(name: string): string {
    const colors = [
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#14b8a6', // Teal
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
}

export default function ContactCard({
    id,
    name,
    phone,
    email,
    isCompletedProfile,
    onPress,
}: ContactCardProps) {
    return (
        <TouchableOpacity
            style={styles.container}
            onPress={() => onPress(id)}
            activeOpacity={0.7}
        >
            {/* Avatar */}
            <View style={[styles.avatar, { backgroundColor: getAvatarColor(name) }]}>
                <Text style={styles.avatarText}>{getInitials(name)}</Text>
            </View>

            {/* Info */}
            <View style={styles.info}>
                <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>
                        {name}
                    </Text>
                    {!isCompletedProfile && (
                        <View style={styles.incompleteBadge}>
                            <Text style={styles.incompleteBadgeText}>Incomplete</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.subtitle} numberOfLines={1}>
                    {phone || email || 'No contact info'}
                </Text>
            </View>

            {/* Chevron */}
            <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#1a1a1a',
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    info: {
        flex: 1,
        marginLeft: 12,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        flexShrink: 1,
    },
    incompleteBadge: {
        backgroundColor: '#f59e0b20',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    incompleteBadgeText: {
        color: '#f59e0b',
        fontSize: 10,
        fontWeight: '600',
    },
    subtitle: {
        fontSize: 14,
        color: '#888',
        marginTop: 2,
    },
    chevron: {
        fontSize: 24,
        color: '#666',
        marginLeft: 8,
    },
});
