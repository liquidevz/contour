/**
 * Tasks Dashboard - Uber Style
 * 
 * Clean task list with filter pills and modern cards
 */

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
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_ALL_TASKS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    due_date: string;
    contact: {
        id: string;
        name: string;
    };
}

const PRIORITIES = ['all', 'high', 'medium', 'low'];
const STATUSES = ['all', 'pending', 'in_progress', 'completed'];

export default function TasksScreen() {
    const router = useRouter();
    const { theme, colorScheme } = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);

    const [priorityFilter, setPriorityFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchTasks = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const result = await executeGraphQL(GET_ALL_TASKS.loc?.source.body || '', {});
        if (result.data?.tasksCollection?.edges) {
            setTasks(result.data.tasksCollection.edges.map((e: any) => e.node));
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const filteredTasks = tasks.filter(task => {
        const priorityMatch = priorityFilter === 'all' || task.priority === priorityFilter;
        const statusMatch = statusFilter === 'all' || task.status === statusFilter;
        return priorityMatch && statusMatch;
    });

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
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Tasks</Text>
                    <View style={{ width: 40 }} />
                </View>

                {/* Priority Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterContent}
                >
                    {PRIORITIES.map(p => (
                        <TouchableOpacity
                            key={p}
                            onPress={() => setPriorityFilter(p)}
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: priorityFilter === p ? theme.textPrimary : theme.backgroundSecondary,
                                }
                            ]}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: priorityFilter === p ? theme.textInverse : theme.textSecondary }
                            ]}>
                                {p.charAt(0).toUpperCase() + p.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Status Filters */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.filterScroll}
                    contentContainerStyle={styles.filterContent}
                >
                    {STATUSES.map(s => (
                        <TouchableOpacity
                            key={s}
                            onPress={() => setStatusFilter(s)}
                            style={[
                                styles.filterChip,
                                {
                                    backgroundColor: statusFilter === s ? theme.textPrimary : 'transparent',
                                    borderWidth: 1,
                                    borderColor: statusFilter === s ? theme.textPrimary : theme.border,
                                }
                            ]}
                        >
                            <Text style={[
                                styles.filterText,
                                { color: statusFilter === s ? theme.textInverse : theme.textSecondary }
                            ]}>
                                {s.replace('_', ' ').toUpperCase()}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Task List */}
            <ScrollView
                contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchTasks(true)}
                        tintColor={theme.textPrimary}
                    />
                }
                showsVerticalScrollIndicator={false}
            >
                {filteredTasks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
                            <Ionicons name="checkbox-outline" size={48} color={theme.textTertiary} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No tasks found</Text>
                        <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                            Try adjusting your filters
                        </Text>
                    </View>
                ) : (
                    filteredTasks.map((task, index) => (
                        <Animated.View
                            key={task.id}
                            entering={FadeInDown.delay(index * 30).springify()}
                        >
                            <Card
                                style={styles.taskCard}
                                onPress={() => router.push(`/tasks/${task.id}`)}
                                elevated
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.priorityIndicator}>
                                        <View style={[styles.dot, { backgroundColor: getPriorityColor(task.priority) }]} />
                                        <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                                            {task.priority.toUpperCase()}
                                        </Text>
                                    </View>
                                    {task.due_date && (
                                        <View style={styles.dateContainer}>
                                            <Ionicons name="calendar-outline" size={14} color={theme.textTertiary} />
                                            <Text style={[styles.dateText, { color: theme.textTertiary }]}>
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </Text>
                                        </View>
                                    )}
                                </View>

                                <Text style={[styles.taskTitle, { color: theme.textPrimary }]} numberOfLines={2}>
                                    {task.title}
                                </Text>

                                <View style={styles.cardFooter}>
                                    <View style={styles.contactInfo}>
                                        <Avatar name={task.contact?.name || '?'} size="sm" />
                                        <Text style={[styles.contactName, { color: theme.textSecondary }]}>
                                            {task.contact?.name || 'Unknown'}
                                        </Text>
                                    </View>
                                    <Badge
                                        label={task.status.replace('_', ' ')}
                                        variant="outline"
                                        style={{ borderColor: theme.border }}
                                    />
                                </View>
                            </Card>
                        </Animated.View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md
    },
    headerTitle: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        letterSpacing: typography.letterSpacing.tight,
    },
    filterScroll: { marginBottom: spacing.sm },
    filterContent: { gap: spacing.sm },
    filterChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs + 2,
        borderRadius: borderRadius.full,
    },
    filterText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold
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
    taskCard: {
        marginBottom: spacing.sm,
        borderRadius: borderRadius.xl,
        padding: spacing.md
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.sm
    },
    priorityIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    priorityText: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold },
    dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dateText: { fontSize: typography.fontSize.xs },
    taskTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.md,
        lineHeight: typography.fontSize.lg * typography.lineHeight.snug
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.xs
    },
    contactInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    contactName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
});
