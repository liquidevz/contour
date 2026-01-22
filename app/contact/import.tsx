/**
 * Import Contacts Screen
 * 
 * Allows users to select and import multiple contacts from their device
 */

import ScreenHeader from '@/components/ui/ScreenHeader';
import { spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { CREATE_CONTACT } from '@/graphql/mutations';
import { executeGraphQLMutation } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import * as Contacts from 'expo-contacts';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface DeviceContact {
    id: string;
    name: string;
    phoneNumbers?: { number?: string }[];
    emails?: { email?: string }[];
    selected: boolean;
}

export default function ImportContactsScreen() {
    const { theme, colorScheme } = useTheme();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [deviceContacts, setDeviceContacts] = useState<DeviceContact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchDeviceContacts();
    }, []);

    const fetchDeviceContacts = async () => {
        setLoading(true);
        const { data } = await Contacts.getContactsAsync({
            fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails, Contacts.Fields.Company],
        });

        const formattedContacts: DeviceContact[] = data.map(contact => ({
            id: contact.id || Math.random().toString(),
            name: contact.name || 'Unknown',
            phoneNumbers: contact.phoneNumbers,
            emails: contact.emails,
            selected: false,
        }));

        setDeviceContacts(formattedContacts);
        setLoading(false);
    };

    const toggleContact = (id: string) => {
        setDeviceContacts(prev =>
            prev.map(contact =>
                contact.id === id ? { ...contact, selected: !contact.selected } : contact
            )
        );
    };

    const toggleSelectAll = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        const allSelected = deviceContacts.every(c => c.selected);
        setDeviceContacts(prev =>
            prev.map(contact => ({ ...contact, selected: !allSelected }))
        );
    };

    const handleImport = async () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        const selectedContacts = deviceContacts.filter(c => c.selected);

        if (selectedContacts.length === 0) {
            Alert.alert('No Selection', 'Please select at least one contact to import.');
            return;
        }

        setImporting(true);
        let successCount = 0;
        let failCount = 0;

        for (const contact of selectedContacts) {
            try {
                const variables = {
                    name: contact.name,
                    email: contact.emails?.[0]?.email || '',
                    phone: contact.phoneNumbers?.[0]?.number || '',
                    companyName: '',
                    designation: '',
                };

                const result = await executeGraphQLMutation(CREATE_CONTACT.loc?.source.body || '', variables);
                if (!result.error) {
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error) {
                failCount++;
            }
        }

        setImporting(false);
        Alert.alert(
            'Import Complete',
            `Successfully imported ${successCount} contact(s). ${failCount > 0 ? `Failed: ${failCount}` : ''}`,
            [
                {
                    text: 'OK',
                    onPress: () => router.back(),
                }
            ]
        );
    };

    const filteredContacts = searchQuery.trim()
        ? deviceContacts.filter(contact =>
            contact.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : deviceContacts;

    const selectedCount = deviceContacts.filter(c => c.selected).length;

    const renderContact = ({ item }: { item: DeviceContact }) => (
        <TouchableOpacity
            style={[styles.contactItem, { borderBottomColor: theme.border }]}
            onPress={() => {
                if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                toggleContact(item.id);
            }}
            activeOpacity={0.7}
        >
            <View style={[
                styles.checkbox,
                {
                    borderColor: item.selected ? theme.accent : theme.border,
                    backgroundColor: item.selected ? theme.accent : 'transparent',
                }
            ]}>
                {item.selected && (
                    <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                )}
            </View>

            <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={[styles.contactDetail, { color: theme.textSecondary }]} numberOfLines={1}>
                    {item.phoneNumbers?.[0]?.number || item.emails?.[0]?.email || 'No contact info'}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: theme.background }]}>
                <Stack.Screen options={{ headerShown: false }} />
                <StatusBar barStyle={colorScheme === 'dark' ? 'dark-content' : 'light-content'} />
                <ScreenHeader
                    title="Import Contacts"
                    subtitle="Select contacts"
                    onBack={() => router.back()}
                />
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.accent} />
                    <Text style={[styles.loadingText, { color: theme.textSecondary }]}>
                        Loading contacts...
                    </Text>
                </View>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle={colorScheme === 'dark' ? 'dark-content' : 'light-content'} />

            <ScreenHeader
                title="Import Contacts"
                subtitle={`${selectedCount} selected`}
                onBack={() => router.back()}
                showSearch={true}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search contacts..."
            />

            {/* Selection Controls */}
            <View style={[styles.controls, { borderBottomColor: theme.border }]}>
                <TouchableOpacity
                    style={styles.selectAllButton}
                    onPress={toggleSelectAll}
                >
                    <Ionicons
                        name={deviceContacts.every(c => c.selected) ? "checkbox" : "square-outline"}
                        size={24}
                        color={theme.accent}
                    />
                    <Text style={[styles.selectAllText, { color: theme.textPrimary }]}>
                        Select All ({deviceContacts.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.importButton,
                        {
                            backgroundColor: selectedCount > 0 ? theme.accent : theme.backgroundSecondary,
                        }
                    ]}
                    onPress={handleImport}
                    disabled={selectedCount === 0 || importing}
                >
                    {importing ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <>
                            <Ionicons name="cloud-upload-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.importButtonText}>
                                Import ({selectedCount})
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* Contacts List */}
            <FlatList
                data={filteredContacts}
                renderItem={renderContact}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: spacing.md,
        fontSize: typography.fontSize.base,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
    },
    selectAllButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    selectAllText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
    },
    importButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
        borderRadius: 8,
    },
    importButtonText: {
        color: '#FFFFFF',
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
    },
    listContent: {
        paddingBottom: spacing.xl,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 0.5,
        gap: spacing.md,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contactInfo: {
        flex: 1,
    },
    contactName: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: 2,
    },
    contactDetail: {
        fontSize: typography.fontSize.sm,
    },
});
