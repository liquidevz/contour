/**
 * Edit Transaction Screen
 * 
 * Form for Creating/Editing Transactions.
 */

import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { CREATE_TRANSACTION, UPDATE_TRANSACTION } from '@/graphql/mutations';
import { GET_TRANSACTION_DETAILS } from '@/graphql/queries';
import { executeGraphQL, executeGraphQLMutation } from '@/lib/graphql';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function EditTransactionScreen() {
    const { id, contactId } = useLocalSearchParams();
    const isEditing = !!id;
    const router = useRouter();
    const { theme } = useTheme();

    const [loading, setLoading] = useState(false);

    // Form State
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('pending');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        if (isEditing && typeof id === 'string') {
            fetchDetails(id);
        }
    }, [id]);

    const fetchDetails = async (transactionId: string) => {
        const result = await executeGraphQL(GET_TRANSACTION_DETAILS.loc?.source.body || '', { id: transactionId });
        if (result.data?.transactionsCollection?.edges?.[0]?.node) {
            const transaction = result.data.transactionsCollection.edges[0].node;
            setAmount(transaction.amount?.toString() || '');
            setCurrency(transaction.currency);
            setCategory(transaction.category || '');
            setStatus(transaction.status);
            setNotes(transaction.notes || '');
            if (transaction.transaction_date) setDate(new Date(transaction.transaction_date));
        }
    };

    const handleSave = async () => {
        if (!amount || isNaN(parseFloat(amount))) {
            Alert.alert('Validation Error', 'Valid amount is required');
            return;
        }

        setLoading(true);
        try {
            const variables = {
                amount: parseFloat(amount),
                currency,
                category,
                status,
                notes,
                transactionDate: date.toISOString(),
                ...(contactId ? { contactId } : {})
            };

            if (isEditing) {
                const result = await executeGraphQLMutation(UPDATE_TRANSACTION.loc?.source.body || '', { id, ...variables });
                if (result.error) throw new Error(result.error.message);
            } else {
                const result = await executeGraphQLMutation(CREATE_TRANSACTION.loc?.source.body || '', variables);
                if (result.error) throw new Error(result.error.message);
            }

            Alert.alert('Success', `Transaction ${isEditing ? 'updated' : 'created'} successfully`, [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message);
        } finally {
            setLoading(false);
        }
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
                        <Button
                            title="Cancel"
                            variant="ghost"
                            onPress={() => router.back()}
                            style={{ paddingHorizontal: 0 }}
                            textStyle={{ color: '#fff' }}
                        />
                        <Text style={styles.headerTitle}>{isEditing ? 'Edit Transaction' : 'New Transaction'}</Text>
                        <Button
                            title="Save"
                            variant="ghost"
                            onPress={handleSave}
                            loading={loading}
                            style={{ paddingHorizontal: 0 }}
                            textStyle={{ color: '#fff', fontWeight: 'bold' }}
                        />
                    </View>
                </SafeAreaView>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                    <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        <Input
                            label="Amount"
                            placeholder="0.00"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="numeric"
                            containerStyle={{ flex: 2 }}
                            autoFocus={!isEditing}
                        />
                        <Input
                            label="Currency"
                            value={currency}
                            onChangeText={setCurrency}
                            containerStyle={{ flex: 1 }}
                        />
                    </View>

                    <Input
                        label="Category"
                        placeholder="e.g. Service Fee"
                        value={category}
                        onChangeText={setCategory}
                    />

                    {/* Status Selector */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Status</Text>
                        <View style={styles.selectorRow}>
                            {['pending', 'paid', 'failed'].map(s => (
                                <Badge
                                    key={s}
                                    label={s.toUpperCase()}
                                    variant={status === s ? 'default' : 'outline'}
                                    onPress={() => setStatus(s)}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        backgroundColor: status === s ? (s === 'paid' ? '#4CAF50' : (s === 'failed' ? '#F44336' : '#FF9800')) : 'transparent',
                                        borderColor: status === s ? 'transparent' : theme.border
                                    }}
                                    textStyle={{ color: status === s ? '#fff' : theme.textSecondary }}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Date Picker Placeholder */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Date</Text>
                        <Button
                            title={date.toLocaleDateString()}
                            variant="secondary"
                            icon="calendar-outline"
                            onPress={() => Alert.alert('Date Picker', 'Date picker component would open here.')}
                        />
                    </View>

                    <Input
                        label="Notes"
                        placeholder="Transaction details..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        containerStyle={{ height: 120 }}
                    />

                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
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
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
    content: { padding: spacing.lg },
    section: { marginBottom: spacing.lg },
    label: { fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
    selectorRow: { flexDirection: 'row', gap: spacing.sm },
});
