/**
 * Contact Details Screen
 * 
 * Displays full contact information and related Tasks, Meetings, and Transactions.
 * Uses a tabbed interface (Custom Segmented Control) to switch between views.
 */

import Badge from '@/components/ui/Badge'; // Assuming Badge component exists
import Card from '@/components/ui/Card'; // Assuming Card component exists
import ScreenHeader from '@/components/ui/ScreenHeader';
import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_CONTACT_DASHBOARD } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Linking,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Types based on the GraphQL query
interface RelatedTask {
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date: string;
}

interface RelatedMeeting {
    id: string;
    title: string;
    meeting_type: string;
    status: string;
    scheduled_start: string;
}

interface RelatedTransaction {
    id: string;
    amount: number;
    currency: string;
    category: string;
    status: string;
    transaction_date: string;
}

interface ContactDetails {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    designation: string | null;
    company_name: string | null;
    tags: string[] | null;
    notes: string | null;
    tasksCollection: { edges: { node: RelatedTask }[] };
    meetingsCollection: { edges: { node: RelatedMeeting }[] };
    transactionsCollection: { edges: { node: RelatedTransaction }[] };
}

type TabType = 'info' | 'tasks' | 'meetings' | 'transactions';

export default function ContactDetailsScreen() {
    const { id } = useLocalSearchParams(); // Get ID from route params
    const router = useRouter();
    const { theme, colorScheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [contact, setContact] = useState<ContactDetails | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('info');

    const fetchContactDetails = async () => {
        setLoading(true);
        if (typeof id !== 'string') return;

        const result = await executeGraphQL(GET_CONTACT_DASHBOARD.loc?.source.body || '', { id });

        if (result.data?.contactsCollection?.edges?.[0]?.node) {
            const node = result.data.contactsCollection.edges[0].node;
            // Parse tags if necessary (similar to contacts list logic)
            if (node.tags && typeof node.tags === 'string') {
                try {
                    if (node.tags.startsWith('[')) {
                        node.tags = JSON.parse(node.tags);
                    } else {
                        node.tags = node.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
                    }
                } catch (e) {
                    node.tags = [];
                }
            }
            setContact(node);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchContactDetails();
    }, [id]);

    const handleCall = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (contact?.phone) Linking.openURL(`tel:${contact.phone}`);
    };

    const handleEmail = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        if (contact?.email) Linking.openURL(`mailto:${contact.email}`);
    };

    const handleEdit = () => {
        router.push(`/contact/edit?id=${id}`);
    };

    // --- Render Helpers ---

    const renderTabs = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContainer}
            style={{ flexGrow: 0 }}
        >
            {['info', 'tasks', 'meetings', 'transactions'].map((tab) => (
                <TouchableOpacity
                    key={tab}
                    onPress={() => {
                        if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        setActiveTab(tab as TabType);
                    }}
                    style={[
                        styles.tab,
                        activeTab === tab && styles.activeTab,
                        activeTab === tab && { backgroundColor: theme.primary }
                    ]}
                >
                    <Text style={[
                        styles.tabText,
                        activeTab === tab ? styles.activeTabText : { color: theme.textSecondary }
                    ]}>
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );

    const renderInfoTab = () => {
        if (!contact) return null;
        return (
            <View style={styles.tabContent}>
                <Card style={styles.infoCard} elevated>
                    <View style={styles.infoRow}>
                        <Ionicons name="call-outline" size={20} color={theme.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.textPrimary }]}>
                            {contact.phone || 'No phone number'}
                        </Text>
                        {contact.phone && (
                            <TouchableOpacity onPress={handleCall} style={styles.actionLink}>
                                <Text style={[styles.actionLinkText, { color: theme.primary }]}>Call</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Ionicons name="mail-outline" size={20} color={theme.textSecondary} />
                        <Text style={[styles.infoText, { color: theme.textPrimary }]}>
                            {contact.email || 'No email address'}
                        </Text>
                        {contact.email && (
                            <TouchableOpacity onPress={handleEmail} style={styles.actionLink}>
                                <Text style={[styles.actionLinkText, { color: theme.primary }]}>Email</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.divider} />
                    <View style={styles.infoRow}>
                        <Ionicons name="business-outline" size={20} color={theme.textSecondary} />
                        <View>
                            <Text style={[styles.infoText, { color: theme.textPrimary }]}>
                                {contact.company_name || 'No Company'}
                            </Text>
                            {contact.designation && (
                                <Text style={[styles.infoSubtext, { color: theme.textSecondary }]}>
                                    {contact.designation}
                                </Text>
                            )}
                        </View>
                    </View>
                </Card>

                {contact.notes && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Notes</Text>
                        <Card style={styles.noteCard}>
                            <Text style={{ color: theme.textSecondary, lineHeight: 22 }}>
                                {contact.notes}
                            </Text>
                        </Card>
                    </View>
                )}

                {contact.tags && contact.tags.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Tags</Text>
                        <View style={styles.tagsWrapper}>
                            {contact.tags.map((tag, idx) => (
                                <Badge key={idx} label={tag} variant="default" style={{ backgroundColor: theme.backgroundSecondary }} />
                            ))}
                        </View>
                    </View>
                )}
            </View>
        );
    };

    const renderTasksTab = () => {
        const tasks = contact?.tasksCollection?.edges.map(e => e.node) || [];

        return (
            <View style={styles.tabContent}>
                <TouchableOpacity
                    style={[styles.addButton, { borderColor: theme.border }]}
                    // Navigate to create task with pre-filled contact ID (Not implemented yet, just illustrative)
                    onPress={() => {
                        if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        router.push({ pathname: '/tasks/edit', params: { contactId: contact?.id } });
                    }}
                >
                    <Ionicons name="add" size={24} color={theme.primary} />
                    <Text style={[styles.addButtonText, { color: theme.primary }]}>Add Task</Text>
                </TouchableOpacity>

                {tasks.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No tasks yet.</Text>
                ) : (
                    tasks.map(task => (
                        <Card
                            key={task.id}
                            style={styles.itemCard}
                            onPress={() => router.push(`/tasks/${task.id}`)} // Route to Task Details
                        >
                            <View style={styles.itemRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{task.title}</Text>
                                    <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                                        Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Date'}
                                    </Text>
                                </View>
                                <Badge
                                    label={task.status}
                                    variant="outline"
                                    style={{ borderColor: theme.border }}
                                />
                            </View>
                        </Card>
                    ))
                )}
            </View>
        );
    };

    const renderMeetingsTab = () => {
        const meetings = contact?.meetingsCollection?.edges.map(e => e.node) || [];

        return (
            <View style={styles.tabContent}>
                <TouchableOpacity
                    style={[styles.addButton, { borderColor: theme.border }]}
                    onPress={() => {
                        if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        router.push({ pathname: '/meetings/edit', params: { contactId: contact?.id } });
                    }}
                >
                    <Ionicons name="add" size={24} color={theme.primary} />
                    <Text style={[styles.addButtonText, { color: theme.primary }]}>Schedule Meeting</Text>
                </TouchableOpacity>

                {meetings.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No meetings scheduled.</Text>
                ) : (
                    meetings.map(meeting => (
                        <Card
                            key={meeting.id}
                            style={styles.itemCard}
                            onPress={() => router.push(`/meetings/${meeting.id}`)}
                        >
                            <View style={styles.itemRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{meeting.title}</Text>
                                    <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                                        {new Date(meeting.scheduled_start).toLocaleString()}
                                    </Text>
                                </View>
                                <Badge
                                    label={meeting.meeting_type}
                                    variant="default"
                                    style={{ backgroundColor: theme.backgroundSecondary }}
                                />
                            </View>
                        </Card>
                    ))
                )}
            </View>
        );
    };

    const renderTransactionsTab = () => {
        const transactions = contact?.transactionsCollection?.edges.map(e => e.node) || [];

        return (
            <View style={styles.tabContent}>
                <TouchableOpacity
                    style={[styles.addButton, { borderColor: theme.border }]}
                    onPress={() => {
                        if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        router.push({ pathname: '/transactions/edit', params: { contactId: contact?.id } });
                    }}
                >
                    <Ionicons name="add" size={24} color={theme.primary} />
                    <Text style={[styles.addButtonText, { color: theme.primary }]}>Record Transaction</Text>
                </TouchableOpacity>

                {transactions.length === 0 ? (
                    <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No transactions recorded.</Text>
                ) : (
                    transactions.map(transaction => (
                        <Card
                            key={transaction.id}
                            style={styles.itemCard}
                            onPress={() => router.push(`/transactions/${transaction.id}`)}
                        >
                            <View style={styles.itemRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{transaction.category}</Text>
                                    <Text style={[styles.itemSubtitle, { color: theme.textSecondary }]}>
                                        {new Date(transaction.transaction_date).toLocaleDateString()}
                                    </Text>
                                </View>
                                <Text style={[styles.amountText, { color: theme.textPrimary }]}>
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: transaction.currency || 'USD' }).format(transaction.amount)}
                                </Text>
                            </View>
                        </Card>
                    ))
                )}
            </View>
        );
    };


    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!contact) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textSecondary }}>Contact not found.</Text>
                <TouchableOpacity
                    onPress={() => {
                        if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                        router.back();
                    }}
                    style={{ marginTop: 20 }}
                >
                    <Text style={{ color: theme.primary }}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colorScheme === 'dark' ? 'dark-content' : 'light-content'} backgroundColor="transparent" translucent />

            <ScreenHeader
                title={contact.name}
                subtitle={contact.designation && contact.company_name
                    ? `${contact.designation} at ${contact.company_name}`
                    : (contact.designation || contact.company_name || '')}
                onBack={() => {
                    if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    router.back();
                }}
                onAction={() => {
                    if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    handleEdit();
                }}
                actionIcon="pencil"
                customAvatarName={contact.name}
                showNotifications={false}
            />

            {/* Content Body */}
            <View style={styles.body}>
                {renderTabs()}

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    {activeTab === 'info' && renderInfoTab()}
                    {activeTab === 'tasks' && renderTasksTab()}
                    {activeTab === 'meetings' && renderMeetingsTab()}
                    {activeTab === 'transactions' && renderTransactionsTab()}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    profileHeader: { alignItems: 'center', marginBottom: spacing.md, marginTop: spacing.md },


    body: { flex: 1 },
    tabsContainer: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.md,
        gap: spacing.sm,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'transparent',
    },
    activeTab: {
        // backgroundColor matches primary (set inline)
    },
    tabText: { fontSize: 14, fontWeight: '600' },
    activeTabText: { color: '#fff' },

    scrollContent: { padding: spacing.md, paddingBottom: 100 },
    tabContent: { gap: spacing.md },

    infoCard: { padding: spacing.md, borderRadius: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
    infoText: { fontSize: 16, flex: 1 },
    infoSubtext: { fontSize: 14, marginTop: 2 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: spacing.xs },
    actionLink: { paddingHorizontal: 12, paddingVertical: 4, backgroundColor: '#f0f9ff', borderRadius: 8 },
    actionLinkText: { fontSize: 12, fontWeight: '600' },

    section: { marginTop: spacing.lg },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: spacing.sm },
    noteCard: { padding: spacing.md, borderRadius: 12, backgroundColor: '#f9f9f9' }, // Light gray for notes
    tagsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },

    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 12,
        marginBottom: spacing.sm
    },
    addButtonText: { fontSize: 16, fontWeight: '600', marginLeft: 8 },

    emptyText: { textAlign: 'center', marginTop: spacing.lg, fontSize: 16 },

    itemCard: { padding: spacing.md, borderRadius: 12, marginBottom: spacing.sm },
    itemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    itemTitle: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
    itemSubtitle: { fontSize: 12 },
    amountText: { fontSize: 16, fontWeight: 'bold' },
});
