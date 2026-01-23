/**
 * Profile Completion Modal
 * 
 * Prompts user to complete their profile when is_complete is false
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { ProfileCompletionStatus } from '@/types/profile';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface ProfileCompletionModalProps {
    visible: boolean;
    completionStatus: ProfileCompletionStatus;
    onComplete: () => void;
    onDismiss: () => void;
}

export default function ProfileCompletionModal({
    visible,
    completionStatus,
    onComplete,
    onDismiss,
}: ProfileCompletionModalProps) {
    const router = useRouter();
    const { theme } = useTheme();

    const handleCompleteProfile = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onComplete();
    };

    const handleDismiss = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onDismiss();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleDismiss}
        >
            <View style={styles.overlay}>
                <TouchableOpacity
                    style={styles.backdrop}
                    activeOpacity={1}
                    onPress={handleDismiss}
                />

                <View style={styles.modalContainer}>
                    <Card elevated padding="lg" style={styles.card}>
                        {/* Icon */}
                        <View style={[styles.iconContainer, { backgroundColor: theme.accent + '20' }]}>
                            <Ionicons
                                name="person-circle-outline"
                                size={48}
                                color={theme.accent}
                            />
                        </View>

                        {/* Title */}
                        <Text style={[styles.title, { color: theme.textPrimary }]}>
                            Complete Your Profile
                        </Text>

                        {/* Description */}
                        <Text style={[styles.description, { color: theme.textSecondary }]}>
                            Help others know you better by completing your profile information.
                        </Text>

                        {/* Progress */}
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
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
                            <Text style={[styles.progressText, { color: theme.textSecondary }]}>
                                {completionStatus.completionPercentage}% complete
                            </Text>
                        </View>

                        {/* Missing Fields */}
                        {completionStatus.missingFields.length > 0 && (
                            <View style={styles.missingFields}>
                                <Text style={[styles.missingTitle, { color: theme.textSecondary }]}>
                                    Required fields:
                                </Text>
                                {completionStatus.missingFields.map((field, index) => (
                                    <View key={index} style={styles.missingItem}>
                                        <Ionicons
                                            name="ellipse"
                                            size={6}
                                            color={theme.textSecondary}
                                        />
                                        <Text style={[styles.missingText, { color: theme.textSecondary }]}>
                                            {field.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Buttons */}
                        <View style={styles.buttons}>
                            <Button
                                title="Complete Profile"
                                onPress={handleCompleteProfile}
                                variant="primary"
                                size="lg"
                                fullWidth
                                icon="arrow-forward"
                            />

                            <Button
                                title="Skip for Now"
                                onPress={handleDismiss}
                                variant="ghost"
                                size="md"
                                fullWidth
                            />
                        </View>
                    </Card>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContainer: {
        width: '85%',
        maxWidth: 400,
    },
    card: {
        alignItems: 'center',
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.full,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.sm,
        textAlign: 'center',
    },
    description: {
        fontSize: typography.fontSize.base,
        textAlign: 'center',
        marginBottom: spacing.lg,
        lineHeight: typography.fontSize.base * typography.lineHeight.relaxed,
    },
    progressContainer: {
        width: '100%',
        marginBottom: spacing.lg,
    },
    progressBar: {
        width: '100%',
        height: 8,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
        marginBottom: spacing.xs,
    },
    progressFill: {
        height: '100%',
        borderRadius: borderRadius.full,
    },
    progressText: {
        fontSize: typography.fontSize.sm,
        textAlign: 'center',
        fontWeight: typography.fontWeight.medium,
    },
    missingFields: {
        width: '100%',
        padding: spacing.md,
        marginBottom: spacing.lg,
    },
    missingTitle: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.xs,
    },
    missingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginTop: spacing.xs,
    },
    missingText: {
        fontSize: typography.fontSize.sm,
    },
    buttons: {
        width: '100%',
        gap: spacing.sm,
    },
});
