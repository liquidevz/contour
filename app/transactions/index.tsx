/**
 * Transactions Dashboard
 * 
 * Displays all transactions with new design system.
 */

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_ALL_TRANSACTIONS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

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
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [transactions, setTransactions] = useState<Transaction[]>([]);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'failed': return '#F44336';
            default: return theme.textSecondary;
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
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
                        <IconButton
                            icon="arrow-back"
                            onPress={() => router.back()}
                            variant="ghost"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            color="#fff"
                        />
                        <Text style={styles.headerTitle}>Transactions</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </SafeAreaView>
            </View>

            {/* List */}
            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.listContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchTransactions(true)} tintColor={theme.primary} />}
                    showsVerticalScrollIndicator={false}
                >
                    {transactions.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="card-outline" size={64} color={theme.border} />
                            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No transactions found</Text>
                        </View>
                    ) : (
                        transactions.map(transaction => (
                            <Card
                                key={transaction.id}
                                style={styles.card}
                                // @ts-ignore
                                onPress={() => router.push(`/transactions/${transaction.id}`)}
                                elevated
                            >
                                <View style={styles.cardHeader}>
                                    <View style={styles.categoryContainer}>
                                        <View style={[styles.categoryIcon, { backgroundColor: theme.primary + '20' }]}>
                                            <Ionicons name="pricetag-outline" size={14} color={theme.primary} />
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

                                <View style={styles.divider} />

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
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
    listContent: { padding: spacing.md, paddingBottom: 100 },
    emptyState: { alignItems: 'center', marginTop: 60 },
    emptyText: { marginTop: spacing.md, fontSize: 16 },
    card: { marginBottom: spacing.md, borderRadius: 16, padding: spacing.md },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md, alignItems: 'center' },
    categoryContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    categoryIcon: { padding: 4, borderRadius: 6 },
    categoryText: { fontSize: 13, fontWeight: '500' },
    dateText: { fontSize: 12 },
    amountRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    amount: { fontSize: 24, fontWeight: 'bold' },
    divider: { height: 1, backgroundColor: '#eee', marginBottom: spacing.sm },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    contactInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    contactName: { fontSize: 14, fontWeight: '500' },
});
