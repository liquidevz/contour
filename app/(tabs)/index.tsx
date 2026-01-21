/**
 * Home Screen (New Dashboard)
 * 
 * Featured Layout:
 * - Red Gradient Header
 * - Search Bar
 * - Bento Grid for Contacts, Tasks, Meetings, Transactions
 */

import Avatar from '@/components/ui/Avatar';
import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = (route: string) => {
    // @ts-ignore
    router.push(route);
  };

  const navigateToContacts = () => {
    // Navigate to the contacts tab
    router.push('/(tabs)/contacts');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF4B2B" />

      {/* Header Section */}
      <View style={styles.headerContainer}>
        <LinearGradient
          colors={['#FF416C', '#FF4B2B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.headerBackground}
        />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.topBar}>
            <Text style={styles.headerTitle}>Home</Text>
            <View style={styles.headerRight}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>PRO</Text>
              </View>
              <Avatar name="User" size="md" />
            </View>
          </View>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search for 'Clients'..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <View style={styles.micIconContainer}>
              <Ionicons name="mic" size={20} color="#FF4B2B" />
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Main Content */}
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.gridContainer}>
          {/* Bento Grid */}

          {/* Contacts Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardLarge]}
            onPress={navigateToContacts}
            activeOpacity={0.9}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Contacts</Text>
              <Ionicons name="people" size={24} color="#333" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.illustrationPlaceholer}>
                <Ionicons name="person-add-outline" size={48} color="#FF4B2B" style={{ opacity: 0.2 }} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Tasks Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardLarge]}
            onPress={() => router.push('/tasks')}
            activeOpacity={0.9}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Tasks</Text>
              <Ionicons name="checkbox-outline" size={24} color="#333" />
            </View>
            <View style={styles.cardContent}>
              <View style={[styles.illustrationPlaceholer, { alignSelf: 'flex-end' }]}>
                <Ionicons name="checkmark-circle-outline" size={48} color="#4CAF50" style={{ opacity: 0.2 }} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Meetings Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardLarge]}
            onPress={() => router.push('/meetings')}
            activeOpacity={0.9}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Meetings</Text>
              <Ionicons name="calendar-outline" size={24} color="#333" />
            </View>
            <View style={styles.cardContent}>
              <View style={styles.illustrationPlaceholer}>
                <Ionicons name="time-outline" size={48} color="#FF9800" style={{ opacity: 0.2 }} />
              </View>
            </View>
          </TouchableOpacity>


          {/* Transactions Card */}
          <TouchableOpacity
            style={[styles.card, styles.cardLarge]}
            onPress={() => router.push('/transactions')}
            activeOpacity={0.9}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Transact</Text>
              <Ionicons name="card-outline" size={24} color="#333" />
            </View>
            <View style={styles.cardContent}>
              <View style={[styles.illustrationPlaceholer, { alignSelf: 'flex-end' }]}>
                <Ionicons name="wallet-outline" size={48} color="#9C27B0" style={{ opacity: 0.2 }} />
              </View>
            </View>
          </TouchableOpacity>

        </View>


        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>FEATURED FOR YOU</Text>
            <View style={styles.line} />
          </View>

          <TouchableOpacity style={styles.featuredCard}>
            <LinearGradient
              colors={['#11998e', '#38ef7d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.featuredGradient}
            >
              <View>
                <Text style={styles.featuredTitle}>Import Contacts</Text>
                <Text style={styles.featuredSubtitle}>Sync from your device instantly</Text>
              </View>
              <Ionicons name="cloud-upload-outline" size={32} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  headerContainer: {
    height: 220, // Taller header to accommodate search bar
    width: '100%',
    position: 'relative',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
    shadowColor: '#FF4B2B',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 10,
  },
  headerBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: Platform.OS === 'android' ? 40 : 0,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900', // Extra bold
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    height: 56,
    marginTop: spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  micIconContainer: {
    borderLeftWidth: 1,
    borderLeftColor: '#eee',
    paddingLeft: spacing.md,
  },
  contentContainer: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.md,
    paddingBottom: 100,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: spacing.md,
  },
  cardLarge: {
    width: (width - (spacing.md * 3)) / 2, // 2 column grid
    height: 160,
    justifyContent: 'space-between'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
  },
  illustrationPlaceholer: {
    marginTop: spacing.md,
  },
  featuredSection: {
    marginTop: spacing.xl,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: '#999',
    fontSize: 12,
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  featuredCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  featuredGradient: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 100,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
  }
});
