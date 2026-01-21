/**
 * Task Details Screen - With ScreenHeader
 */

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_TASK_DETAILS } from '@/graphql/queries';
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
    const { theme, colorScheme } = useTheme();
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
            case 'high': return theme.error;
            case 'medium': return theme.warning;
            case 'low': return theme.accent;
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

    if (!task) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textSecondary }}>Task not found.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme.headerBackground}
            />

            <ScreenHeader
                subtitle="View details"
                title="Task Details"
                onBack={() => router.back()}
                onAction={() => router.push(`/tasks/edit?id=${id}`)}
                actionIcon="create-outline"
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Card style={styles.metaCard} elevated>
                    <View style={styles.row}>
                        <Badge
                            label={task.status.replace('_', ' ')}
                            variant="default"
                            style={{ backgroundColor: theme.backgroundSecondary }}
                        />
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

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DESCRIPTION</Text>
                    <Card style={styles.contentCard}>
                        <Text style={[styles.description, { color: theme.textPrimary }]}>
                            {task.description || 'No description provided.'}
                        </Text>
                    </Card>
                </View>

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
    content: { padding: spacing.md, paddingBottom: 100 },
    metaCard: { borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.lg },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    priorityContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    priorityText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.semibold },
    title: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, lineHeight: typography.fontSize['2xl'] * 1.3 },
    dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dateText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: 1, marginBottom: spacing.sm, marginLeft: 4 },
    contentCard: { padding: spacing.md, borderRadius: borderRadius.lg },
    description: { fontSize: typography.fontSize.base, lineHeight: typography.fontSize.base * 1.5 },
    contactCard: { padding: spacing.md, borderRadius: borderRadius.lg },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold },
    contactSub: { fontSize: typography.fontSize.sm, marginTop: 2 },
});
