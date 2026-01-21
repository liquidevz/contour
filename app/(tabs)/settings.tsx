/**
 * Settings Screen
 * 
 * App settings with:
 * - Theme toggle (Light/Dark/System)
 * - App information
 * - Sign out functionality
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { spacing, typography, borderRadius } from '@/constants/tokens';

export default function SettingsScreen() {
    const router = useRouter();
    const { theme, themeMode, setThemeMode } = useTheme();
    const [signingOut, setSigningOut] = useState(false);

    const handleSignOut = async () => {
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out',
                style: 'destructive',
                onPress: async () => {
                    setSigningOut(true);
                    const { error } = await supabase.auth.signOut();
                    if (error) {
                        Alert.alert('Error', error.message);
                        setSigningOut(false);
                    } else {
                        router.replace('/(auth)/login');
                    }
                },
            },
        ]);
    };

    const themeOptions: Array<{ value: 'light' | 'dark' | 'system'; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
        { value: 'light', label: 'Light', icon: 'sunny' },
        { value: 'dark', label: 'Dark', icon: 'moon' },
        { value: 'system', label: 'System', icon: 'phone-portrait' },
    ];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Theme Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        Appearance
                    </Text>
                    <Card elevated padding="md">
                        <View style={styles.themeContainer}>
                            {themeOptions.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.themeOption,
                                        {
                                            backgroundColor: themeMode === option.value ? theme.primary + '20' : theme.backgroundSecondary,
                                            borderColor: themeMode === option.value ? theme.primary : 'transparent',
                                        },
                                    ]}
                                    onPress={() => setThemeMode(option.value)}
                                >
                                    <Ionicons
                                        name={option.icon}
                                        size={24}
                                        color={themeMode === option.value ? theme.primary : theme.textSecondary}
                                    />
                                    <Text
                                        style={[
                                            styles.themeLabel,
                                            {
                                                color: themeMode === option.value ? theme.primary : theme.textSecondary,
                                            },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {themeMode === option.value && (
                                        <Ionicons
                                            name="checkmark-circle"
                                            size={20}
                                            color={theme.primary}
                                            style={styles.checkmark}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>
                </View>

                {/* App Info Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                        About
                    </Text>
                    <Card elevated padding="md">
                        <View style={styles.row}>
                            <View style={styles.rowLeft}>
                                <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
                                <Text style={[styles.label, { color: theme.textPrimary }]}>Version</Text>
                            </View>
                            <Text style={[styles.value, { color: theme.textSecondary }]}>1.0.0</Text>
                        </View>
                    </Card>
                </View>

                {/* Sign Out Button */}
                <View style={styles.section}>
                    <Button
                        title="Sign Out"
                        onPress={handleSignOut}
                        variant="destructive"
                        loading={signingOut}
                        disabled={signingOut}
                        icon="log-out-outline"
                        fullWidth
                    />
                </View>

                {/* Footer */}
                <Text style={[styles.footer, { color: theme.textTertiary }]}>
                    ContourZ Contact CRM {'\n'}
                    Made with ❤️
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.md,
    },
    themeContainer: {
        gap: spacing.sm,
    },
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: borderRadius.md,
        borderWidth: 2,
        gap: spacing.md,
    },
    themeLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        flex: 1,
    },
    checkmark: {
        marginLeft: 'auto',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    label: {
        fontSize: typography.fontSize.base,
    },
    value: {
        fontSize: typography.fontSize.base,
    },
    footer: {
        fontSize: typography.fontSize.sm,
        textAlign: 'center',
        marginTop: spacing.xl,
        marginBottom: spacing.xxl,
    },
});
