import { spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { Tag } from '@/types/profile';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import TagChip from './TagChip';
import TagInput from './TagInput';

interface ProfileTagsSectionProps {
    type: 'offer' | 'want';
    tags: Tag[]; // These are 'Tag' objects, but in the profile context we need to match them to ProfileTags for removal
    onAddTag: (tag: Tag) => void;
    onRemoveTag: (tag: Tag) => void;
    loading?: boolean;
}

export default function ProfileTagsSection({
    type,
    tags,
    onAddTag,
    onRemoveTag,
    loading
}: ProfileTagsSectionProps) {
    const { theme } = useTheme();

    const title = type === 'offer' ? "What I can offer" : "What I want";

    return (
        <View style={styles.container}>
            <Text style={[styles.title, { color: theme.textSecondary }]}>
                {title.toUpperCase()}
            </Text>

            <View style={styles.chipsContainer}>
                {tags.map(tag => (
                    <TagChip
                        key={tag.id}
                        tag={tag}
                        onRemove={() => onRemoveTag(tag)}
                    />
                ))}
            </View>

            <TagInput
                type={type}
                existingTags={tags}
                onAddTag={onAddTag}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: typography.letterSpacing.wider,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.sm,
    },
});
