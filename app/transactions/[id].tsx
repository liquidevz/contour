/**
 * Transaction Details Screen
 * 
 * Read-only view of a single transaction.
 */

import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import IconButton from '@/components/ui/IconButton';
import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { GET_TRANSACTION_DETAILS } from '@/graphql/queries';
import { executeGraphQL } from '@/lib/graphql';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    SafeAreaView,
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
    notes: string;
    created_at: string;
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
    const { theme } = useTheme();
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
            case 'paid': return '#4CAF50';
            case 'pending': return '#FF9800';
            case 'failed': return '#F44336';
            default: return theme.textSecondary;
        }
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
    };


    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <ActivityIndicator size="large" color={theme.primary} />
            </View>
        );
    }

    if (!transaction) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.background }]}>
                <Text style={{ color: theme.textSecondary }}>Transaction not found.</Text>
                <IconButton icon="arrow-back" onPress={() => router.back()} />
            </View>
        );
    }

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
                        <Text style={styles.headerTitle}>Transaction</Text>
                        <IconButton
                            icon="create-outline"
                            onPress={() => router.push(`/transactions/edit?id=${id}`)}
                            variant="ghost"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                            color="#fff"
                        />
                    </View>
                </SafeAreaView>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Amount Card */}
                <Card style={styles.amountCard} elevated>
                    <View style={styles.iconContainer}>
                        <View style={[styles.iconCircle, { backgroundColor: getStatusColor(transaction.status) + '20' }]}>
                            <Ionicons
                                name={transaction.status === 'paid' ? 'checkmark' : (transaction.status === 'failed' ? 'close' : 'time')}
                                size={32}
                                color={getStatusColor(transaction.status)}
                            />
                        </View>
                    </View>

                    <Text style={[styles.amount, { color: theme.textPrimary }]}>
                        {formatCurrency(transaction.amount, transaction.currency)}
                    </Text>

                    <Badge
                        label={transaction.status.toUpperCase()}
                        variant="default"
                        style={{ backgroundColor: getStatusColor(transaction.status), marginTop: spacing.sm }}
                        textStyle={{ color: '#fff' }}
                    />

                    <Text style={[styles.date, { color: theme.textTertiary }]}>
                        {new Date(transaction.transaction_date).toLocaleDateString()}
                    </Text>
                </Card>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>DETAILS</Text>
                    <Card style={styles.detailsCard}>
                        <View style={styles.detailRow}>
                            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Category</Text>
                            <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{transaction.category}</Text>
                        </View>
                        {transaction.notes && (
                            <>
                                <View style={styles.divider} />
                                <View style={styles.detailRow}>
                                    <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>Notes</Text>
                                    <Text style={[styles.detailValue, { color: theme.textPrimary }]}>{transaction.notes}</Text>
                                </View>
                            </>
                        )}
                    </Card>
                </View>

                {/* Related Contact */}
                {transaction.contact && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PAYER / PAYEE</Text>
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
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },

    content: { padding: spacing.md, paddingBottom: 100 },

    amountCard: { borderRadius: 20, padding: spacing.xl, marginBottom: spacing.lg, alignItems: 'center' },
    iconContainer: { marginBottom: spacing.md },
    iconCircle: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center' },
    amount: { fontSize: 36, fontWeight: 'bold', marginBottom: 4 },
    date: { marginTop: spacing.md, fontSize: 14 },

    section: { marginBottom: spacing.lg },
    sectionTitle: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: spacing.sm, marginLeft: 4 },
    detailsCard: { padding: spacing.md, borderRadius: 16 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
    detailLabel: { fontSize: 14 },
    detailValue: { fontSize: 14, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 4 },

    contactCard: { padding: spacing.md, borderRadius: 16 },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactName: { fontSize: 16, fontWeight: 'bold' },
    contactSub: { fontSize: 14, marginTop: 2 },
});
