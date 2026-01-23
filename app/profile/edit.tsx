/**
 * Profile Edit Page
 * 
 * Form for editing user profile information
 */

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacing, typography } from '@/constants/tokens';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { checkProfileCompletion, createProfile, getProfile, markProfileComplete, updateProfile } from '@/lib/profile';
import { Profile } from '@/types/profile';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function ProfileEditPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [isPublic, setIsPublic] = useState(true);

    // Validation
    const [usernameError, setUsernameError] = useState('');
    const [displayNameError, setDisplayNameError] = useState('');

    useEffect(() => {
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await getProfile(user.id);

        if (!error && data) {
            setProfile(data);
            setUsername(data.username || '');
            setDisplayName(data.display_name || '');
            setBio(data.bio || '');
            setIsPublic(data.is_public);
        }
        setLoading(false);
    };

    const validateForm = (): boolean => {
        let valid = true;

        // Username validation
        if (username.trim() === '') {
            setUsernameError('Username is required');
            valid = false;
        } else if (username.length < 3) {
            setUsernameError('Username must be at least 3 characters');
            valid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            setUsernameError('Username can only contain letters, numbers, and underscores');
            valid = false;
        } else {
            setUsernameError('');
        }

        // Display name validation
        if (displayName.trim() === '') {
            setDisplayNameError('Display name is required');
            valid = false;
        } else {
            setDisplayNameError('');
        }

        return valid;
    };

    const handleSave = async () => {
        if (!validateForm() || !user) return;

        setSaving(true);

        const updates = {
            username: username.trim(),
            display_name: displayName.trim(),
            bio: bio.trim(),
            is_public: isPublic,
        };

        let currentProfile = profile;

        if (!currentProfile) {
            // Profile doesn't exist, create it first
            const { data: newProfile, error: createError } = await createProfile(user.id, {
                username: username.trim(),
                display_name: displayName.trim()
            });
            if (createError) {
                Alert.alert('Error', 'Failed to create profile: ' + createError.message);
                setSaving(false);
                return;
            }
            if (newProfile) {
                currentProfile = newProfile;
                setProfile(newProfile);
            }
        }

        const { data, error } = await updateProfile(user.id, updates);

        if (error) {
            Alert.alert('Error', error.message);
            setSaving(false);
            return;
        }

        // Check if profile is now complete
        if (data) {
            const completionStatus = checkProfileCompletion(data);
            if (completionStatus.isComplete && !data.is_complete) {
                await markProfileComplete(user.id);
            }
        }

        setSaving(false);
        Alert.alert('Success', 'Profile updated successfully!', [
            { text: 'OK', onPress: () => router.back() }
        ]);
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ScreenHeader
                    title="Edit Profile"
                    onBack={() => router.back()}
                    showAvatar={false}
                    showNotifications={false}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.accent} />
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Edit Profile"
                onBack={() => router.back()}
                showAvatar={false}
                showNotifications={false}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: insets.bottom + 40 }
                    ]}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Form Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                            PROFILE INFORMATION
                        </Text>

                        <View style={styles.form}>
                            <Input
                                label="Username"
                                value={username}
                                onChangeText={setUsername}
                                placeholder="Enter username"
                                autoCapitalize="none"
                                leftIcon="at"
                                error={usernameError}
                                size="lg"
                            />

                            <Input
                                label="Display Name"
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter display name"
                                leftIcon="person-outline"
                                error={displayNameError}
                                size="lg"
                            />

                            <Input
                                label="Bio"
                                value={bio}
                                onChangeText={setBio}
                                placeholder="Tell us about yourself"
                                multiline
                                numberOfLines={4}
                                leftIcon="document-text-outline"
                                size="lg"
                            />
                        </View>
                    </View>

                    {/* Privacy Section */}
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                            PRIVACY
                        </Text>

                        <Card elevated padding="md">
                            <View style={styles.switchRow}>
                                <View style={styles.switchLeft}>
                                    <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>
                                        Public Profile
                                    </Text>
                                    <Text style={[styles.switchDescription, { color: theme.textSecondary }]}>
                                        Allow others to view your profile
                                    </Text>
                                </View>
                                <Switch
                                    value={isPublic}
                                    onValueChange={setIsPublic}
                                    trackColor={{ false: theme.border, true: theme.accent }}
                                    thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                                />
                            </View>
                        </Card>
                    </View>

                    {/* Save Button */}
                    <Button
                        title="Save Changes"
                        onPress={handleSave}
                        loading={saving}
                        disabled={saving}
                        variant="primary"
                        size="xl"
                        fullWidth
                        icon="checkmark-outline"
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
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
    form: {
        gap: spacing.sm,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    switchLeft: {
        flex: 1,
        marginRight: spacing.md,
    },
    switchLabel: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        marginBottom: spacing.xs,
    },
    switchDescription: {
        fontSize: typography.fontSize.sm,
    },
});
