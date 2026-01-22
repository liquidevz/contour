/**
 * Edit Meeting Screen - With ScreenHeader
 */

import { spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { CREATE_MEETING, UPDATE_MEETING } from '@/graphql/mutations';
import { GET_MEETING_DETAILS } from '@/graphql/queries';
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

export default function EditMeetingScreen() {
    const { id, contactId } = useLocalSearchParams();
    const isEditing = !!id;
    const router = useRouter();
    const { theme, colorScheme } = useTheme();

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [meetingType, setMeetingType] = useState('online');
    const [location, setLocation] = useState('');
    const [notes, setNotes] = useState('');
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        if (isEditing && typeof id === 'string') {
            fetchDetails(id);
        }
    }, [id]);

    const fetchDetails = async (meetingId: string) => {
        const result = await executeGraphQL(GET_MEETING_DETAILS.loc?.source.body || '', { id: meetingId });
        if (result.data?.meetingsCollection?.edges?.[0]?.node) {
            const meeting = result.data.meetingsCollection.edges[0].node;
            setTitle(meeting.title);
            setMeetingType(meeting.meeting_type);
            setLocation(meeting.location || '');
            setNotes(meeting.notes || '');
            if (meeting.scheduled_start) setDate(new Date(meeting.scheduled_start));
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            Alert.alert('Validation Error', 'Title is required');
            return;
        }

        setLoading(true);
        try {
            const variables = {
                title,
                meetingType,
                location,
                notes,
                scheduledStart: date.toISOString(),
                ...(contactId ? { contactId } : {})
            };

            if (isEditing) {
                const result = await executeGraphQLMutation(UPDATE_MEETING.loc?.source.body || '', { id, ...variables });
                if (result.error) throw new Error(result.error.message);
            } else {
                const result = await executeGraphQLMutation(CREATE_MEETING.loc?.source.body || '', variables);
                if (result.error) throw new Error(result.error.message);
            }

            Alert.alert('Success', `Meeting ${isEditing ? 'updated' : 'created'} successfully`, [
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
                title={isEditing ? 'Edit Meeting' : 'New Meeting'}
                onBack={() => router.back()}
                onAction={handleSave}
                actionLabel="Save"
                actionLoading={loading}
            />

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <Input
                        label="Title"
                        placeholder="Meeting Title"
                        value={title}
                        onChangeText={setTitle}
                        autoFocus={!isEditing}
                    />

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Date & Time</Text>
                        <Button
                            title={date.toLocaleString()}
                            variant="secondary"
                            icon="calendar-outline"
                            onPress={() => Alert.alert('Date Picker', 'Date picker component would open here.')}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Type</Text>
                        <View style={styles.selectorRow}>
                            {['online', 'in_person', 'call'].map(t => (
                                <Badge
                                    key={t}
                                    label={t.replace('_', ' ').toUpperCase()}
                                    variant={meetingType === t ? 'default' : 'outline'}
                                    onPress={() => setMeetingType(t)}
                                    style={{
                                        flex: 1,
                                        justifyContent: 'center',
                                        backgroundColor: meetingType === t ? theme.textPrimary : 'transparent',
                                        borderColor: meetingType === t ? 'transparent' : theme.border
                                    }}
                                    textStyle={{ color: meetingType === t ? theme.textInverse : theme.textSecondary }}
                                />
                            ))}
                        </View>
                    </View>

                    <Input
                        label="Location"
                        placeholder="e.g. Zoom Link or Address"
                        value={location}
                        onChangeText={setLocation}
                    />

                    <Input
                        label="Notes"
                        placeholder="Meeting agenda or notes..."
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
