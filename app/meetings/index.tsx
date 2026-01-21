/**
 * Meetings Dashboard
 * 
 * Displays all meetings with new design system.
 */

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_ALL_MEETINGS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface Meeting {
    id: string;
    title: string;
    meeting_type: string;
    status: string;
    scheduled_start: string;
    location: string;
    contact: {
        id: string;
        name: string;
    };
}

export default function MeetingsScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [meetings, setMeetings] = useState<Meeting[]>([]);

    const fetchMeetings = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const result = await executeGraphQL(GET_ALL_MEETINGS.loc?.source.body || '', {});
        if (result.data?.meetingsCollection?.edges) {
            setMeetings(result.data.meetingsCollection.edges.map((e: any) => e.node));
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled': return theme.primary;
            case 'completed': return '#4CAF50';
            case 'cancelled': return '#F44336';
            default: return theme.textSecondary;
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

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
                        <Text style={styles.headerTitle}>Meetings</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchMeetings(true)} tintColor={theme.primary} />}
                    showsVerticalScrollIndicator={false}
                >
                    {meetings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={64} color={theme.border} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No meetings found</Text>
                        </View>
                    ) : (
                        meetings.map(meeting => (
                            <Card
                                key={meeting.id}
                                style={styles.card}
                                // @ts-ignore
                                onPress={() => router.push(`/meetings/${meeting.id}`)}
                                elevated
                            >
                                <View style={styles.cardHeader}>
                                    <Badge
                                        label={meeting.meeting_type}
                                        variant="default"
                                        style={{ backgroundColor: theme.backgroundSecondary }}
                                    />
                                    <Text style={[styles.dateText, { color: theme.textTertiary }]}>
                                        {formatDate(meeting.scheduled_start)}
                                    </Text>
                                </View>

                                <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={2}>
                                    {meeting.title}
                                </Text>

                                <View style={styles.cardFooter}>
                                    <View style={styles.contactInfo}>
                                        <Avatar name={meeting.contact?.name || '?'} size="sm" />
                                        <Text style={[styles.contactName, { color: theme.textSecondary }]}>
                                            {meeting.contact?.name || 'Unknown'}
                                        </Text>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <View style={[styles.dot, { backgroundColor: getStatusColor(meeting.status) }]} />
                                        <Text style={{ fontSize: 12, color: getStatusColor(meeting.status), fontWeight: '600', textTransform: 'capitalize' }}>
                                            {meeting.status}
                                        </Text>
                                    </View>
                                </View>
                            </Card>
                        ))
                    )}
                </ScrollView>
            )}
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
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' }, // Slightly smaller than Contacts/Home main headers
    listContent: { padding: spacing.md, paddingBottom: 100 },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: spacing.md, fontSize: 16 },
    card: { marginBottom: spacing.md, borderRadius: 16, padding: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, alignItems: 'center' },
    dateText: { fontSize: 12 },
    title: { fontSize: 18, fontWeight: 'bold', marginBottom: spacing.md, lineHeight: 24 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
    contactInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    contactName: { fontSize: 14, fontWeight: '500' },
    dot: { width: 8, height: 8, borderRadius: 4 },
});
