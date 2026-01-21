/**
 * Meetings Dashboard - Uber Style
 * 
 * Clean meeting list with modern cards
 */

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_ALL_MEETINGS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
    const { theme, colorScheme } = useTheme();
    const insets = useSafeAreaInsets();
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
            case 'scheduled': return theme.accent;
            case 'completed': return theme.accent;
            case 'cancelled': return theme.error;
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
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme.headerBackground}
            />

            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: theme.headerBackground }]}>
                <View style={styles.headerTop}>
                    <IconButton
                        icon="arrow-back"
                        onPress={() => router.back()}
                        variant="ghost"
                        style={{ backgroundColor: theme.backgroundSecondary }}
                        color={theme.textPrimary}
                    />
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Meetings</Text>
                    <View style={{ width: 40 }} />
                </View>
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.textPrimary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchMeetings(true)}
                            tintColor={theme.textPrimary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {meetings.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
                                <Ionicons name="calendar-outline" size={48} color={theme.textTertiary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No meetings</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                Your scheduled meetings will appear here
                            </Text>
                        </View>
                    ) : (
                        meetings.map((meeting, index) => (
                            <Animated.View
                                key={meeting.id}
                                entering={FadeInDown.delay(index * 30).springify()}
                            >
                                <Card
                                    style={styles.card}
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
                                        <View style={styles.statusContainer}>
                                            <View style={[styles.dot, { backgroundColor: getStatusColor(meeting.status) }]} />
                                            <Text style={[styles.statusText, { color: getStatusColor(meeting.status) }]}>
                                                {meeting.status}
                                            </Text>
                                        </View>
                                    </View>
                                </Card>
                            </Animated.View>
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
    header: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.tight,
    },
    listContent: { padding: spacing.md },
    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.base,
    },
    card: { marginBottom: spacing.sm, borderRadius: borderRadius.xl, padding: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, alignItems: 'center' },
    dateText: { fontSize: typography.fontSize.xs },
    title: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.md,
        lineHeight: typography.fontSize.lg * typography.lineHeight.snug
    },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
    contactInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    contactName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
    statusContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    statusText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold, textTransform: 'capitalize' },
});
