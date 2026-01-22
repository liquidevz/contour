/**
 * Settings Screen - Uber Style
 * 
 * Clean grouped sections with modern toggles
 */

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const router = useRouter();
    const { theme, colorScheme, themeMode, setThemeMode } = useTheme();
    const insets = useSafeAreaInsets();
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
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme.headerBackground}
            />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: theme.headerBackground }]}>
                <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
            </View>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 40 }]}
            >
                {/* Appearance Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        APPEARANCE
                    </Text>
                    <Card elevated padding="none">
                        <View style={styles.themeContainer}>
                            {themeOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.themeOption,
                                        index !== themeOptions.length - 1 && {
                                            borderBottomWidth: 1,
                                            borderBottomColor: theme.border
                                        },
                                    ]}
                                    onPress={() => {
                                        if (Platform.OS !== 'web') {
                                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        }
                                        setThemeMode(option.value);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.themeOptionLeft}>
                                        <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundSecondary }]}>
                                            <Ionicons
                                                name={option.icon}
                                                size={20}
                                                color={themeMode === option.value ? theme.accent : theme.textSecondary}
                                            />
                                        </View>
                                        <Text
                                            style={[
                                                styles.themeLabel,
                                                {
                                                    color: theme.textPrimary,
                                                    fontWeight: themeMode === option.value
                                                        ? typography.fontWeight.semibold
                                                        : typography.fontWeight.normal,
                                                },
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </View>
                                    {themeMode === option.value && (
                                        <Ionicons
                                            name="checkmark"
                                            size={22}
                                            color={theme.accent}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </Card>
                </View>

                {/* About Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        ABOUT
                    </Text>
                    <Card elevated padding="none">
                        <View style={styles.aboutRow}>
                            <View style={styles.aboutLeft}>
                                <View style={[styles.iconWrapper, { backgroundColor: theme.backgroundSecondary }]}>
                                    <Ionicons name="information-circle-outline" size={20} color={theme.textSecondary} />
                                </View>
                                <Text style={[styles.aboutLabel, { color: theme.textPrimary }]}>Version</Text>
                            </View>
                            <Text style={[styles.aboutValue, { color: theme.textSecondary }]}>1.0.0</Text>
                        </View>
                    </Card>
                </View>

                {/* Account Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        ACCOUNT
                    </Text>
                    <Button
                        title="Sign Out"
                        onPress={handleSignOut}
                        variant="destructive"
                        loading={signingOut}
                        disabled={signingOut}
                        icon="log-out-outline"
                        fullWidth
                        size="lg"
                    />
                </View>

                {/* Footer */}
                <Text style={[styles.footer, { color: theme.textTertiary }]}>
                    Contour CRM{'\n'}
                    Made with care
                </Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    headerTitle: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.tight,
    },
    contentContainer: {
        padding: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.wider,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    themeContainer: {},
    themeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: spacing.md,
    },
    themeOptionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    iconWrapper: {
        width: 36,
        height: 36,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    themeLabel: {
        fontSize: typography.fontSize.base,
    },
    aboutRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
    },
    aboutLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    aboutLabel: {
        fontSize: typography.fontSize.base,
    },
    aboutValue: {
        fontSize: typography.fontSize.base,
    },
    footer: {
        fontSize: typography.fontSize.sm,
        textAlign: 'center',
        marginTop: spacing.xl,
        lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    },
});
