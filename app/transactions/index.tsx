/**
 * Transactions Dashboard - Uber Style
 * 
 * Clean transaction list with amount displays
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_ALL_TRANSACTIONS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';

interface Transaction {
    id: string;
    amount: number;
    currency: string;
    category: string;
    status: string;
    transaction_date: string;
    contact: {
        id: string;
        name: string;
    };
}

export default function TransactionsScreen() {
    const router = useRouter();
    const { theme, colorScheme } = useTheme();
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchTransactions = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const result = await executeGraphQL(GET_ALL_TRANSACTIONS.loc?.source.body || '', {});
        if (result.data?.transactionsCollection?.edges) {
            setTransactions(result.data.transactionsCollection.edges.map((e: any) => e.node));
        }

        setLoading(false);
        setRefreshing(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const filteredTransactions = transactions.filter(transaction => {
        if (!searchQuery.trim()) return true;
        return transaction.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.contact?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            transaction.amount.toString().includes(searchQuery);
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return theme.accent;
            case 'pending': return theme.warning;
            case 'failed': return theme.error;
            default: return theme.textSecondary;
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'dark-content' : 'light-content'}
                backgroundColor="transparent"
                translucent
            />

            <ScreenHeader
                subtitle="View details"
                title="Transactions"
                onBack={() => router.back()}
                showSearch={true}
                searchValue={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search transactions..."
            />

            {/* List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.textPrimary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + 100 }]}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={() => fetchTransactions(true)}
                            tintColor={theme.textPrimary}
                        />
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {filteredTransactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
                                <Ionicons name="card-outline" size={48} color={theme.textTertiary} />
                            </View>
                            <Text style={[styles.emptyTitle, { color: theme.textPrimary }]}>No transactions</Text>
                            <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                                Your transactions will appear here
                            </Text>
                        </View>
                    ) : (
                        filteredTransactions.map((transaction, index) => (
                            <Animated.View
                                key={transaction.id}
                                entering={FadeInDown.delay(index * 30).springify()}
                            >
                                <Card
                                    style={styles.card}
                                    onPress={() => router.push(`/transactions/${transaction.id}`)}
                                    elevated
                                >
                                    <View style={styles.cardHeader}>
                                        <View style={styles.categoryContainer}>
                                            <View style={[styles.categoryIcon, { backgroundColor: theme.backgroundSecondary }]}>
                                                <Ionicons name="pricetag-outline" size={14} color={theme.textSecondary} />
                                            </View>
                                            <Text style={[styles.categoryText, { color: theme.textSecondary }]}>
                                                {transaction.category}
                                            </Text>
                                        </View>
                                        <Text style={[styles.dateText, { color: theme.textTertiary }]}>
                                            {new Date(transaction.transaction_date).toLocaleDateString()}
                                        </Text>
                                    </View>

                                    <View style={styles.amountRow}>
                                        <Text style={[styles.amount, { color: theme.textPrimary }]}>
                                            {formatCurrency(transaction.amount, transaction.currency)}
                                        </Text>
                                        <Badge
                                            label={transaction.status}
                                            variant="default"
                                            style={{ backgroundColor: getStatusColor(transaction.status) + '20' }}
                                            textStyle={{ color: getStatusColor(transaction.status) }}
                                        />
                                    </View>

                                    <View style={[styles.divider, { backgroundColor: theme.border }]} />

                                    <View style={styles.cardFooter}>
                                        <View style={styles.contactInfo}>
                                            <Avatar name={transaction.contact?.name || '?'} size="sm" />
                                            <Text style={[styles.contactName, { color: theme.textSecondary }]}>
                                                {transaction.contact?.name || 'Unknown'}
                                            </Text>
                                        </View>
                                        <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
                                    </View>
                                </Card>
                            </Animated.View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    listContent: { padding: spacing.md },
    emptyState: { alignItems: 'center', marginTop: 80 },
    emptyIcon: {
        width: 96,
        height: 96,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.base,
    },
    card: { marginBottom: spacing.sm, borderRadius: borderRadius.xl, padding: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, alignItems: 'center' },
    categoryContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    categoryIcon: { padding: 4, borderRadius: borderRadius.sm },
    categoryText: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
    dateText: { fontSize: typography.fontSize.xs },
    amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    amount: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold },
    divider: { height: 1, marginBottom: spacing.sm },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    contactInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    contactName: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
});
