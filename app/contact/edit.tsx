/**
 * Edit Contact Screen
 * 
 * Form for Creating/Editing Contacts and Completing Profiles.
 */

import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { CREATE_CONTACT, UPDATE_CONTACT } from '@/graphql/mutations';
import { GET_CONTACT_DASHBOARD } from '@/graphql/queries'; // Reusing dashboard query or need a specific details query? Dashboard has all info.
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

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function EditContactScreen() {
    const { id } = useLocalSearchParams();
    const isEditing = !!id;
    const router = useRouter();
    const { theme } = useTheme();

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
        // Reuse Dashboard query as it fetches the contact node
        const result = await executeGraphQL(GET_CONTACT_DASHBOARD.loc?.source.body || '', { id: contactId });
        if (result.data?.contactsCollection?.edges?.[0]?.node) {
            const contact = result.data.contactsCollection.edges[0].node;
            setName(contact.name);
            setPhone(contact.phone || '');
            setEmail(contact.email || '');
            setCompanyName(contact.company_name || '');
            setDesignation(contact.designation || '');
            setNotes(contact.notes || '');

            // Handle Tags
            if (contact.tags) {
                let tags = contact.tags;
                if (typeof tags === 'string') {
                    try {
                        tags = JSON.parse(tags);
                    } catch (e) {
                        // split if comma separated string
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

            const variables = {
                name,
                phone: phone || null,
                email: email || null,
                companyName: companyName || null,
                designation: designation || null,
                tags: JSON.stringify(tagsArray),
                notes: notes || null,
                isCompletedProfile: true // Mark profile as completed on save
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
                        <Text style={styles.headerTitle}>{isEditing ? 'Edit Contact' : 'New Contact'}</Text>
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

                    <Input
                        label="Name"
                        placeholder="Contact Name"
                        value={name}
                        onChangeText={setName}
                        autoFocus={!isEditing}
                    />

                    <View style={{ flexDirection: 'row', gap: spacing.md }}>
                        <Input
                            label="Phone"
                            placeholder="+1 234..."
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                            containerStyle={{ flex: 1 }}
                        />
                        <Input
                            label="Email"
                            placeholder="john@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            containerStyle={{ flex: 1 }}
                        />
                    </View>

                    <Input
                        label="Company"
                        placeholder="Company Name"
                        value={companyName}
                        onChangeText={setCompanyName}
                    />

                    <Input
                        label="Designation"
                        placeholder="Job Title"
                        value={designation}
                        onChangeText={setDesignation}
                    />

                    <Input
                        label="Tags"
                        placeholder="client, urgent, friend (comma separated)"
                        value={tagsInput}
                        onChangeText={setTagsInput}
                    />

                    <Input
                        label="Notes"
                        placeholder="Private notes..."
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
});
