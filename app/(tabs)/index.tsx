/**
 * Home Screen - Uber Style Dashboard
 * 
 * Clean black/white bento grid with modern typography
 * No gradients - pure minimal aesthetic
 */

import { borderRadius, elevation, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_ALL_MEETINGS, GET_ALL_TASKS, GET_ALL_TRANSACTIONS, GET_CONTACTS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Platform,
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
import SearchBar from '@/components/ui/SearchBar';

const { width } = Dimensions.get('window');
const CARD_GAP = spacing.md;
const CARD_WIDTH = (width - spacing.lg * 2 - CARD_GAP) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { theme, colorScheme } = useTheme();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [contactsCount, setContactsCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fetchStats = async () => {
    try {
      // Fetch Contacts
      const contactsResult = await executeGraphQL(GET_CONTACTS.loc?.source.body || '');
      if (contactsResult.data?.contactsCollection?.edges) {
        setContactsCount(contactsResult.data.contactsCollection.edges.length);
      }

      // Fetch Tasks
      const tasksResult = await executeGraphQL(GET_ALL_TASKS.loc?.source.body || '', {});
      if (tasksResult.data?.tasksCollection?.edges) {
        const tasks = tasksResult.data.tasksCollection.edges.map((e: any) => e.node);
        const pending = tasks.filter((t: any) => t.status === 'pending').length;
        setPendingTasksCount(pending);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const navigateTo = (route: string) => {
    // @ts-ignore
    router.push(route);
  };

  const navigateToContacts = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push('/(tabs)/contacts');
  };

  // Search functionality
  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const results: any[] = [];
      const lowerQuery = query.toLowerCase();

      // Search contacts
      const contactsResult = await executeGraphQL(GET_CONTACTS.loc?.source.body || '');
      if (contactsResult.data?.contactsCollection?.edges) {
        const contacts = contactsResult.data.contactsCollection.edges
          .map((e: any) => e.node)
          .filter((contact: any) =>
            contact.name?.toLowerCase().includes(lowerQuery) ||
            contact.email?.toLowerCase().includes(lowerQuery) ||
            contact.phone?.includes(query)
          )
          .map((contact: any) => ({
            type: 'contact',
            id: contact.id,
            title: contact.name,
            subtitle: contact.designation || contact.company_name || contact.email,
            icon: 'person' as const,
          }));
        results.push(...contacts.slice(0, 3));
      }

      // Search tasks
      const tasksResult = await executeGraphQL(GET_ALL_TASKS.loc?.source.body || '', {});
      if (tasksResult.data?.tasksCollection?.edges) {
        const tasks = tasksResult.data.tasksCollection.edges
          .map((e: any) => e.node)
          .filter((task: any) =>
            task.title?.toLowerCase().includes(lowerQuery) ||
            task.description?.toLowerCase().includes(lowerQuery)
          )
          .map((task: any) => ({
            type: 'task',
            id: task.id,
            title: task.title,
            subtitle: task.status || 'Task',
            icon: 'checkbox' as const,
          }));
        results.push(...tasks.slice(0, 3));
      }

      // Search meetings
      const meetingsResult = await executeGraphQL(GET_ALL_MEETINGS.loc?.source.body || '', {});
      if (meetingsResult.data?.meetingsCollection?.edges) {
        const meetings = meetingsResult.data.meetingsCollection.edges
          .map((e: any) => e.node)
          .filter((meeting: any) =>
            meeting.title?.toLowerCase().includes(lowerQuery) ||
            meeting.location?.toLowerCase().includes(lowerQuery)
          )
          .map((meeting: any) => ({
            type: 'meeting',
            id: meeting.id,
            title: meeting.title,
            subtitle: meeting.location || 'Meeting',
            icon: 'calendar' as const,
          }));
        results.push(...meetings.slice(0, 3));
      }

      // Search transactions
      const transactionsResult = await executeGraphQL(GET_ALL_TRANSACTIONS.loc?.source.body || '', {});
      if (transactionsResult.data?.transactionsCollection?.edges) {
        const transactions = transactionsResult.data.transactionsCollection.edges
          .map((e: any) => e.node)
          .filter((transaction: any) =>
            transaction.category?.toLowerCase().includes(lowerQuery) ||
            transaction.notes?.toLowerCase().includes(lowerQuery)
          )
          .map((transaction: any) => ({
            type: 'transaction',
            id: transaction.id,
            title: transaction.category || 'Transaction',
            subtitle: `${transaction.currency || '$'} ${transaction.amount}`,
            icon: 'card' as const,
          }));
        results.push(...transactions.slice(0, 3));
      }

      setSearchResults(results);
      setShowSearchResults(results.length > 0);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    performSearch(text);
  };

  const handleSearchResultPress = (result: any) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowSearchResults(false);
    setSearchQuery('');

    switch (result.type) {
      case 'contact':
        router.push(`/contact/${result.id}`);
        break;
      case 'task':
        router.push(`/tasks/${result.id}`);
        break;
      case 'meeting':
        router.push(`/meetings/${result.id}`);
        break;
      case 'transaction':
        router.push(`/transactions/${result.id}`);
        break;
    }
  };

  // Bento card configurations
  const bentoCards = [
    {
      id: 'contacts',
      title: 'Contacts',
      icon: 'people' as const,
      lottie: require('@/assets/animations/contact.json'),
      lottieStyle: { width: 250, height: 250, bottom: -80, right: -80 },
      onPress: navigateToContacts,
      accent: theme.textPrimary,
    },
    {
      id: 'tasks',
      title: 'Tasks',
      icon: 'checkbox' as const,
      lottie: require('@/assets/animations/Task Loader.json'),
      lottieStyle: { width: 260, height: 260, bottom: -85, right: -85 },
      onPress: () => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        router.push('/tasks');
      },
      accent: theme.accent,
    },
    {
      id: 'meetings',
      title: 'Meetings',
      icon: 'calendar' as const,
      lottie: require('@/assets/animations/meeting.json'),
      lottieStyle: { width: 500, height: 500, bottom: -220, right: -200 },
      onPress: () => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        router.push('/meetings');
      },
      accent: theme.textPrimary,
    },
    {
      id: 'transactions',
      title: 'Transactions',
      icon: 'card' as const,
      lottie: require('@/assets/animations/Money.json'),
      lottieStyle: { width: 200, height: 200, bottom: -75, right: -40 },
      onPress: () => {
        if (Platform.OS !== 'web') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        router.push('/transactions');
      },
      accent: theme.textSecondary,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.headerBackground}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: theme.headerBackground }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back</Text>
            <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Dashboard</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={[styles.notificationBtn, { backgroundColor: theme.backgroundSecondary }]}
              onPress={() => {
                if (Platform.OS !== 'web') {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.textPrimary} />
            </TouchableOpacity>
            <Avatar name="User" size="md" />
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <SearchBar
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search contacts, tasks..."
            showMicIcon
            onClear={() => {
              setSearchQuery('');
              setShowSearchResults(false);
            }}
          />

          {/* Search Results */}
          {showSearchResults && searchResults.length > 0 && (
            <View style={[styles.searchResults, { backgroundColor: theme.cardBackground, ...elevation.lg }]}>
              <ScrollView
                style={styles.searchResultsScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {searchResults.map((result, index) => (
                  <TouchableOpacity
                    key={`${result.type}-${result.id}`}
                    style={[
                      styles.searchResultItem,
                      { borderBottomColor: theme.border },
                      index === searchResults.length - 1 && styles.searchResultItemLast
                    ]}
                    onPress={() => handleSearchResultPress(result)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.searchResultIcon, { backgroundColor: theme.backgroundSecondary }]}>
                      <Ionicons name={result.icon} size={20} color={theme.textPrimary} />
                    </View>
                    <View style={styles.searchResultInfo}>
                      <Text style={[styles.searchResultTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                        {result.title}
                      </Text>
                      <Text style={[styles.searchResultSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
                        {result.subtitle}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Stats */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: theme.textPrimary }]}>
            <Text style={[styles.statNumber, { color: theme.textInverse }]}>{contactsCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textInverse, opacity: 0.8 }]}>Active Contacts</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.backgroundSecondary }]}>
            <Text style={[styles.statNumber, { color: theme.textPrimary }]}>{pendingTasksCount}</Text>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Pending Tasks</Text>
          </View>
        </Animated.View>

        {/* Bento Grid */}
        <View style={styles.gridContainer}>
          {bentoCards.map((card, index) => (
            <Animated.View
              key={card.id}
              entering={FadeInDown.delay(150 + index * 50).springify()}
            >
              <TouchableOpacity
                style={[
                  styles.bentoCard,
                  {
                    backgroundColor: theme.cardBackground,
                    ...elevation.md,
                    overflow: 'hidden',
                  },
                ]}
                onPress={card.onPress}
                activeOpacity={0.8}
              >

                {/* @ts-ignore */}
                {/* @ts-ignore */}
                {card.lottie && (
                  <LottieView
                    source={card.lottie}
                    style={{
                      position: 'absolute',
                      // @ts-ignore
                      bottom: card.lottieStyle?.bottom ?? -80,
                      // @ts-ignore
                      right: card.lottieStyle?.right ?? -80,
                      // @ts-ignore
                      width: card.lottieStyle?.width ?? 250,
                      // @ts-ignore
                      height: card.lottieStyle?.height ?? 250,
                    }}
                    autoPlay
                    loop
                  />
                )}
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
                    {card.title}
                  </Text>
                  {!card.lottie && (
                    <View style={[styles.iconContainer, { backgroundColor: theme.backgroundSecondary }]}>
                      <Ionicons name={card.icon} size={22} color={card.accent} />
                    </View>
                  )}
                </View>
                <View style={styles.cardFooter}>
                  <Ionicons name="arrow-forward" size={20} color={theme.textTertiary} />
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))}

        </View>

        {/* Featured Section */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.featuredSection}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>QUICK ACTIONS</Text>

          <TouchableOpacity
            style={[styles.featuredCard, { backgroundColor: theme.textPrimary }]}
            activeOpacity={0.9}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }
              router.push('/contact/import');
            }}
          >
            <View style={styles.featuredContent}>
              <View style={[styles.featuredIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                <Ionicons name="cloud-upload-outline" size={24} color={theme.textInverse} />
              </View>
              <View style={styles.featuredText}>
                <Text style={[styles.featuredTitle, { color: theme.textInverse }]}>
                  Import Contacts
                </Text>
                <Text style={[styles.featuredSubtitle, { color: theme.textInverse, opacity: 0.7 }]}>
                  Sync from your device
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.textInverse} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: theme.backgroundSecondary }]}
            activeOpacity={0.8}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              router.push('/contact/edit');
            }}
          >
            <View style={styles.featuredContent}>
              <View style={[styles.featuredIcon, { backgroundColor: theme.surface }]}>
                <Ionicons name="add" size={24} color={theme.textPrimary} />
              </View>
              <View style={styles.featuredText}>
                <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>
                  New Contact
                </Text>
                <Text style={[styles.actionSubtitle, { color: theme.textSecondary }]}>
                  Add a new contact manually
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xxs,
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.tight,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    marginTop: spacing.xs,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: CARD_GAP,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
  },
  statNumber: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xxs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    marginBottom: spacing.xl,
  },
  bentoCard: {
    width: CARD_WIDTH,
    height: 140,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardFooter: {
    alignItems: 'flex-end',
  },
  featuredSection: {
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    letterSpacing: typography.letterSpacing.wider,
    marginBottom: spacing.md,
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  featuredContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featuredIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredText: {
    gap: spacing.xxs,
  },
  featuredTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  featuredSubtitle: {
    fontSize: typography.fontSize.sm,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.sm,
  },
  actionTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  actionSubtitle: {
    fontSize: typography.fontSize.sm,
  },
  searchResults: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    maxHeight: 300,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    zIndex: 1000,
  },
  searchResultsScroll: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
  },
  searchResultItemLast: {
    borderBottomWidth: 0,
  },
  searchResultIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchResultInfo: {
    flex: 1,
    gap: spacing.xxs,
  },
  searchResultTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  searchResultSubtitle: {
    fontSize: typography.fontSize.sm,
  },
});
