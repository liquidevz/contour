/**
 * Edit Task Screen
 * 
 * New Design System Form for Creating/Editing Tasks.
 * Supports passing `contactId` via params to pre-fill contact.
 */

import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_TASK_DETAILS } from '@/graphql/queries';
import { executeGraphQL, executeGraphQLMutation } from '@/lib/graphql';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
// Note: You'll need to ensure UPDATE_TASK and CREATE_TASK mutations exist in graphql/mutations.ts
// I will assume they do or stub them. For now I'll use raw strings if needed or just import standard ones.
import { CREATE_TASK, UPDATE_TASK } from '@/graphql/mutations';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function EditTaskScreen() {
    const { id, contactId } = useLocalSearchParams();
    const isEditing = !!id;
    const router = useRouter();
    const { theme } = useTheme();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('pending');
    const [priority, setPriority] = useState('medium');
    const [date, setDate] = useState(new Date()); // Simplified date handling for now

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
                // If creating and contactId is present, link it.
                // If editing, we typically don't change contact but could.
                ...(contactId ? { contact_id: contactId } : {})
            };

            if (isEditing) {
                // Update
                const result = await executeGraphQLMutation(UPDATE_TASK.loc?.source.body || '', { id, ...variables });
                if (result.error) throw new Error(result.error.message);
            } else {
                // Create
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
                        <Button
                            title="Cancel"
                            variant="ghost"
                            onPress={() => router.back()}
                            style={{ paddingHorizontal: 0 }}
                            textStyle={{ color: '#fff' }}
                        />
                        <Text style={styles.headerTitle}>{isEditing ? 'Edit Task' : 'New Task'}</Text>
                        <Button
                            title="Save"
                            variant="ghost"
                            onPress={handleSave}
                            loading={loading}
                            style={{ paddingHorizontal: 0 }}
                            textStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                    </View>
                </SafeAreaView>
            </View>

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
                        containerStyle={{ height: 120 }}
                    />

                    {/* Priority Selector */}
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
                                        backgroundColor: priority === p ? (p === 'high' ? '#FF4B2B' : (p === 'medium' ? '#FF9800' : '#4CAF50')) : 'transparent',
                                        borderColor: priority === p ? 'transparent' : theme.border
                                    }}
                                    textStyle={{ color: priority === p ? '#fff' : theme.textSecondary }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Status Selector */}
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
                                        backgroundColor: status === s ? theme.primary : 'transparent',
                                        borderColor: status === s ? 'transparent' : theme.border
                                    }}
                                    textStyle={{ color: status === s ? '#fff' : theme.textSecondary }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Date Picker Placeholder (simplified) */}
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
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },

    content: { padding: spacing.lg },
    section: { marginBottom: spacing.lg },
    label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
    selectorRow: { flexDirection: 'row', gap: spacing.sm },
});
