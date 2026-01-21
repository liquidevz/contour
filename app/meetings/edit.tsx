/**
 * Edit Meeting Screen
 * 
 * Form for Creating/Editing Meetings.
 */

import { spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { CREATE_MEETING, UPDATE_MEETING } from '@/graphql/mutations';
import { GET_MEETING_DETAILS } from '@/graphql/queries';
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

export default function EditMeetingScreen() {
    const { id, contactId } = useLocalSearchParams();
    const isEditing = !!id;
    const router = useRouter();
    const { theme } = useTheme();

    const [loading, setLoading] = useState(false);

    // Form State
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
                // If creating and contactId is present, link it.
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
                        <Text style={styles.headerTitle}>{isEditing ? 'Edit Meeting' : 'New Meeting'}</Text>
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
                        label="Title"
                        placeholder="Meeting Title"
                        value={title}
                        onChangeText={setTitle}
                        autoFocus={!isEditing}
                    />

                    {/* Date Picker Placeholder */}
                    <View style={styles.section}>
                        <Text style={[styles.label, { color: theme.textSecondary }]}>Date & Time</Text>
                        <Button
                            title={date.toLocaleString()}
                            variant="secondary"
                            icon="calendar-outline"
                            onPress={() => Alert.alert('Date Picker', 'Date picker component would open here.')}
                        />
                    </View>

                    {/* Type Selector */}
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
                                        backgroundColor: meetingType === t ? theme.primary : 'transparent',
                                        borderColor: meetingType === t ? 'transparent' : theme.border
                                    }}
                                    textStyle={{ color: meetingType === t ? '#fff' : theme.textSecondary }}
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
