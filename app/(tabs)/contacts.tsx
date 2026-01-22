/**
 * Contacts Screen - WhatsApp Style
 * 
 * Modern chat-style contacts list with search, filters, and clean layout
 */

import Avatar from '@/components/ui/Avatar';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_CONTACTS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Contacts from 'expo-contacts';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
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
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [fabExpanded, setFabExpanded] = useState(false);

  // Animation values
  const fabRotation = useRef(new Animated.Value(0)).current;
  const button1Scale = useRef(new Animated.Value(0)).current; // Import button
  const button2Scale = useRef(new Animated.Value(0)).current; // Add button

  // Refresh contacts when screen comes into focus (e.g., after adding a contact)
  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [])
  );

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, contacts]);


  const fetchContacts = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    const result = await executeGraphQL(GET_CONTACTS.loc?.source.body || '');
    if (result.data?.contactsCollection?.edges) {
      const contactList = result.data.contactsCollection.edges.map((edge: any) => edge.node);
      setContacts(contactList);
      setFilteredContacts(contactList);
    }

    setLoading(false);
    setRefreshing(false);
  };

  const onRefresh = () => {
    fetchContacts(true);
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

  const toggleFAB = () => {
    const toValue = fabExpanded ? 0 : 1;

    Animated.parallel([
      Animated.spring(fabRotation, {
        toValue,
        useNativeDriver: true,
        tension: 40,
        friction: 7,
      }),
      Animated.stagger(50, [
        Animated.spring(button1Scale, {
          toValue,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
        Animated.spring(button2Scale, {
          toValue,
          useNativeDriver: true,
          tension: 40,
          friction: 7,
        }),
      ]),
    ]).start();

    setFabExpanded(!fabExpanded);
  };

  const handleImportContacts = async () => {
    toggleFAB();

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need contacts permission to import contacts.');
      return;
    }

    router.push('/contact/import');
  };

  const handleManualAdd = () => {
    toggleFAB();
    router.push('/contact/edit');
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

      <ScreenHeader
        subtitle="View details"
        title="Contacts"
        onBack={() => router.back()}
        showSearch={true}
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search contacts..."
      />

      {/* Filters */}
      <View style={styles.filtersContainer}>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent}
            colors={[theme.accent]}
          />
        }
      />
      {/* Floating Action Buttons */}
      {fabExpanded && (
        <TouchableOpacity
          style={[styles.overlay]}
          activeOpacity={1}
          onPress={toggleFAB}
        />
      )}

      {/* Add Contact Button - Top */}
      <Animated.View
        style={[
          styles.fabWithLabel,
          {
            bottom: 100,
            right: 24,
            opacity: button2Scale,
            transform: [{ scale: button2Scale }],
          },
        ]}
        pointerEvents={fabExpanded ? 'auto' : 'none'}
      >
        <Text style={styles.fabLabelLeft}>Add Contact</Text>
        <TouchableOpacity
          style={[styles.subFabButton, { backgroundColor: theme.accent }]}
          onPress={handleManualAdd}
          activeOpacity={0.8}
        >
          <Ionicons name="person-add-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </Animated.View>

      {/* Import Button - Bottom */}
      <Animated.View
        style={[
          styles.fabWithLabel,
          {
            bottom: 24,
            right: 24,
            opacity: button1Scale,
            transform: [{ scale: button1Scale }],
          },
        ]}
        pointerEvents={fabExpanded ? 'auto' : 'none'}
      >
        <Text style={styles.fabLabelLeft}>Import</Text>
        <TouchableOpacity
          style={[styles.subFabButton, { backgroundColor: '#FFFFFF' }]}
          onPress={handleImportContacts}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-download-outline" size={24} color={theme.accent} />
        </TouchableOpacity>
      </Animated.View>

      {/* Main FAB - Hides when expanded */}
      {!fabExpanded && (
        <View style={styles.fab}>
          <TouchableOpacity
            style={[styles.fabButton, { backgroundColor: theme.accent }]}
            onPress={toggleFAB}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={28} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filtersContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  fabButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabWithLabel: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subFab: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  subFabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  fabLabelLeft: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    color: '#FFFFFF',
  },
  fabLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    color: '#FFFFFF',
    overflow: 'hidden',
  },
});
