/**
 * Settings Screen
 * 
 * Revamped to match the new design system:
 * - Red Gradient Header
 * - Consistent Card styling
 */

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { borderRadius, spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

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
            <StatusBar barStyle="light-content" backgroundColor="#FF4B2B" />

            {/* Header */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#FF416C', '#FF4B2B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.headerBackground}
                />
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.topBar}>
                        <Text style={styles.headerTitle}>Settings</Text>
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
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
                                            backgroundColor: themeMode === option.value ? theme.primary + '10' : 'transparent',
                                            borderColor: themeMode === option.value ? theme.primary : theme.border,
                                            borderWidth: 1,
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
                                                fontWeight: themeMode === option.value ? '700' : '500'
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
                                <Ionicons name="information-circle-outline" size={24} color={theme.primary} />
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
    },
    headerContainer: {
        width: '100%',
        paddingBottom: spacing.lg,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        overflow: 'hidden',
        backgroundColor: '#FF4B2B',
        shadowColor: '#FF4B2B',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 5,
        zIndex: 10,
    },
    headerBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    safeArea: {
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        paddingHorizontal: spacing.md,
    },
    topBar: {
        marginBottom: spacing.sm,
        marginTop: spacing.sm,
        height: 48,
        justifyContent: 'center'
    },
    headerTitle: {
        fontSize: 34,
        fontWeight: 'bold',
        color: '#fff',
    },
    contentContainer: {
        padding: spacing.lg,
        paddingTop: spacing.lg + 20,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
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
        gap: spacing.md,
    },
    themeLabel: {
        fontSize: 16,
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
        gap: spacing.md,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
    },
    value: {
        fontSize: 16,
    },
    footer: {
        fontSize: 12,
        textAlign: 'center',
        marginBottom: spacing.xxl,
        lineHeight: 18,
    },
});
