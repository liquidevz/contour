/**
 * Meeting Details Screen - With ScreenHeader
 */

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_MEETING_DETAILS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface MeetingDetail {
    id: string;
    title: string;
    meeting_type: string;
    status: string;
    scheduled_start: string;
    location: string;
    notes: string;
    created_at: string;
    contact: {
        id: string;
        name: string;
        company_name: string;
        designation: string;
    };
}

export default function MeetingDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme, colorScheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [meeting, setMeeting] = useState<MeetingDetail | null>(null);

    const fetchDetails = async () => {
        setLoading(true);
        if (typeof id !== 'string') return;

        const result = await executeGraphQL(GET_MEETING_DETAILS.loc?.source.body || '', { id });
        if (result.data?.meetingsCollection?.edges?.[0]?.node) {
            setMeeting(result.data.meetingsCollection.edges[0].node);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return theme.accent;
            case 'completed': return theme.accent;
            case 'cancelled': return theme.error;
            default: return theme.textSecondary;
        }
    };

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.textPrimary} />
            </View>
        );
    }

    if (!meeting) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textSecondary }}>Meeting not found.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'dark-content' : 'light-content'}
                backgroundColor="transparent"
                translucent
            />

            <ScreenHeader
                title="Meeting Details"
                onBack={() => router.back()}
                onAction={() => router.push(`/meetings/edit?id=${id}`)}
                actionIcon="create-outline"
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Card style={styles.metaCard} elevated>
                    <View style={styles.row}>
                        <Badge
                            label={meeting.meeting_type}
                            variant="default"
                            style={{ backgroundColor: theme.backgroundSecondary }}
                        />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={[styles.dot, { backgroundColor: getStatusColor(meeting.status) }]} />
                            <Text style={{ fontSize: typography.fontSize.xs, color: getStatusColor(meeting.status), fontWeight: typography.fontWeight.semibold, textTransform: 'capitalize' }}>
                                {meeting.status}
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.title, { color: theme.textPrimary }]}>{meeting.title}</Text>

                    <View style={styles.infoGrid}>
                        <View style={styles.infoItem}>
                            <Ionicons name="calendar-outline" size={20} color={theme.textTertiary} />
                            <View>
                                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>Time</Text>
                                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                                    {new Date(meeting.scheduled_start).toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoItem}>
                            <Ionicons name="location-outline" size={20} color={theme.textTertiary} />
                            <View>
                                <Text style={[styles.infoLabel, { color: theme.textTertiary }]}>Location</Text>
                                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                                    {meeting.location || 'Online / Remote'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </Card>

                {meeting.notes && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>NOTES</Text>
                        <Card style={styles.contentCard}>
                            <Text style={[styles.description, { color: theme.textPrimary }]}>
                                {meeting.notes}
                            </Text>
                        </Card>
                    </View>
                )}

                {meeting.contact && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PARTICIPANTS</Text>
                        <Card
                            style={styles.contactCard}
                            onPress={() => router.push(`/contact/${meeting.contact.id}`)}
                            elevated
                        >
                            <View style={styles.contactRow}>
                                <Avatar name={meeting.contact.name} size="md" />
                                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                                    <Text style={[styles.contactName, { color: theme.textPrimary }]}>{meeting.contact.name}</Text>
                                    {(meeting.contact.designation || meeting.contact.company_name) && (
                                        <Text style={[styles.contactSub, { color: theme.textSecondary }]}>
                                            {meeting.contact.designation && meeting.contact.company_name
                                                ? `${meeting.contact.designation} at ${meeting.contact.company_name}`
                                                : (meeting.contact.designation || meeting.contact.company_name)}
                                        </Text>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
                            </View>
                        </Card>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: spacing.md, paddingBottom: 100 },
    metaCard: { borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.lg },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    dot: { width: 8, height: 8, borderRadius: 4 },
    title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, lineHeight: typography.fontSize['2xl'] * 1.3, marginBottom: spacing.lg },
    infoGrid: { gap: spacing.md },
    infoItem: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
    infoLabel: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, marginBottom: 2 },
    infoValue: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: 1, marginBottom: spacing.sm, marginLeft: 4 },
    contentCard: { padding: spacing.md, borderRadius: borderRadius.lg },
    description: { fontSize: typography.fontSize.base, lineHeight: typography.fontSize.base * 1.5 },
    contactCard: { padding: spacing.md, borderRadius: borderRadius.lg },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold },
    contactSub: { fontSize: typography.fontSize.sm, marginTop: 2 },
});
