/**
 * Transactions Detail Screen - With ScreenHeader
 */

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import ScreenHeader from '@/components/ui/ScreenHeader';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_TRANSACTION_DETAILS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

interface TransactionDetail {
    id: string;
    amount: number;
    currency: string;
    category: string;
    status: string;
    transaction_date: string;
    payment_method: string;
    notes: string;
    contact: {
        id: string;
        name: string;
        company_name: string;
        designation: string;
    };
}

export default function TransactionDetailsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { theme, colorScheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState<TransactionDetail | null>(null);

    const fetchDetails = async () => {
        setLoading(true);
        if (typeof id !== 'string') return;

        const result = await executeGraphQL(GET_TRANSACTION_DETAILS.loc?.source.body || '', { id });
        if (result.data?.transactionsCollection?.edges?.[0]?.node) {
            setTransaction(result.data.transactionsCollection.edges[0].node);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);

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

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.textPrimary} />
            </View>
        );
    }

    if (!transaction) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textSecondary }}>Transaction not found.</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'dark-content' : 'light-content'}
                backgroundColor="transparent"
                translucent
            />

            <ScreenHeader
                title="Transaction"
                onBack={() => router.back()}
                onAction={() => router.push(`/transactions/edit?id=${id}`)}
                actionIcon="create-outline"
            />

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Card style={styles.amountCard} elevated>
                    <Text style={[styles.amountLabel, { color: theme.textSecondary }]}>Amount</Text>
                    <Text style={[styles.amount, { color: theme.textPrimary }]}>
                        {formatCurrency(transaction.amount, transaction.currency)}
                    </Text>
                    <View style={styles.statusRow}>
                        <Badge
                            label={transaction.status}
                            variant="default"
                            style={{ backgroundColor: getStatusColor(transaction.status) + '20' }}
                            textStyle={{ color: getStatusColor(transaction.status) }}
                        />
                        <Badge
                            label={transaction.category}
                            variant="default"
                            style={{ backgroundColor: theme.backgroundSecondary }}
                        />
                    </View>
                </Card>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DETAILS</Text>
                    <Card style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Date</Text>
                            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                                {new Date(transaction.transaction_date).toLocaleDateString()}
                            </Text>
                        </View>
                        <View style={[styles.separator, { backgroundColor: theme.border }]} />
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Payment Method</Text>
                            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>
                                {transaction.payment_method || 'Not specified'}
                            </Text>
                        </View>
                    </Card>
                </View>

                {transaction.notes && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>NOTES</Text>
                        <Card style={styles.contentCard}>
                            <Text style={[styles.description, { color: theme.textPrimary }]}>
                                {transaction.notes}
                            </Text>
                        </Card>
                    </View>
                )}

                {transaction.contact && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>CONTACT</Text>
                        <Card
                            style={styles.contactCard}
                            onPress={() => router.push(`/contact/${transaction.contact.id}`)}
                            elevated
                        >
                            <View style={styles.contactRow}>
                                <Avatar name={transaction.contact.name} size="md" />
                                <View style={{ marginLeft: spacing.md, flex: 1 }}>
                                    <Text style={[styles.contactName, { color: theme.textPrimary }]}>{transaction.contact.name}</Text>
                                    {(transaction.contact.designation || transaction.contact.company_name) && (
                                        <Text style={[styles.contactSub, { color: theme.textSecondary }]}>
                                            {transaction.contact.designation && transaction.contact.company_name
                                                ? `${transaction.contact.designation} at ${transaction.contact.company_name}`
                                                : (transaction.contact.designation || transaction.contact.company_name)}
                                        </Text>
                                    )}
                                </View>
                                <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
                            </View>
                        </Card>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    content: { padding: spacing.md, paddingBottom: 100 },
    amountCard: { borderRadius: borderRadius.xl, padding: spacing.xl, marginBottom: spacing.lg, alignItems: 'center' },
    amountLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, marginBottom: spacing.xs },
    amount: { fontSize: typography.fontSize['4xl'], fontWeight: typography.fontWeight.bold, marginBottom: spacing.md },
    statusRow: { flexDirection: 'row', gap: spacing.sm },
    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.bold, letterSpacing: 1, marginBottom: spacing.sm, marginLeft: 4 },
    detailsCard: { padding: spacing.md, borderRadius: borderRadius.lg },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
    detailLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium },
    detailValue: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold },
    separator: { height: 1 },
    contentCard: { padding: spacing.md, borderRadius: borderRadius.lg },
    description: { fontSize: typography.fontSize.base, lineHeight: typography.fontSize.base * 1.5 },
    contactCard: { padding: spacing.md, borderRadius: borderRadius.lg },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.bold },
    contactSub: { fontSize: typography.fontSize.sm, marginTop: 2 },
});
