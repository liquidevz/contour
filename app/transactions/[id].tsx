/**
 * Transaction Details Screen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing, typography, borderRadius } from '@/constants/tokens';
import { executeGraphQL } from '@/lib/graphql';
import { GET_TRANSACTION_DETAILS } from '@/graphql/queries';
import IconButton from '@/components/ui/IconButton';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';

export default function TransactionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [transaction, setTransaction] = useState<any>(null);

    const fetchDetails = async () => {
        setLoading(true);
        const result = await executeGraphQL(GET_TRANSACTION_DETAILS.loc?.source.body || '', { id });
        if (result.data?.transactionsCollection?.edges?.[0]?.node) {
            setTransaction(result.data.transactionsCollection.edges[0].node);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDetails();
    }, [id]);


    const handleEdit = () => {
        if (transaction?.contact?.id) {
            // @ts-ignore
            router.push({
                pathname: `/contact/${transaction.contact.id}`,
                params: { editTransaction: transaction.id }
            });
        }
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
                <Text>Transaction not found</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: '#F5F7FA' }]}>
            <Stack.Screen options={{ headerShown: false }} />
            <StatusBar barStyle="light-content" />

            <View style={styles.headerContainer}>
                <LinearGradient
                    colors={['#8E24AA', '#BA68C8']} // Purple theme for transactions
                    style={styles.headerBackground}
                />
                <View style={styles.headerContent}>
                    <View style={styles.topNav}>
                        <IconButton icon="arrow-back" onPress={() => router.back()} variant="ghost" color="#fff" />
                        <Text style={styles.headerTitle}>Transaction</Text>
                        <IconButton icon="pencil" onPress={handleEdit} variant="ghost" color="#fff" disabled={!transaction.contact} />
                    </View>
                </View>

                {transaction.contact ? (
                    <View style={styles.floatingCard}>
                        <View style={styles.contactRow}>
                            <Avatar name={transaction.contact.name || '?'} size="md" />
                            <View style={{ marginLeft: spacing.md }}>
                                <Text style={styles.contactLabel}>RELATED CONTACT</Text>
                                <Text style={styles.contactName}>{transaction.contact.name}</Text>
                                {(transaction.contact.designation || transaction.contact.company_name) && (
                                    <Text style={styles.contactSub}>
                                        {transaction.contact.designation}{transaction.contact.designation && transaction.contact.company_name ? ' @ ' : ''}{transaction.contact.company_name}
                                    </Text>
                                )}
                            </View>
                        </View>
                        {/* @ts-ignore */}
                        <Ionicons name="chevron-forward" size={20} color="#ccc" onPress={() => router.push(`/contact/${transaction.contact.id}`)} />
                    </View>
                ) : (
                    <View style={[styles.floatingCard, { justifyContent: 'center' }]}>
                        <Text style={{ fontStyle: 'italic', color: '#999' }}>No contact assigned</Text>
                    </View>
                )}
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.amountContainer}>
                    <Text style={styles.currency}>{transaction.currency}</Text>
                    <Text style={styles.amount}>{transaction.amount}</Text>
                </View>

                <View style={styles.metaRowCentered}>
                    <Badge
                        label={transaction.category}
                        variant="default"
                        style={{ backgroundColor: transaction.category === 'To Receive' ? '#E8F5E9' : '#FFEBEE' }}
                        textStyle={{ color: transaction.category === 'To Receive' ? '#388E3C' : '#D32F2F' }}
                    />
                    <Badge
                        label={transaction.status.toUpperCase()}
                        variant="outline"
                    />
                </View>

                <View style={[styles.section, styles.dateBox]}>
                    <Ionicons name="calendar" size={24} color="#8E24AA" />
                    <View>
                        <Text style={styles.dateLabel}>TRANSACTION DATE</Text>
                        <Text style={styles.dateValue}>
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                        </Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>NOTES</Text>
                    <Text style={styles.descriptionText}>
                        {transaction.notes || 'No notes available.'}
                    </Text>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    headerContainer: { height: 200, marginBottom: 50 },
    headerBackground: { ...StyleSheet.absoluteFillObject, height: 200, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
    headerContent: { paddingTop: 60, paddingHorizontal: spacing.md },
    topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 20, fontWeight: '600', color: '#fff' },
    floatingCard: {
        position: 'absolute',
        bottom: -40,
        left: spacing.lg,
        right: spacing.lg,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 24,
        elevation: 10,
    },
    contactRow: { flexDirection: 'row', alignItems: 'center' },
    contactLabel: { fontSize: 10, fontWeight: 'bold', color: '#999', letterSpacing: 1, marginBottom: 2 },
    contactName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    contactSub: { fontSize: 12, color: '#666', marginTop: 2 },
    content: { padding: spacing.xl, paddingTop: 20 },
    amountContainer: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.sm },
    currency: { fontSize: 24, fontWeight: '500', color: '#8E24AA', marginRight: 4, marginTop: 12 },
    amount: { fontSize: 56, fontWeight: 'bold', color: '#333' },
    metaRowCentered: { flexDirection: 'row', justifyContent: 'center', gap: spacing.md, marginBottom: spacing.xl },
    section: { marginBottom: spacing.xl },
    sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#999', letterSpacing: 1.5, marginBottom: spacing.md },
    descriptionText: { fontSize: 16, lineHeight: 26, color: '#444' },
    dateBox: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#F3E5F5', padding: spacing.md, borderRadius: 16 },
    dateLabel: { fontSize: 10, fontWeight: '900', color: '#8E24AA', letterSpacing: 1 },
    dateValue: { fontSize: 16, fontWeight: '600', color: '#333', marginTop: 2 },
});
