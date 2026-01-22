/**
 * Edit Contact Screen - With ScreenHeader
 * 
 * Form for Creating/Editing Contacts
 */

import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { CREATE_CONTACT, UPDATE_CONTACT } from '@/graphql/mutations';
import { GET_CONTACT_DASHBOARD } from '@/graphql/queries';
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
    View
} from 'react-native';

import Input from '@/components/ui/Input';
import ScreenHeader from '@/components/ui/ScreenHeader';

export default function EditContactScreen() {
    const { id } = useLocalSearchParams();
    const isEditing = !!id;
    const router = useRouter();
    const { theme, colorScheme } = useTheme();

    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [designation, setDesignation] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isEditing && typeof id === 'string') {
            fetchDetails(id);
        }
    }, [id]);

    const fetchDetails = async (contactId: string) => {
        const result = await executeGraphQL(GET_CONTACT_DASHBOARD.loc?.source.body || '', { id: contactId });
        if (result.data?.contactsCollection?.edges?.[0]?.node) {
            const contact = result.data.contactsCollection.edges[0].node;
            setName(contact.name);
            setPhone(contact.phone || '');
            setEmail(contact.email || '');
            setCompanyName(contact.company_name || '');
            setDesignation(contact.designation || '');
            setNotes(contact.notes || '');

            if (contact.tags) {
                let tags = contact.tags;
                if (typeof tags === 'string') {
                    try {
                        tags = JSON.parse(tags);
                    } catch (e) {
                        if (!tags.startsWith('[')) tags = tags.split(',');
                    }
                }
                if (Array.isArray(tags)) {
                    setTagsInput(tags.join(', '));
                }
            }
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Validation Error', 'Name is required');
            return;
        }

        setLoading(true);
        try {
            const tagsArray = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

            // Determine profile completion status
            const isComplete = !!(
                name.trim() &&
                (phone?.trim()) &&
                (email?.trim()) &&
                (companyName?.trim()) &&
                (designation?.trim())
            );

            const variables = {
                name,
                phone: phone || null,
                email: email || null,
                companyName: companyName || null,
                designation: designation || null,
                tags: JSON.stringify(tagsArray),
                notes: notes || null,
                isCompletedProfile: isComplete
            };

            let result;
            if (isEditing) {
                result = await executeGraphQLMutation(UPDATE_CONTACT.loc?.source.body || '', { id, ...variables });
            } else {
                result = await executeGraphQLMutation(CREATE_CONTACT.loc?.source.body || '', variables);
            }

            if (result.error) throw new Error(result.error.message);

            Alert.alert('Success', `Contact ${isEditing ? 'updated' : 'created'} successfully`, [
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
                subtitle={isEditing ? "Update information" : "Add new contact"}
                title={isEditing ? 'Edit Contact' : 'New Contact'}
                onBack={() => router.back()}
                onAction={handleSave}
                actionLabel="Save"
                actionLoading={loading}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Input
                        label="Name"
                        placeholder="Full Name"
                        value={name}
                        onChangeText={setName}
                        autoFocus={!isEditing}
                    />

                    <Input
                        label="Phone"
                        placeholder="+1 234 567 8900"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                    />

                    <Input
                        label="Email"
                        placeholder="john@example.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />

                    <Input
                        label="Designation"
                        placeholder="e.g. CEO, Manager"
                        value={designation}
                        onChangeText={setDesignation}
                    />

                    <Input
                        label="Company"
                        placeholder="Company Name"
                        value={companyName}
                        onChangeText={setCompanyName}
                    />

                    <Input
                        label="Tags"
                        placeholder="lead, urgent (comma separated)"
                        value={tagsInput}
                        onChangeText={setTagsInput}
                    />

                    <Input
                        label="Notes"
                        placeholder="Add notes..."
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
});
