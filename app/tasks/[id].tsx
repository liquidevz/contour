/**
 * Task Details Screen
 * 
 * "Beautiful" View UI with edit trigger.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/tokens';
import { executeGraphQL } from '@/lib/graphql';
import { GET_TASK_DETAILS } from '@/graphql/queries';
import IconButton from '@/components/ui/IconButton';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';

export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<any>(null);

    const fetchDetails = async () => {
        setLoading(true);
        const result = await executeGraphQL(GET_TASK_DETAILS.loc?.source.body || '', { id });
        if (result.data?.tasksCollection?.edges?.[0]?.node) {
            setTask(result.data.tasksCollection.edges[0].node);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

    const handleEdit = () => {
        if (task?.contact?.id) {
            // @ts-ignore
            router.push({
                pathname: `/contact/${task.contact.id}`,
                params: { editTask: task.id }
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

    if (!task) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Text>Task not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: '#F5F7FA' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            {/* Hero Header */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#FF416C', '#FF4B2B']}
                    style={styles.headerBackground}
                />
                <View style={styles.headerContent}>
                    <View style={styles.topNav}>
                        <IconButton icon="arrow-back" onPress={() => router.back()} variant="ghost" color="#fff" />
                        <Text style={styles.headerTitle}>Task Details</Text>
                        <IconButton icon="pencil" onPress={handleEdit} variant="ghost" color="#fff" disabled={!task.contact} />
                    </View>
                </View>

                {/* Contact Chip floating */}
                {task.contact ? (
                    <View style={styles.floatingCard}>
                        <View style={styles.contactRow}>
                            <Avatar name={task.contact.name || '?'} size="md" />
                            <View style={{ marginLeft: spacing.md }}>
                                <Text style={styles.contactLabel}>ASSIGNED CONTACT</Text>
                                <Text style={styles.contactName}>{task.contact.name}</Text>
                                {(task.contact.designation || task.contact.company_name) && (
                                    <Text style={styles.contactSub}>
                                        {task.contact.designation}{task.contact.designation && task.contact.company_name ? ' @ ' : ''}{task.contact.company_name}
                                    </Text>
                                )}
                            </View>
                        </View>
                        {/* @ts-ignore */}
                        <Ionicons name="chevron-forward" size={20} color="#ccc" onPress={() => router.push(`/contact/${task.contact.id}`)} />
                    </View>
                ) : (
                    <View style={[styles.floatingCard, { justifyContent: 'center' }]}>
                        <Text style={{ fontStyle: 'italic', color: '#999' }}>No contact assigned</Text>
                    </View>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.mainTitle}>{task.title}</Text>

                <View style={styles.metaRow}>
                    <Badge
                        label={task.priority?.toUpperCase() || 'NORMAL'}
                        variant="default"
                        style={{ backgroundColor: task.priority === 'high' ? '#FFEBEE' : '#E8F5E9' }}
                        textStyle={{ color: task.priority === 'high' ? '#D32F2F' : '#388E3C' }}
                    />
                    <Badge
                        label={task.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        variant="outline"
                    />
                    {task.due_date && (
                        <View style={styles.dateBadge}>
                            <Ionicons name="calendar-outline" size={14} color="#666" />
                            <Text style={styles.dateText}>{new Date(task.due_date).toLocaleDateString()}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DESCRIPTION</Text>
                    <Text style={styles.descriptionText}>
                        {task.description || 'No description provided.'}
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>TIMELINE</Text>
                    <View style={styles.timelineItem}>
                        <View style={styles.timelineDot} />
                        <View>
                            <Text style={styles.timelineTitle}>Created</Text>
                            <Text style={styles.timelineDate}>{new Date(task.created_at).toLocaleString()}</Text>
                        </View>
                    </View>
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
        minHeight: 80,
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
    timelineItem: { flexDirection: 'row', gap: spacing.md, paddingLeft: 4 },
    timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF4B2B', marginTop: 6 },
    timelineTitle: { fontSize: 14, fontWeight: '600', color: '#333' },
    timelineDate: { fontSize: 12, color: '#999', marginTop: 2 },
});
