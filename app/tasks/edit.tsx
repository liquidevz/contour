/**
 * Edit Task Screen - With ScreenHeader
 */

import { spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { CREATE_TASK, UPDATE_TASK } from '@/graphql/mutations';
import { GET_TASK_DETAILS } from '@/graphql/queries';
import { executeGraphQL, executeGraphQLMutation } from '@/lib/graphql';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function EditTaskScreen() {
    const { id, contactId } = useLocalSearchParams();
    const isEditing = !!id;
    const router = useRouter();
    const { theme, colorScheme } = useTheme();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('pending');
    const [priority, setPriority] = useState('medium');
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        if (isEditing && typeof id === 'string') {
            fetchTaskDetails(id);
        }
    }, [id]);

    const fetchTaskDetails = async (taskId: string) => {
        const result = await executeGraphQL(GET_TASK_DETAILS.loc?.source.body || '', { id: taskId });
        if (result.data?.tasksCollection?.edges?.[0]?.node) {
            const task = result.data.tasksCollection.edges[0].node;
            setTitle(task.title);
            setDescription(task.description || '');
            setStatus(task.status);
            setPriority(task.priority);
            if (task.due_date) setDate(new Date(task.due_date));
        }
        setFetching(false);
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Title is required');
            return;
        }

        setLoading(true);
        try {
            const variables = {
                title,
                description,
                status,
                priority,
                due_date: date.toISOString(),
                ...(contactId ? { contact_id: contactId } : {})
            };

            if (isEditing) {
                const result = await executeGraphQLMutation(UPDATE_TASK.loc?.source.body || '', { id, ...variables });
                if (result.error) throw new Error(result.error.message);
            } else {
                const result = await executeGraphQLMutation(CREATE_TASK.loc?.source.body || '', variables);
                if (result.error) throw new Error(result.error.message);
            }

            Alert.alert('Success', `Task ${isEditing ? 'updated' : 'created'} successfully`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
                backgroundColor={theme.headerBackground}
            />

            <ScreenHeader
                subtitle={isEditing ? "Update task" : "Create new task"}
                title={isEditing ? 'Edit Task' : 'New Task'}
                onBack={() => router.back()}
                onAction={handleSave}
                actionLabel="Save"
                actionLoading={loading}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Input
                        label="Title"
                        placeholder="Task Title"
                        value={title}
                        onChangeText={setTitle}
                        autoFocus={!isEditing}
                    />

                    <Input
                        label="Description"
                        placeholder="Add details..."
                        value={description}
                        onChangeText={setDescription}
                        multiline
                        numberOfLines={4}
                        style={{ minHeight: 100, textAlignVertical: 'top' }}
                    />

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Priority</Text>
                        <View style={styles.selectorRow}>
                            {['low', 'medium', 'high'].map(p => (
                                <Badge
                                    key={p}
                                    label={p.toUpperCase()}
                                    variant={priority === p ? 'default' : 'outline'}
                                    onPress={() => setPriority(p)}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        backgroundColor: priority === p ? theme.textPrimary : 'transparent',
                                        borderColor: priority === p ? 'transparent' : theme.border
                                    }}
                                    textStyle={{ color: priority === p ? theme.textInverse : theme.textSecondary }}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Status</Text>
                        <View style={styles.selectorRow}>
                            {['pending', 'in_progress', 'completed'].map(s => (
                                <Badge
                                    key={s}
                                    label={s.replace('_', ' ').toUpperCase()}
                                    variant={status === s ? 'default' : 'outline'}
                                    onPress={() => setStatus(s)}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        backgroundColor: status === s ? theme.textPrimary : 'transparent',
                                        borderColor: status === s ? 'transparent' : theme.border
                                    }}
                                    textStyle={{ color: status === s ? theme.textInverse : theme.textSecondary }}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Due Date</Text>
                        <Button
                            title={date.toLocaleDateString()}
                            variant="secondary"
                            icon="calendar-outline"
                            onPress={() => Alert.alert('Date Picker', 'Date picker component would open here.')}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: 100 },
    section: { marginBottom: spacing.lg },
    label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.sm },
    selectorRow: { flexDirection: 'row', gap: spacing.sm },
});
