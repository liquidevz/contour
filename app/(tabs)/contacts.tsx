/**
 * Contacts Screen - WhatsApp Style
 * 
 * Modern chat-style contacts list with search, filters, and clean layout
 */

import Avatar from '@/components/ui/Avatar';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_CONTACTS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  company_name: string;
  designation: string;
  last_contact_date?: string;
  tags?: string[];
}

const filterTabs = [
  { id: 'all', label: 'All' },
  { id: 'recent', label: 'Recent', count: 14 },
  { id: 'favorites', label: 'Favourites' },
  { id: 'companies', label: 'Companies', count: 7 },
];

export default function ContactsScreen() {
  const { theme, colorScheme } = useTheme();
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, contacts]);

  const fetchContacts = async () => {
    setLoading(true);
    const result = await executeGraphQL(GET_CONTACTS.loc?.source.body || '');
    if (result.data?.contactsCollection?.edges) {
      const contactList = result.data.contactsCollection.edges.map((edge: any) => edge.node);
      setContacts(contactList);
      setFilteredContacts(contactList);
    }
    setLoading(false);
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter((contact) =>
      contact.name.toLowerCase().includes(query.toLowerCase()) ||
      contact.email?.toLowerCase().includes(query.toLowerCase()) ||
      contact.company_name?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredContacts(filtered);
  };

  const handleContactPress = (contactId: string) => {
    router.push(`/contact/${contactId}`);
  };

  const getContactSubtitle = (contact: Contact) => {
    if (contact.designation && contact.company_name) {
      return `${contact.designation} at ${contact.company_name}`;
    }
    return contact.designation || contact.company_name || contact.email || 'No details';
  };

  const getTimeAgo = (date?: string) => {
    if (!date) return '';
    const now = new Date();
    const contactDate = new Date(date);
    const diffMs = now.getTime() - contactDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d`;
    return contactDate.toLocaleDateString();
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[styles.contactItem, { borderBottomColor: theme.border }]}
      onPress={() => handleContactPress(item.id)}
      activeOpacity={0.7}
    >
      <Avatar name={item.name} size="md" />

      <View style={styles.contactContent}>
        <View style={styles.contactHeader}>
          <Text style={[styles.contactName, { color: theme.textPrimary }]} numberOfLines={1}>
            {item.name}
          </Text>
          {item.last_contact_date && (
            <Text style={[styles.timeText, { color: theme.textTertiary }]}>
              {getTimeAgo(item.last_contact_date)}
            </Text>
          )}
        </View>

        <View style={styles.subtitleRow}>
          <Ionicons name="checkmark-done" size={16} color={theme.textTertiary} />
          <Text
            style={[styles.contactSubtitle, { color: theme.textTertiary }]}
            numberOfLines={1}
          >
            {getContactSubtitle(item)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="camera-outline" size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: theme.accent }]}
              onPress={() => router.push('/contact/edit')}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.screenTitle, { color: theme.textPrimary }]}>Contacts</Text>

        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: theme.backgroundSecondary }]}>
          <Ionicons name="search" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.textPrimary }]}
            placeholder="Search contacts..."
            placeholderTextColor={theme.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterTabs}>
          {filterTabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.filterTab,
                {
                  backgroundColor: activeFilter === tab.id
                    ? theme.accent + '30'
                    : theme.backgroundSecondary
                }
              ]}
              onPress={() => setActiveFilter(tab.id)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  {
                    color: activeFilter === tab.id
                      ? theme.accent
                      : theme.textSecondary
                  }
                ]}
              >
                {tab.label}
                {tab.count ? ` ${tab.count}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Archived */}
        <TouchableOpacity style={styles.archivedRow}>
          <Ionicons name="archive-outline" size={20} color={theme.textTertiary} />
          <Text style={[styles.archivedText, { color: theme.textTertiary }]}>Archived</Text>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  menuButton: {
    padding: spacing.xs,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconButton: {
    padding: spacing.xs,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    marginLeft: spacing.sm,
    fontWeight: typography.fontWeight.normal,
  },
  filterTabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  filterTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  archivedText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    paddingBottom: 100,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 0.5,
  },
  contactContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  contactName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    flex: 1,
  },
  timeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.normal,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  contactSubtitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.normal,
    flex: 1,
  },
});
