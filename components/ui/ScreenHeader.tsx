/**
 * ScreenHeader Component - Compact with Theme Switching
 * 
 * Header with rounded bottom corners, inverted colors, and optional search
 */

import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Avatar from './Avatar';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const HEADER_HEIGHT = SCREEN_HEIGHT * 0.18; // 18% of screen - much smaller

interface ScreenHeaderProps {
    title: string;
    subtitle?: string;
    onBack?: () => void;
    onAction?: () => void;
    actionLabel?: string;
    actionIcon?: keyof typeof Ionicons.glyphMap;
    actionLoading?: boolean;
    showAvatar?: boolean;
    showNotifications?: boolean;
    userName?: string;
    customAvatarName?: string; // Custom name for avatar (e.g., contact name)
    // Search props
    showSearch?: boolean;
    searchValue?: string;
    onSearchChange?: (text: string) => void;
    searchPlaceholder?: string;
}


export default function ScreenHeader({
    title,
    subtitle,
    onBack,
    onAction,
    actionLabel = 'Save',
    actionIcon,
    actionLoading = false,
    showAvatar = true,
    showNotifications = true,
    userName = 'User',
    customAvatarName,
    showSearch = false,
    searchValue = '',
    onSearchChange,
    searchPlaceholder = 'Search...',
}: ScreenHeaderProps) {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { colorScheme } = useTheme();

    // Inverted colors: if app is dark, header is light and vice versa
    const isDark = colorScheme === 'dark';
    const headerBg = isDark ? '#FFFFFF' : '#000000';
    const textColor = isDark ? '#000000' : '#FFFFFF';
    const subtitleColor = isDark ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)';
    const iconColor = isDark ? '#000000' : '#FFFFFF';
    const accentColor = '#10B981';


    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: headerBg,
                    minHeight: HEADER_HEIGHT,
                    paddingTop: insets.top + spacing.md,
                    paddingBottom: spacing.lg,
                }
            ]}
        >
            {/* Main row */}
            <View style={styles.mainRow}>
                {/* Left: Back arrow + Title section */}
                <View style={styles.leftSection}>
                    {onBack && (
                        <TouchableOpacity
                            onPress={() => {
                                if (Platform.OS !== 'web') {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                onBack();
                            }}
                            style={styles.backButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Ionicons name="arrow-back" size={26} color={iconColor} />
                        </TouchableOpacity>
                    )}

                    <View style={styles.titleSection}>
                        {subtitle && (
                            <Text style={[styles.subtitle, { color: subtitleColor }]}>
                                {subtitle}
                            </Text>
                        )}
                        <Text
                            style={[styles.title, { color: textColor }]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                    </View>
                </View>

                {/* Right: Action, Notifications, Avatar */}
                <View style={styles.rightIcons}>
                    {/* Action button (Save/Edit icon) */}
                    {onAction && (
                        <TouchableOpacity
                            onPress={() => {
                                if (Platform.OS !== 'web') {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                onAction();
                            }}
                            style={styles.iconButton}
                            disabled={actionLoading}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            {actionIcon && !actionLoading ? (
                                <Ionicons name={actionIcon} size={24} color={iconColor} />
                            ) : !actionIcon ? (
                                <Text
                                    style={[
                                        styles.actionText,
                                        { color: accentColor, opacity: actionLoading ? 0.5 : 1 }
                                    ]}
                                >
                                    {actionLabel}
                                </Text>
                            ) : null}
                        </TouchableOpacity>
                    )}

                    {/* Notifications */}
                    {showNotifications && (
                        <TouchableOpacity
                            onPress={() => {
                                if (Platform.OS !== 'web') {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                            }}
                            style={styles.iconButton}
                        >
                            <Ionicons name="notifications-outline" size={24} color={iconColor} />
                            <View style={styles.notificationDot} />
                        </TouchableOpacity>
                    )}

                    {/* Avatar */}
                    {showAvatar && (
                        <TouchableOpacity
                            onPress={() => {
                                if (Platform.OS !== 'web') {
                                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                }
                                // @ts-ignore
                                router.push('/profile');
                            }}
                            style={styles.avatarButton}
                        >
                            <View style={styles.avatarWrapper}>
                                <Avatar name={customAvatarName || userName} size="sm" />
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Search Bar (optional) */}
            {showSearch && (
                <View style={[styles.searchContainer, {
                    backgroundColor: isDark ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.15)',
                    marginTop: spacing.md,
                    marginHorizontal: spacing.lg,
                }]}>
                    <Ionicons name="search" size={18} color={subtitleColor} />
                    <TextInput
                        style={[styles.searchInput, { color: textColor }]}
                        placeholder={searchPlaceholder}
                        placeholderTextColor={subtitleColor}
                        value={searchValue}
                        onChangeText={onSearchChange}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'center',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 6,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
    },
    leftSection: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        padding: spacing.xs,
        marginRight: spacing.sm,
    },
    titleSection: {
        flex: 1,
    },
    subtitle: {
        fontSize: 13,
        fontWeight: '400',
        marginBottom: 1,
        letterSpacing: 0.1,
    },
    title: {
        fontSize: 26,
        fontWeight: '700',
        letterSpacing: -0.4,
    },
    rightIcons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginLeft: spacing.md,
    },
    iconButton: {
        padding: spacing.xs,
        position: 'relative',
    },
    notificationDot: {
        position: 'absolute',
        top: 6,
        right: 6,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#EF4444',
    },
    avatarButton: {
        padding: spacing.xs,
    },
    avatarWrapper: {
        // Avatar already has its own styling
    },
    actionText: {
        fontSize: 16,
        fontWeight: '700',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: 20,
        gap: spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '400',
    },
});
