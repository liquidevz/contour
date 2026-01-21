/**
 * Meeting Details Screen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/tokens';
import { executeGraphQL } from '@/lib/graphql';
import { GET_MEETING_DETAILS } from '@/graphql/queries';
import IconButton from '@/components/ui/IconButton';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

export default function MeetingDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [meeting, setMeeting] = useState<any>(null);

    const fetchDetails = async () => {
        setLoading(true);
        const result = await executeGraphQL(GET_MEETING_DETAILS.loc?.source.body || '', { id });
        if (result.data?.meetingsCollection?.edges?.[0]?.node) {
            setMeeting(result.data.meetingsCollection.edges[0].node);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleEdit = () => {
        if (meeting?.contact?.id) {
            // @ts-ignore
            router.push({
                pathname: `/contact/${meeting.contact.id}`,
                params: { editMeeting: meeting.id }
            });
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
                <Text>Meeting not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: '#F5F7FA' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#FF9800', '#F57C00']} // Orange theme for meetings
                    style={styles.headerBackground}
                />
                <View style={styles.headerContent}>
                    <View style={styles.topNav}>
                        <IconButton icon="arrow-back" onPress={() => router.back()} variant="ghost" color="#fff" />
                        <Text style={styles.headerTitle}>Meeting Details</Text>
                        <IconButton icon="pencil" onPress={handleEdit} variant="ghost" color="#fff" disabled={!meeting.contact} />
                    </View>
                </View>

                {meeting.contact ? (
                    <View style={styles.floatingCard}>
                        <View style={styles.contactRow}>
                            <Avatar name={meeting.contact.name || '?'} size="md" />
                            <View style={{ marginLeft: spacing.md }}>
                                <Text style={styles.contactLabel}>WITH CONTACT</Text>
                                <Text style={styles.contactName}>{meeting.contact.name}</Text>
                                {(meeting.contact.designation || meeting.contact.company_name) && (
                                    <Text style={styles.contactSub}>
                                        {meeting.contact.designation}{meeting.contact.designation && meeting.contact.company_name ? ' @ ' : ''}{meeting.contact.company_name}
                                    </Text>
                                )}
                            </View>
                        </View>
                        {/* @ts-ignore */}
                        <Ionicons name="chevron-forward" size={20} color="#ccc" onPress={() => router.push(`/contact/${meeting.contact.id}`)} />
                    </View>
                ) : (
                    <View style={[styles.floatingCard, { justifyContent: 'center' }]}>
                        <Text style={{ fontStyle: 'italic', color: '#999' }}>No contact assigned</Text>
                    </View>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.mainTitle}>{meeting.title}</Text>

                <View style={styles.metaRow}>
                    <Badge
                        label={meeting.meeting_type.toUpperCase()}
                        variant="default"
                        style={{ backgroundColor: '#FFF3E0' }}
                        textStyle={{ color: '#E65100' }}
                    />
                    <Badge
                        label={meeting.status.toUpperCase()}
                        variant="outline"
                    />
                    <View style={styles.dateBadge}>
                        <Ionicons name="location-outline" size={14} color="#666" />
                        <Text style={styles.dateText}>{meeting.location || 'Zoom/Online'}</Text>
                    </View>
                </View>

                <View style={[styles.section, styles.timeBox]}>
                    <Ionicons name="time" size={24} color="#F57C00" />
                    <View>
                        <Text style={styles.timeLabel}>SCHEDULED TIME</Text>
                        <Text style={styles.timeValue}>
                            {new Date(meeting.scheduled_start).toLocaleDateString()} at {new Date(meeting.scheduled_start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>NOTES</Text>
                    <Text style={styles.descriptionText}>
                        {meeting.notes || 'No notes available.'}
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { height: 200, marginBottom: 50 },
    headerBackground: { ...StyleSheet.absoluteFillObject, height: 200, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerContent: { paddingTop: 60, paddingHorizontal: spacing.md },
    topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
    floatingCard: {
        position: 'absolute',
        bottom: -40,
        left: spacing.lg,
        right: spacing.lg,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
    },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactLabel: { fontSize: 10, fontWeight: 'bold', color: '#999', letterSpacing: 1, marginBottom: 2 },
    contactName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    contactSub: { fontSize: 12, color: '#666', marginTop: 2 },
    content: { padding: spacing.xl, paddingTop: 20 },
    mainTitle: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A', marginBottom: spacing.md },
    metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
    dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f0f0f0', borderRadius: 12 },
    dateText: { fontSize: 12, fontWeight: '600', color: '#666' },
    section: { marginBottom: spacing.xl },
    sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', letterSpacing: 1.5, marginBottom: spacing.md },
    descriptionText: { fontSize: 16, lineHeight: 26, color: '#444' },
    timeBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#FFF3E0', padding: spacing.md, borderRadius: 16 },
    timeLabel: { fontSize: 10, fontWeight: '900', color: '#E65100', letterSpacing: 1 },
    timeValue: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 2 },
});
