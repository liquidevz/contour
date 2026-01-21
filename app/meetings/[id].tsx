/**
 * Meeting Details Screen
 * 
 * Read-only view of a single meeting.
 */

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_MEETING_DETAILS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
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
    const { theme } = useTheme();
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
            case 'scheduled': return theme.primary;
            case 'completed': return '#4CAF50';
            case 'cancelled': return '#F44336';
            default: return theme.textSecondary;
        }
    };

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!meeting) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textSecondary }}>Meeting not found.</Text>
                <IconButton icon="arrow-back" onPress={() => router.back()} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
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
                        <IconButton
                            icon="arrow-back"
                            onPress={() => router.back()}
                            variant="ghost"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            color="#fff"
                        />
                        <Text style={styles.headerTitle}>Meeting Details</Text>
                        <IconButton
                            icon="create-outline"
                            onPress={() => router.push(`/meetings/edit?id=${id}`)}
                            variant="ghost"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            color="#fff"
                        />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                <Card style={styles.metaCard} elevated>
                    <View style={styles.row}>
                        <View style={styles.statusBadge}>
                            <Badge
                                label={meeting.meeting_type}
                                variant="default"
                                style={{ backgroundColor: theme.backgroundSecondary }}
                            />
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <View style={[styles.dot, { backgroundColor: getStatusColor(meeting.status) }]} />
                            <Text style={{ fontSize: 12, color: getStatusColor(meeting.status), fontWeight: '600', textTransform: 'capitalize' }}>
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

                {/* Related Contact */}
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
    headerBackground: { ...StyleSheet.absoluteFillObject },
    safeArea: {
        paddingTop: Platform.OS === 'android' ? 40 : 0,
        paddingHorizontal: spacing.md,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
        marginTop: spacing.sm,
        height: 48
    },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

    content: { padding: spacing.md, paddingBottom: 100 },

    metaCard: { borderRadius: 20, padding: spacing.lg, marginBottom: spacing.lg },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    statusBadge: {},
    dot: { width: 8, height: 8, borderRadius: 4 },
    title: { fontSize: 24, fontWeight: 'bold', lineHeight: 32, marginBottom: spacing.lg },

    infoGrid: { gap: spacing.md },
    infoItem: { flexDirection: 'row', gap: spacing.md, alignItems: 'flex-start' },
    infoLabel: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
    infoValue: { fontSize: 16, fontWeight: '500' },

    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: spacing.sm, marginLeft: 4 },
    contentCard: { padding: spacing.md, borderRadius: 16 },
    description: { fontSize: 16, lineHeight: 24 },

    contactCard: { padding: spacing.md, borderRadius: 16 },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactName: { fontSize: 16, fontWeight: 'bold' },
    contactSub: { fontSize: 14, marginTop: 2 },
});
