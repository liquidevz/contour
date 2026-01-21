/**
 * Contact Details Screen
 * 
 * Premium redesign with:
 * - Gradient header with Avatar
 * - Animated tabs
 * - Card-based lists for Tasks, Meetings, Transactions
 * - Modern forms
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Modal,
    Alert,
    RefreshControl,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { executeGraphQL, executeGraphQLMutation } from '@/lib/graphql';
import { GET_CONTACT_DASHBOARD } from '@/graphql/queries';
import {
    COMPLETE_CONTACT_PROFILE,
    CREATE_TASK,
    CREATE_MEETING,
    CREATE_TRANSACTION,
    DELETE_TASK,
    DELETE_MEETING,
    DELETE_TRANSACTION,
    UPDATE_TASK,
    UPDATE_MEETING,
    UPDATE_TRANSACTION,

    UPDATE_CONTACT,
} from '@/graphql/mutations';

import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/tokens';

// UI Components
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import IconButton from '@/components/ui/IconButton';
import AnimatedFAB from '@/components/ui/AnimatedFAB';

type TabType = 'tasks' | 'meetings' | 'transactions';

interface Contact {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    designation: string | null;
    company_name: string | null;
    tags: string[] | null;
    notes: string | null;
    is_completed_profile: boolean;
}

interface Task {
    id: string;
    title: string;
    description: string | null;
    priority: string;
    status: string;
    due_date: string | null;
    created_at: string;
}

interface Meeting {
    id: string;
    title: string;
    meeting_type: string;
    status: string;
    scheduled_start: string;
    location: string | null;
    notes: string | null;
}

interface Transaction {
    id: string;
    amount: number;
    currency: string;
    category: string | null;
    status: string;
    reference_id: string | null;
    notes: string | null;
}

export default function ContactDetailsScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme, colorScheme } = useTheme();

    // State
    const [activeTab, setActiveTab] = useState<TabType>('tasks');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [contact, setContact] = useState<Contact | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

    // Modals
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form fields
    const [profileNotes, setProfileNotes] = useState('');

    // Generic Form State (reused for simplicity)
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [status, setStatus] = useState<string>('pending');

    // Meeting specific
    const [meetingType, setMeetingType] = useState<'call' | 'video' | 'in_person'>('call');
    const [location, setLocation] = useState('');

    // Transaction specific
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState<'To Pay' | 'To Receive'>('To Pay');
    const [currency, setCurrency] = useState('USD');

    // Loading states
    const [creating, setCreating] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<'create' | 'edit'>('create');

    // Profile Edit State
    const [profileName, setProfileName] = useState('');
    const [profilePhone, setProfilePhone] = useState('');
    const [profileEmail, setProfileEmail] = useState('');
    const [profileDesignation, setProfileDesignation] = useState('');
    const [profileCompany, setProfileCompany] = useState('');
    const [profileTags, setProfileTags] = useState('');

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const result = await executeGraphQL(
            GET_CONTACT_DASHBOARD.loc?.source.body || '',
            { id }
        );

        if (result.data) {
            const contactData = result.data.contactsCollection?.edges?.[0]?.node;
            setContact(contactData || null);
            setTasks(contactData?.tasksCollection?.edges?.map((e: any) => e.node) || []);
            setMeetings(contactData?.meetingsCollection?.edges?.map((e: any) => e.node) || []);
            setTransactions(contactData?.transactionsCollection?.edges?.map((e: any) => e.node) || []);

            if (contactData) {
                setProfileNotes(contactData.notes || '');
                setProfileName(contactData.name || '');
                setProfilePhone(contactData.phone || '');
                setProfileEmail(contactData.email || '');
                setProfileDesignation(contactData.designation || '');
                setProfileCompany(contactData.company_name || '');
                // Handle tags if array or string
                let tagsStr = '';
                if (Array.isArray(contactData.tags)) tagsStr = contactData.tags.join(', ');
                else if (typeof contactData.tags === 'string') tagsStr = contactData.tags;
                setProfileTags(tagsStr);
            }
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleCompleteProfile = async () => {
        if (!profileName.trim()) {
            Alert.alert('Error', 'Name is required');
            return;
        }

        setCreating(true);

        const tagsArray = profileTags.split(',').map(t => t.trim()).filter(Boolean);

        const result = await executeGraphQLMutation(UPDATE_CONTACT.loc?.source.body || '', {
            id,
            name: profileName,
            phone: profilePhone || null,
            email: profileEmail || null,
            designation: profileDesignation || null,
            companyName: profileCompany || null,
            tags: JSON.stringify(tagsArray),
            notes: profileNotes.trim() || null,
            isCompletedProfile: true
        });
        setCreating(false);

        if (result.error) {
            Alert.alert('Error', result.error.message);
        } else {
            setShowProfileModal(false);
            fetchData();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    };

    const handleCreate = async () => {
        if ((activeTab === 'tasks' || activeTab === 'meetings') && !title.trim()) {
            Alert.alert('Error', 'Title is required');
            return;
        }
        if (activeTab === 'transactions' && !amount.trim()) {
            Alert.alert('Error', 'Amount is required');
            return;
        }

        setCreating(true);
        let mutation, variables;

        // Clean up inputs
        const cleanTitle = title.trim();
        const cleanDesc = description.trim() || null;
        const cleanLoc = location.trim() || null;
        const cleanAmount = parseFloat(amount) || 0;

        if (activeTab === 'tasks') {
            mutation = editMode === 'edit' ? UPDATE_TASK : CREATE_TASK;
            variables = {
                id: editMode === 'edit' ? editingId : undefined,
                contactId: editMode === 'create' ? id : undefined,
                title: cleanTitle,
                description: cleanDesc,
                priority,
                status,
                dueDate: null,
            };
        } else if (activeTab === 'meetings') {
            mutation = editMode === 'edit' ? UPDATE_MEETING : CREATE_MEETING;
            variables = {
                id: editMode === 'edit' ? editingId : undefined,
                contactId: editMode === 'create' ? id : undefined,
                title: cleanTitle,
                meetingType,
                scheduledStart: new Date().toISOString(),
                location: cleanLoc,
                notes: cleanDesc,
                status,
            };
        } else {
            mutation = editMode === 'edit' ? UPDATE_TRANSACTION : CREATE_TRANSACTION;
            variables = {
                id: editMode === 'edit' ? editingId : undefined,
                contactId: editMode === 'create' ? id : undefined,
                amount: cleanAmount,
                currency,
                category,
                status,
                notes: cleanDesc,
                transactionDate: new Date().toISOString(),
            };
        }

        const result = await executeGraphQLMutation(mutation.loc?.source.body || '', variables);
        setCreating(false);

        if (result.error) {
            Alert.alert('Error', result.error.message);
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setShowCreateModal(false);
            resetForms();
            fetchData();
        }
    };

    const handleDelete = async (itemId: string, type: TabType) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Alert.alert('Delete', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    let mutation;
                    if (type === 'tasks') mutation = DELETE_TASK;
                    else if (type === 'meetings') mutation = DELETE_MEETING;
                    else mutation = DELETE_TRANSACTION;

                    const result = await executeGraphQLMutation(mutation.loc?.source.body || '', { id: itemId });
                    if (!result.error) fetchData();
                },
            },
        ]);
    };

    const resetForms = () => {
        setTitle('');
        setDescription('');
        setPriority('medium');
        setStatus('pending');
        setMeetingType('call');
        setLocation('');
        setAmount('');
        setCategory('To Pay');
        setEditMode('create');
        setEditingId(null);
    };

    const startEdit = (item: any, type: TabType) => {
        setEditMode('edit');
        setEditingId(item.id);

        if (type === 'tasks') {
            setTitle(item.title);
            setDescription(item.description || '');
            setPriority(item.priority || 'medium');
            setStatus(item.status || 'pending');
        } else if (type === 'meetings') {
            setTitle(item.title);
            setMeetingType(item.meeting_type || 'call');
            setLocation(item.location || '');
            setDescription(item.notes || '');
        } else {
            setAmount(item.amount.toString());
            setCategory(item.category || 'To Pay');
            setDescription(item.notes || '');
            setStatus(item.status || 'pending');
        }
        setShowCreateModal(true);
    };

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!contact) return null;

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />

            <LinearGradient
                colors={[theme.surface, theme.background]}
                style={styles.headerGradient}
            >
                {/* Custom Header */}
                <View style={[styles.navHeader, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
                    <IconButton icon="arrow-back" onPress={() => router.back()} variant="ghost" />
                    <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Details</Text>
                    <IconButton icon="pencil" onPress={() => setShowProfileModal(true)} variant="ghost" />
                </View>

                <View style={styles.profileHeader}>
                    <Avatar name={contact.name} size="xl" />
                    <Text style={[styles.profileName, { color: theme.textPrimary }]}>{contact.name}</Text>

                    {(contact.designation || contact.company_name) && (
                        <Text style={[styles.profileSubtitle, { color: theme.textSecondary }]}>
                            {contact.designation}
                            {contact.designation && contact.company_name ? ' • ' : ''}
                            {contact.company_name}
                        </Text>
                    )}

                    <View style={styles.contactRow}>
                        {contact.phone && (
                            <Badge label={contact.phone} variant="default" style={{ backgroundColor: theme.surface }} />
                        )}
                        {contact.email && (
                            <Badge label={contact.email} variant="default" style={{ backgroundColor: theme.surface }} />
                        )}
                    </View>
                </View>

                {/* Tabs */}
                <View style={styles.tabContainer}>
                    {(['tasks', 'meetings', 'transactions'] as TabType[]).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            style={[
                                styles.tab,
                                activeTab === tab && { borderBottomColor: theme.primary, borderBottomWidth: 2 }
                            ]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[
                                styles.tabText,
                                { color: activeTab === tab ? theme.primary : theme.textSecondary }
                            ]}>
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Show content only if profile is completed */}
                {!contact.is_completed_profile ? (
                    <View style={styles.centerContainer}>
                        <Ionicons name="information-circle-outline" size={64} color={theme.textTertiary} />
                        <Text style={[styles.emptyText, { color: theme.textSecondary, marginBottom: spacing.lg }]}>
                            Complete contact profile to add tasks and meetings.
                        </Text>
                        <Button title="Complete Profile" onPress={() => setShowProfileModal(true)} />
                    </View>
                ) : (
                    <></>
                )}
            </LinearGradient>

            {contact.is_completed_profile && (
                <>
                    <ScrollView
                        contentContainerStyle={styles.content}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor={theme.primary} />}
                    >
                        {activeTab === 'tasks' && tasks.map(task => (
                            <Card key={task.id} style={styles.itemCard} onPress={() => startEdit(task, 'tasks')} elevated>
                                <View style={styles.row}>
                                    <View style={styles.itemContent}>
                                        <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{task.title}</Text>
                                        <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>{task.priority} • {task.status.replace('_', ' ')}</Text>
                                    </View>
                                    <IconButton icon="trash-outline" variant="ghost" size="sm" onPress={() => handleDelete(task.id, 'tasks')} />
                                </View>
                            </Card>
                        ))}

                        {activeTab === 'meetings' && meetings.map(meeting => (
                            <Card key={meeting.id} style={styles.itemCard} onPress={() => startEdit(meeting, 'meetings')} elevated>
                                <View style={styles.row}>
                                    <View style={styles.itemContent}>
                                        <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{meeting.title}</Text>
                                        <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>{meeting.meeting_type} • {meeting.location || 'No location'}</Text>
                                    </View>
                                    <IconButton icon="trash-outline" variant="ghost" size="sm" onPress={() => handleDelete(meeting.id, 'meetings')} />
                                </View>
                            </Card>
                        ))}

                        {activeTab === 'transactions' && transactions.map(trans => (
                            <Card key={trans.id} style={styles.itemCard} onPress={() => startEdit(trans, 'transactions')} elevated>
                                <View style={styles.row}>
                                    <View style={styles.itemContent}>
                                        <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{trans.amount} {trans.currency}</Text>
                                        <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>{trans.category} • {trans.status}</Text>
                                    </View>
                                    <IconButton icon="trash-outline" variant="ghost" size="sm" onPress={() => handleDelete(trans.id, 'transactions')} />
                                </View>
                            </Card>
                        ))}

                        {/* Empty States */}
                        {activeTab === 'tasks' && tasks.length === 0 && <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No tasks found</Text>}
                        {activeTab === 'meetings' && meetings.length === 0 && <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No meetings found</Text>}
                        {activeTab === 'transactions' && transactions.length === 0 && <Text style={[styles.emptyText, { color: theme.textTertiary }]}>No transactions found</Text>}
                    </ScrollView>

                    <AnimatedFAB
                        icon="add"
                        onPress={() => {
                            resetForms();
                            setShowCreateModal(true);
                        }}
                        position="bottom-right"
                    />
                </>
            )}

            {/* Create/Edit Modal */}
            <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
                <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
                    <View style={styles.modalHeader}>
                        <Button title="Cancel" variant="ghost" onPress={() => setShowCreateModal(false)} />
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                            {editMode === 'edit' ? 'Edit' : 'New'} {activeTab.slice(0, -1)}
                        </Text>
                        <Button title="Save" onPress={handleCreate} loading={creating} disabled={creating} />
                    </View>

                    <ScrollView contentContainerStyle={styles.formContent}>
                        {/* Dynamic Form Fields based on Active Tab */}
                        {activeTab === 'tasks' && (
                            <>
                                <Input label="Title" value={title} onChangeText={setTitle} placeholder="Task title" />
                                <Input label="Description" value={description} onChangeText={setDescription} placeholder="Description" />
                                <View style={styles.segmentedControl}>
                                    {(['low', 'medium', 'high'] as const).map(p => (
                                        <TouchableOpacity key={p} onPress={() => setPriority(p)} style={[styles.segment, priority === p && { backgroundColor: theme.primary }]}>
                                            <Text style={[styles.segmentText, priority === p && { color: '#fff' }, { color: theme.textPrimary }]}>{p.toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Input label="Due Date" value={description} onChangeText={setDescription} placeholder="YYYY-MM-DD" />
                                <View style={styles.segmentedControl}>
                                    {(['pending', 'in_progress', 'completed'] as const).map(s => (
                                        <TouchableOpacity key={s} onPress={() => setStatus(s)} style={[styles.segment, status === s && { backgroundColor: theme.primary }]}>
                                            <Text style={[styles.segmentText, status === s && { color: '#fff' }, { color: theme.textPrimary }]}>{s.replace('_', ' ').toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                        {activeTab === 'meetings' && (
                            <>
                                <Input label="Title" value={title} onChangeText={setTitle} placeholder="Meeting title" />
                                <View style={styles.segmentedControl}>
                                    {(['call', 'video', 'in_person'] as const).map(t => (
                                        <TouchableOpacity key={t} onPress={() => setMeetingType(t)} style={[styles.segment, meetingType === t && { backgroundColor: theme.primary }]}>
                                            <Text style={[styles.segmentText, meetingType === t && { color: '#fff' }, { color: theme.textPrimary }]}>{t.replace('_', ' ').toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <Input label="Location" value={location} onChangeText={setLocation} placeholder="Location / Link" />
                                <Input label="Date" value={description} onChangeText={setDescription} placeholder="YYYY-MM-DD HH:MM" />
                                <Input label="Notes" value={description} onChangeText={setDescription} placeholder="Meeting notes" />
                                <View style={styles.segmentedControl}>
                                    {(['scheduled', 'completed', 'cancelled'] as const).map(s => (
                                        <TouchableOpacity key={s} onPress={() => setStatus(s)} style={[styles.segment, status === s && { backgroundColor: theme.primary }]}>
                                            <Text style={[styles.segmentText, status === s && { color: '#fff' }, { color: theme.textPrimary }]}>{s.toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                        {activeTab === 'transactions' && (
                            <>
                                <Input label="Amount" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="0.00" />
                                <Input label="Notes" value={description} onChangeText={setDescription} placeholder="Transaction notes" />
                                <View style={styles.segmentedControl}>
                                    {(['To Pay', 'To Receive'] as const).map(c => (
                                        <TouchableOpacity key={c} onPress={() => setCategory(c)} style={[styles.segment, category === c && { backgroundColor: theme.primary }]}>
                                            <Text style={[styles.segmentText, category === c && { color: '#fff' }, { color: theme.textPrimary }]}>{c}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.segmentedControl}>
                                    {(['pending', 'completed', 'cancelled'] as const).map(s => (
                                        <TouchableOpacity key={s} onPress={() => setStatus(s)} style={[styles.segment, status === s && { backgroundColor: theme.primary }]}>
                                            <Text style={[styles.segmentText, status === s && { color: '#fff' }, { color: theme.textPrimary }]}>{s.toUpperCase()}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </>
                        )}
                    </ScrollView>
                </View>
            </Modal>

            {/* Profile Edit/Complete Modal */}
            <Modal visible={showProfileModal || (!loading && contact && !contact.is_completed_profile)} animationType="slide" presentationStyle="pageSheet">
                <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
                    <View style={styles.modalHeader}>
                        {contact.is_completed_profile && <Button title="Cancel" variant="ghost" onPress={() => setShowProfileModal(false)} />}
                        {!contact.is_completed_profile && <View />}
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                            {contact.is_completed_profile ? 'Edit Profile' : 'Complete Profile'}
                        </Text>
                        <Button title="Save" onPress={handleCompleteProfile} loading={creating} disabled={creating} />
                    </View>
                    <ScrollView contentContainerStyle={styles.formContent}>
                        <Input label="Name *" value={profileName} onChangeText={setProfileName} placeholder="Contact Name" />
                        <Input label="Phone" value={profilePhone} onChangeText={setProfilePhone} placeholder="Phone Number" keyboardType="phone-pad" />
                        <Input label="Email" value={profileEmail} onChangeText={setProfileEmail} placeholder="Email Address" keyboardType="email-address" />
                        <Input label="Designation" value={profileDesignation} onChangeText={setProfileDesignation} placeholder="Designation" />
                        <Input label="Company" value={profileCompany} onChangeText={setProfileCompany} placeholder="Company Name" />
                        <Input label="Tags" value={profileTags} onChangeText={setProfileTags} placeholder="Tags (comma separated)" />
                        <Input label="Notes" value={profileNotes} onChangeText={setProfileNotes} placeholder="Add notes..." multiline />
                    </ScrollView>
                </View>
            </Modal>
        </View>

    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerGradient: { paddingBottom: spacing.md },
    navHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: spacing.md },
    headerTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold },
    profileHeader: { alignItems: 'center', paddingVertical: spacing.lg },
    profileName: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, marginTop: spacing.md },
    profileSubtitle: { fontSize: typography.fontSize.base, marginTop: 4 },
    contactRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
    tabContainer: { flexDirection: 'row', paddingHorizontal: spacing.lg, marginTop: spacing.md },
    tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm },
    tabText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium },
    content: { padding: spacing.lg, paddingBottom: 100 },
    itemCard: { marginBottom: spacing.md },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    itemContent: { flex: 1 },
    itemTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
    itemSubtitle: { fontSize: typography.fontSize.sm, marginTop: 2, textTransform: 'capitalize' },
    emptyText: { textAlign: 'center', marginTop: spacing.xl, fontSize: typography.fontSize.base },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md },
    modalTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold },
    formContent: { padding: spacing.lg },
    segmentedControl: { flexDirection: 'row', marginVertical: spacing.md, gap: spacing.sm },
    segment: { flex: 1, padding: spacing.sm, borderRadius: borderRadius.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(150,150,150,0.2)' },
    segmentText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
});
