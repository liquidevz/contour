/**
 * Home Screen - Contacts List
 * 
 * Premium redesign with:
 * - Gradient backgrounds
 * - Animated interactions
 * - Search functionality
 * - Modern contact cards
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  Modal,
  RefreshControl,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Contacts from 'expo-contacts';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { executeGraphQL, executeGraphQLMutation } from '@/lib/graphql';
import { GET_CONTACTS } from '@/graphql/queries';
import { CREATE_CONTACT, DELETE_CONTACT } from '@/graphql/mutations';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/tokens';

// UI Components
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import AnimatedFAB from '@/components/ui/AnimatedFAB';
import Badge from '@/components/ui/Badge';
import IconButton from '@/components/ui/IconButton';

interface Contact {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  designation: string | null;
  company_name: string | null;
  tags: string[] | null;
  is_completed_profile: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme, colorScheme } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Contact Picker State
  const [allPhoneContacts, setAllPhoneContacts] = useState<Contacts.Contact[]>([]);
  const [contactListModalVisible, setContactListModalVisible] = useState(false);
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());

  // Form State
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [designation, setDesignation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const fetchContacts = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const result = await executeGraphQL(GET_CONTACTS.loc?.source.body || '');

    if (result.data) {
      const edges = result.data.contactsCollection?.edges || [];
      const nodes = edges.map((edge: any) => {
        const node = edge.node;
        // Safely handle tags if they come as string
        if (node.tags && typeof node.tags === 'string') {
          try {
            // If it's a JSON string
            if (node.tags.startsWith('[')) {
              node.tags = JSON.parse(node.tags);
            } else {
              // If it's comma separated
              node.tags = node.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
            }
          } catch (e) {
            console.warn('Failed to parse tags for contact:', node.id, e);
            node.tags = [];
          }
        }
        return node;
      });
      setContacts(nodes);
      setFilteredContacts(nodes);
    } else if (result.error) {
      console.error('Fetch error:', result.error);
    }

    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  // Filter contacts when search query changes
  useEffect(() => {
    if (!searchQuery) {
      setFilteredContacts(contacts);
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = contacts.filter(
        c =>
          c.name.toLowerCase().includes(lowerQuery) ||
          c.designation?.toLowerCase().includes(lowerQuery) ||
          c.company_name?.toLowerCase().includes(lowerQuery)
      );
      setFilteredContacts(filtered);
    }
  }, [searchQuery, contacts]);

  const handleImportContact = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const { status } = await Contacts.requestPermissionsAsync();
    if (status === 'granted') {
      try {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.Emails, Contacts.Fields.PhoneNumbers, Contacts.Fields.Company],
        });

        if (data.length > 0) {
          setAllPhoneContacts(data);
          setSelectedContactIds(new Set());
          setContactListModalVisible(true);
        } else {
          Alert.alert('No contacts found on device');
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to access contacts');
      }
    } else {
      Alert.alert('Permission denied', 'Allow access to contacts to import.');
    }
  };

  const toggleContactSelection = (contactId: string) => {
    const newSelected = new Set(selectedContactIds);
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId);
    } else {
      newSelected.add(contactId);
    }
    setSelectedContactIds(newSelected);
  };

  const handleBulkImport = async () => {
    if (selectedContactIds.size === 0) return;

    setCreating(true);
    let successCount = 0;

    const selectedContacts = allPhoneContacts.filter(c => selectedContactIds.has(c.id || ''));

    for (const contact of selectedContacts) {
      // Prioritize mobile number, otherwise take the first available
      let phoneNumber = '';
      if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
        const mobile = contact.phoneNumbers.find(p => p.label === 'mobile' || p.label === 'Mobile');
        phoneNumber = (mobile ? mobile.number : contact.phoneNumbers[0].number) || '';
      }

      const name = contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
      const email = contact.emails?.[0]?.email || null;
      const companyName = contact.company || null;

      if (!name) continue;

      try {
        let result = await executeGraphQLMutation(
          CREATE_CONTACT.loc?.source.body || '',
          {
            name,
            phone: phoneNumber || null,
            email,
            designation: null,
            companyName,
            tags: JSON.stringify(['imported']),
          }
        );

        if (result.error) {
          if (result.error.message.includes('unique constraint') || result.error.message.includes('contacts_name_key')) {
            // Retry with modified name
            const newName = `${name} (${Math.floor(Math.random() * 1000)})`;
            result = await executeGraphQLMutation(
              CREATE_CONTACT.loc?.source.body || '',
              {
                name: newName,
                phone: phoneNumber || null,
                email,
                designation: null,
                companyName,
                tags: JSON.stringify(['imported']),
              }
            );
          }
        }

        if (!result.error) {
          successCount++;
        }
      } catch (e) {
        console.error('Failed to import contact', name, e);
      }
    }

    setCreating(false);
    setContactListModalVisible(false);
    fetchContacts();

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Success', `Imported ${successCount} contacts`);
  };

  const handleCreate = async () => {
    if (!name) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setCreating(true);

    // Parse tags
    const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(t => t);

    const result = await executeGraphQLMutation(
      CREATE_CONTACT.loc?.source.body || '',
      {
        name,
        phone: phone || null,
        email: email || null,
        designation: designation || null,
        companyName: companyName || null,
        tags: JSON.stringify(tagsArray),
      }
    );

    setCreating(false);

    if (result.error) {
      Alert.alert('Error', result.error.message);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModalVisible(false);
      resetForm();
      fetchContacts();
    }
  };

  const handleDeleteContact = (id: string, name: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      'Delete Contact',
      `Delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await executeGraphQLMutation(
              DELETE_CONTACT.loc?.source.body || '',
              { id }
            );

            if (result.error) {
              Alert.alert('Error', result.error.message);
            } else {
              fetchContacts();
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setEmail('');
    setDesignation('');
    setCompanyName('');
    setTagsInput('');
  };

  const renderContactItem = ({ item }: { item: Contact }) => (
    <Card
      style={styles.card}
      onPress={() => router.push(`/contact/${item.id}`)}
      elevated
    >
      <View style={styles.cardRow}>
        <Avatar name={item.name} size="md" />

        <View style={styles.cardContent}>
          <Text style={[styles.cardName, { color: theme.textPrimary }]}>{item.name}</Text>


          {Array.isArray(item.tags) && item.tags.length > 0 && (
            <View style={styles.tagContainer}>
              {item.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} label={tag} variant="default" />
              ))}
              {item.tags.length > 2 && (
                <Badge label={`+${item.tags.length - 2}`} variant="default" />
              )}
            </View>
          )}
        </View>

        <IconButton
          icon="trash-outline"
          size="sm"
          variant="default"
          onPress={() => handleDeleteContact(item.id, item.name)}
        />
      </View>
    </Card>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={
          colorScheme === 'dark'
            ? ['#0a0a0a', '#1a1a1a']
            : ['#ffffff', '#f8f9fa']
        }
        style={styles.gradient}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Contacts</Text>
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {contacts.length} {contacts.length === 1 ? 'Contact' : 'Contacts'}
            </Text>
          </View>
          <IconButton
            icon="add-circle-outline"
            size="lg"
            variant="primary"
            onPress={handleImportContact}
          />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon="search-outline"
            containerStyle={{ marginBottom: 0 }}
          />
        </View>

        {/* Contact List */}
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContactItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchContacts(true)}
                tintColor={theme.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.centerContainer}>
                <Ionicons name="people-outline" size={64} color={theme.textTertiary} />
                <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                  {searchQuery ? 'No matching contacts found' : 'No contacts yet'}
                </Text>
                {!searchQuery && (
                  <Button
                    title="Import Contacts"
                    onPress={handleImportContact}
                    style={{ marginTop: spacing.lg }}
                  />
                )}
              </View>
            }
          />
        )}

        {/* Create FAB - Now triggers Import Flow */}
        <AnimatedFAB
          icon="add"
          onPress={handleImportContact}
          label="New Contact"
          position="bottom-right"
        />

        {/* Contact Picker Modal */}
        <Modal visible={contactListModalVisible} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Button title="Cancel" onPress={() => setContactListModalVisible(false)} variant="ghost" size="sm" />
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>
                {selectedContactIds.size === 0 ? 'Select Contacts' : `${selectedContactIds.size} Selected`}
              </Text>
              <Button
                title={selectedContactIds.size > 0 ? `Import (${selectedContactIds.size})` : "Manual Create"}
                onPress={() => {
                  if (selectedContactIds.size > 0) {
                    handleBulkImport();
                  } else {
                    setContactListModalVisible(false);
                    setModalVisible(true);
                  }
                }}
                variant={selectedContactIds.size > 0 ? "primary" : "ghost"}
                size="sm"
                loading={creating}
              />
            </View>
            <FlatList
              data={allPhoneContacts}
              keyExtractor={(item) => (item as any).id || Math.random().toString()}
              renderItem={({ item }) => {
                const isSelected = selectedContactIds.has((item as any).id);
                return (
                  <TouchableOpacity
                    style={[
                      styles.contactRow,
                      { borderBottomColor: theme.border },
                      isSelected && { backgroundColor: theme.primary + '20' } // 20% opacity primary color
                    ]}
                    onPress={() => toggleContactSelection((item as any).id)}
                  >
                    <View style={styles.contactRowContent}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.contactRowName, { color: theme.textPrimary }]}>{item.name}</Text>
                        {item.phoneNumbers && item.phoneNumbers.length > 0 && (
                          <Text style={[styles.contactRowPhone, { color: theme.textSecondary }]}>
                            {item.phoneNumbers[0].number}
                          </Text>
                        )}
                      </View>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color={theme.primary} />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </Modal>

        {/* Create/Edit Modal */}
        <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
          <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} variant="ghost" />
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>New Contact</Text>
              <Button
                title="Save"
                onPress={handleCreate}
                loading={creating}
                disabled={creating}
              />
            </View>

            <ScrollView contentContainerStyle={styles.formContent}>
              <Input label="Name *" value={name} onChangeText={setName} placeholder="Full Name" />
              <Input label="Phone" value={phone} onChangeText={setPhone} placeholder="+1234567890" keyboardType="phone-pad" />
              <Input label="Email" value={email} onChangeText={setEmail} placeholder="john@example.com" keyboardType="email-address" autoCapitalize="none" />
              <Input label="Designation" value={designation} onChangeText={setDesignation} placeholder="e.g. CEO" />
              <Input label="Company" value={companyName} onChangeText={setCompanyName} placeholder="Company Name" />
              <Input label="Tags" value={tagsInput} onChangeText={setTagsInput} placeholder="lead, urgent (comma separated)" />
            </ScrollView>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 100, // Space for FAB
  },
  card: {
    marginBottom: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  cardName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  cardSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  formContent: {
    padding: spacing.lg,
  },
  contactRow: {
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  contactRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contactRowName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  contactRowPhone: {
    marginTop: 2,
    fontSize: typography.fontSize.sm,
  },
});
