/**
 * Task Details Screen
 * 
 * Read-only view of a single task.
 * Includes "Edit" button to navigate to the edit form.
 */

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_TASK_DETAILS } from '@/graphql/queries';
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

interface TaskDetail {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
    created_at: string;
    contact: {
        id: string;
        name: string;
        company_name: string;
        designation: string;
    };
}

export default function TaskDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [task, setTask] = useState<TaskDetail | null>(null);

    const fetchTaskDetails = async () => {
        setLoading(true);
        if (typeof id !== 'string') return;

        const result = await executeGraphQL(GET_TASK_DETAILS.loc?.source.body || '', { id });
        if (result.data?.tasksCollection?.edges?.[0]?.node) {
            setTask(result.data.tasksCollection.edges[0].node);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTaskDetails();
    }, [id]);

    const getPriorityColor = (p: string) => {
        switch (p) {
            case 'high': return '#FF4B2B';
            case 'medium': return '#FF9800';
            case 'low': return '#4CAF50';
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

    if (!task) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textSecondary }}>Task not found.</Text>
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
                        <Text style={styles.headerTitle}>Task Details</Text>
                        <IconButton
                            icon="create-outline"
                            onPress={() => router.push(`/tasks/edit?id=${id}`)}
                            variant="ghost"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            color="#fff"
                        />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Meta Info Card */}
                <Card style={styles.metaCard} elevated>
                    <View style={styles.row}>
                        <View style={styles.statusBadge}>
                            <Badge
                                label={task.status.replace('_', ' ')}
                                variant="default"
                                style={{ backgroundColor: theme.backgroundSecondary }}
                            />
                        </View>
                        <View style={styles.priorityContainer}>
                            <View style={[styles.dot, { backgroundColor: getPriorityColor(task.priority) }]} />
                            <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                                {task.priority.toUpperCase()} Priority
                            </Text>
                        </View>
                    </View>

                    <Text style={[styles.title, { color: theme.textPrimary }]}>{task.title}</Text>

                    <View style={[styles.dateRow, { marginTop: spacing.sm }]}>
                        <Ionicons name="calendar-outline" size={16} color={theme.textTertiary} />
                        <Text style={[styles.dateText, { color: theme.textTertiary }]}>
                            Due {new Date(task.due_date).toLocaleDateString()}
                        </Text>
                    </View>
                </Card>

                {/* Description */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DESCRIPTION</Text>
                    <Card style={styles.contentCard}>
                        <Text style={[styles.description, { color: theme.textPrimary }]}>
                            {task.description || 'No description provided.'}
                        </Text>
                    </Card>
                </View>

                {/* Related Contact */}
                {task.contact && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>RELATED CONTACT</Text>
                        <Card
                            style={styles.contactCard}
                            onPress={() => router.push(`/contact/${task.contact.id}`)}
                            elevated
                        >
                            <View style={styles.contactRow}>
                                <Avatar name={task.contact.name} size="md" />
                                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                                    <Text style={[styles.contactName, { color: theme.textPrimary }]}>{task.contact.name}</Text>
                                    {(task.contact.designation || task.contact.company_name) && (
                                        <Text style={[styles.contactSub, { color: theme.textSecondary }]}>
                                            {task.contact.designation && task.contact.company_name
                                                ? `${task.contact.designation} at ${task.contact.company_name}`
                                                : (task.contact.designation || task.contact.company_name)}
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
    priorityContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    priorityText: { fontSize: 13, fontWeight: '600' },
    title: { fontSize: 24, fontWeight: 'bold', lineHeight: 32 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: 14, fontWeight: '500' },

    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: spacing.sm, marginLeft: 4 },
    contentCard: { padding: spacing.md, borderRadius: 16 },
    description: { fontSize: 16, lineHeight: 24 },

    contactCard: { padding: spacing.md, borderRadius: 16 },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactName: { fontSize: 16, fontWeight: 'bold' },
    contactSub: { fontSize: 14, marginTop: 2 },
});
