/**
 * Edit Transaction Screen - With ScreenHeader
 */

import { spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { CREATE_TRANSACTION, UPDATE_TRANSACTION } from '@/graphql/mutations';
import { GET_TRANSACTION_DETAILS } from '@/graphql/queries';
import { executeGraphQL, executeGraphQLMutation } from '@/lib/graphql';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View
} from 'react-native';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function EditTransactionScreen() {
    const { id, contactId } = useLocalSearchParams();
    const isEditing = !!id;
    const router = useRouter();
    const { theme, colorScheme } = useTheme();

    const [loading, setLoading] = useState(false);
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('pending');
    const [paymentMethod, setPaymentMethod] = useState('');
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
            const txn = result.data.transactionsCollection.edges[0].node;
            setAmount(txn.amount.toString());
            setCurrency(txn.currency || 'USD');
            setCategory(txn.category);
            setStatus(txn.status);
            setPaymentMethod(txn.payment_method || '');
            setNotes(txn.notes || '');
            if (txn.transaction_date) setDate(new Date(txn.transaction_date));
        }
    };

    const handleSave = async () => {
        if (!amount || !category) {
            Alert.alert('Validation Error', 'Amount and category are required');
            return;
        }

        setLoading(true);
        try {
            const variables = {
                amount: parseFloat(amount),
                currency,
                category,
                status,
                paymentMethod,
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
            <StatusBar
                barStyle={colorScheme === 'dark' ? 'dark-content' : 'light-content'}
                backgroundColor="transparent"
                translucent
            />

            <ScreenHeader
                title={isEditing ? 'Edit Transaction' : 'New Transaction'}
                onBack={() => router.back()}
                onAction={handleSave}
                actionLabel="Save"
                actionLoading={loading}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Input
                        label="Amount"
                        placeholder="0.00"
                        value={amount}
                        onChangeText={setAmount}
                        keyboardType="decimal-pad"
                        autoFocus={!isEditing}
                    />

                    <Input
                        label="Currency"
                        placeholder="USD"
                        value={currency}
                        onChangeText={setCurrency}
                        autoCapitalize="characters"
                    />

                    <Input
                        label="Category"
                        placeholder="e.g. Consulting, Product Sale"
                        value={category}
                        onChangeText={setCategory}
                    />

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
                                        backgroundColor: status === s ? theme.textPrimary : 'transparent',
                                        borderColor: status === s ? 'transparent' : theme.border
                                    }}
                                    textStyle={{ color: status === s ? theme.textInverse : theme.textSecondary }}
                                />
                            ))}
                        </View>
                    </View>

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
                        label="Payment Method"
                        placeholder="e.g. Bank Transfer, Card"
                        value={paymentMethod}
                        onChangeText={setPaymentMethod}
                    />

                    <Input
                        label="Notes"
                        placeholder="Additional notes..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={4}
                        style={{ minHeight: 100, textAlignVertical: 'top' }}
                    />
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: 100 },
    section: { marginBottom: spacing.lg },
    label: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, marginBottom: spacing.sm },
    selectorRow: { flexDirection: 'row', gap: spacing.sm },
});
