/**
 * Tasks Dashboard
 * 
 * Displays all tasks with filtering capabilities.
 * Visual Style: Matches Home Dashboard (Gradients, Cards, Modern Typography)
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/tokens';
import { executeGraphQL } from '@/lib/graphql';
import { GET_ALL_TASKS } from '@/graphql/queries';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import IconButton from '@/components/ui/IconButton';
import Avatar from '@/components/ui/Avatar';

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

// Filter Options
const PRIORITIES = ['all', 'high', 'medium', 'low'];
const STATUSES = ['all', 'pending', 'in_progress', 'completed'];

export default function TasksScreen() {
    const router = useRouter();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [tasks, setTasks] = useState<Task[]>([]);

    // Filters
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

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            {/* Header */}
            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#FF416C', '#FF4B2B']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.headerBackground}
                />

                <View style={[styles.headerContent, { paddingTop: 60 }]}>
                    <View style={styles.topBar}>
                        <IconButton
                            icon="arrow-back"
                            onPress={() => router.back()}
                            variant="ghost"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            color="#fff"
                        />
                        <Text style={styles.headerTitle}>Tasks</Text>
                        <View style={{ width: 40 }} />
                    </View>

                    {/* Filters */}
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
                                    priorityFilter === p ? styles.activeChip : styles.inactiveChip
                                ]}
                            >
                                <Text style={[
                                    styles.filterText,
                                    priorityFilter === p ? styles.activeFilterText : styles.inactiveFilterText
                                ]}>
                                    {p.charAt(0).toUpperCase() + p.slice(1)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
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
                                    statusFilter === s ? styles.activeChip : styles.inactiveChip
                                ]}
                            >
                                <Text style={[
                                    styles.filterText,
                                    statusFilter === s ? styles.activeFilterText : styles.inactiveFilterText
                                ]}>
                                    {s.replace('_', ' ').toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </View>

            {/* Task List */}
            <ScrollView
                contentContainerStyle={styles.listContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTasks(true)} tintColor={theme.primary} />}
            >
                {filteredTasks.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Ionicons name="checkbox-outline" size={64} color={theme.border} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks found</Text>
                    </View>
                ) : (
                    filteredTasks.map(task => (
                        <Card
                            key={task.id}
                            style={styles.taskCard}
                            // @ts-ignore
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
                                        {task.contact?.name || 'Unknown User'}
                                    </Text>
                                </View>
                                <Badge
                                    label={task.status.replace('_', ' ')}
                                    variant="outline"
                                    style={{ borderColor: theme.border }}
                                />
                            </View>
                        </Card>
                    ))
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
        marginBottom: spacing.md,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    headerBackground: { ...StyleSheet.absoluteFillObject },
    headerContent: { paddingHorizontal: spacing.md },
    topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    filterScroll: { marginBottom: spacing.sm },
    filterContent: { gap: spacing.sm, paddingHorizontal: spacing.sm },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    activeChip: { backgroundColor: '#fff', borderColor: '#fff' },
    inactiveChip: { backgroundColor: 'transparent', borderColor: 'rgba(255,255,255,0.3)' },
    filterText: { fontSize: 13, fontWeight: '600' },
    activeFilterText: { color: '#FF4B2B' },
    inactiveFilterText: { color: 'rgba(255,255,255,0.8)' },
    listContent: { padding: spacing.md, paddingBottom: 100 },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: spacing.md, fontSize: 16 },
    taskCard: { marginBottom: spacing.md, borderRadius: 16, padding: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
    priorityIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    dot: { width: 8, height: 8, borderRadius: 4 },
    priorityText: { fontSize: 12, fontWeight: 'bold' },
    dateContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    dateText: { fontSize: 12 },
    taskTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: spacing.md, lineHeight: 24 },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.xs },
    contactInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    contactName: { fontSize: 14, fontWeight: '500' },
});
