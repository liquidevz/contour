import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { checkProfileCompletion, getProfile } from '@/lib/profile';
import { attachTagToProfile, removeTagFromProfile } from '@/lib/tags';
import { Profile, ProfileTag, Tag } from '@/types/profile';

import ProfileTagsSection from '@/components/profile/ProfileTagsSection';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ScreenHeader from '@/components/ui/ScreenHeader';
import ScreenScrollView from '@/components/ui/ScreenScrollView';

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { theme, colorScheme } = useTheme();
    const insets = useSafeAreaInsets();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, [user]);

    const loadProfile = async () => {
        if (!user) return;

        setLoading(true);
        const { data, error } = await getProfile(user.id);

        if (!error && data) {
            setProfile(data);
        }
        setLoading(false);
    };

    const handleAddTag = async (tag: Tag) => {
        if (!profile || !user) return;

        // Verify if tag is already added (double safety)
        if (profile.tags?.some(t => t.tag_id === tag.id)) {
            return;
        }

        // Optimistic Update
        const optimisticProfileTag: ProfileTag = {
            id: 'temp-' + Math.random(), // Temp ID
            tag_id: tag.id,
            profile_id: user.id,
            tag: tag
        };

        const prevProfile = { ...profile };
        setProfile(p => p ? {
            ...p,
            tags: [...(p.tags || []), optimisticProfileTag]
        } : null);

        const { data, error } = await attachTagToProfile(user.id, tag.id);

        if (error || !data) {
            // Revert
            setProfile(prevProfile);
            Alert.alert('Error', 'Failed to add tag');
        } else {
            // Update with real ID
            setProfile(p => p ? {
                ...p,
                tags: (p.tags || []).map(t => t.id === optimisticProfileTag.id ? data : t)
            } : null);
        }
    };

    const handleRemoveTag = async (tag: Tag) => {
        if (!profile) return;

        const profileTag = profile.tags?.find(t => t.tag_id === tag.id);
        if (!profileTag) return;

        // Optimistic Update
        const prevProfile = { ...profile };
        setProfile(p => p ? {
            ...p,
            tags: (p.tags || []).filter(t => t.tag_id !== tag.id)
        } : null);

        const { error } = await removeTagFromProfile(profileTag.id);

        if (error) {
            // Revert
            setProfile(prevProfile);
            Alert.alert('Error', 'Failed to remove tag');
        }
    };



    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <ScreenHeader
                    title="Profile"
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

    const completionStatus = checkProfileCompletion(profile);

    // Derived state for UI
    const offers = profile?.tags?.filter(t => t.tag.tag_type === 'offer').map(t => t.tag) || [];
    const wants = profile?.tags?.filter(t => t.tag.tag_type === 'want').map(t => t.tag) || [];

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <ScreenHeader
                title="Profile"
                onBack={() => router.back()}
                showAvatar={false}
                showNotifications={false}
                actionIcon="create-outline"
                onAction={() => router.push('/profile/edit')}
            />

            <ScreenScrollView
                contentContainerStyle={styles.scrollContent}
                bottomPadding={40}
            >
                {/* Header Section */}
                <View style={styles.header}>
                    <Avatar
                        name={profile?.display_name || profile?.username || user?.email || 'User'}
                        size="xl"
                        style={styles.avatar}
                    />

                    <Text style={[styles.displayName, { color: theme.textPrimary }]}>
                        {profile?.display_name || 'Add Display Name'}
                    </Text>

                    {profile?.username && (
                        <Text style={[styles.username, { color: theme.textSecondary }]}>
                            @{profile.username}
                        </Text>
                    )}

                    {/* Completion Progress */}
                    {!completionStatus.isComplete && (
                        <View style={styles.completionContainer}>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        {
                                            backgroundColor: theme.accent,
                                            width: `${completionStatus.completionPercentage}%`,
                                        }
                                    ]}
                                />
                            </View>
                            <Text style={[styles.completionText, { color: theme.textSecondary }]}>
                                {completionStatus.completionPercentage}% completed
                            </Text>
                        </View>
                    )}
                </View>

                {/* Offers & Wants Sections */}
                <ProfileTagsSection
                    type="offer"
                    tags={offers}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                />

                <ProfileTagsSection
                    type="want"
                    tags={wants}
                    onAddTag={handleAddTag}
                    onRemoveTag={handleRemoveTag}
                />

                {/* Bio Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        BIO
                    </Text>
                    <Card elevated padding="md">
                        <Text style={[styles.bioText, { color: theme.textPrimary }]}>
                            {profile?.bio || 'No bio added yet. Tap edit to add one.'}
                        </Text>
                    </Card>
                </View>

                {/* Info Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                        INFORMATION
                    </Text>
                    <Card elevated padding="none">
                        <View style={styles.infoRow}>
                            <View style={styles.infoLeft}>
                                <Ionicons
                                    name="mail-outline"
                                    size={20}
                                    color={theme.textSecondary}
                                />
                                <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>
                                    Email
                                </Text>
                            </View>
                            <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
                                {user?.email}
                            </Text>
                        </View>

                        <View style={[styles.infoRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
                            <View style={styles.infoLeft}>
                                <Ionicons
                                    name={profile?.is_public ? "globe-outline" : "lock-closed-outline"}
                                    size={20}
                                    color={theme.textSecondary}
                                />
                                <Text style={[styles.infoLabel, { color: theme.textPrimary }]}>
                                    Profile Visibility
                                </Text>
                            </View>
                            <Text style={[styles.infoValue, { color: theme.textSecondary }]}>
                                {profile?.is_public ? 'Public' : 'Private'}
                            </Text>
                        </View>
                    </Card>
                </View>

                {/* Complete Profile CTA */}
                {!completionStatus.isComplete && (
                    <Button
                        title="Complete Your Profile"
                        onPress={() => router.push('/profile/edit')}
                        variant="primary"
                        size="lg"
                        fullWidth
                        icon="create-outline"
                    />
                )}
            </ScreenScrollView>
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
    scrollContent: {
        padding: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    avatar: {
        marginBottom: spacing.md,
    },
    displayName: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.xs,
    },
    username: {
        fontSize: typography.fontSize.base,
        marginBottom: spacing.md,
    },
    completionContainer: {
        width: '100%',
        marginTop: spacing.md,
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    completionText: {
        fontSize: typography.fontSize.sm,
        textAlign: 'center',
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
    bioText: {
        fontSize: typography.fontSize.base,
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
    },
    infoLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    infoLabel: {
        fontSize: typography.fontSize.base,
    },
    infoValue: {
        fontSize: typography.fontSize.base,
    },
    loadingState: {
        marginBottom: spacing.sm,
    }
});
