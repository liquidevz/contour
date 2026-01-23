import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import { suggestTags } from '@/lib/tags';
import { Tag } from '@/types/profile';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TagInputProps {
    type: 'offer' | 'want';
    onAddTag: (tag: Tag) => void;
    existingTags: Tag[];
}

export default function TagInput({ type, onAddTag, existingTags }: TagInputProps) {
    const { theme } = useTheme();
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [noResults, setNoResults] = useState(false);

    // Custom debounce logic
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

    const searchTags = useCallback((text: string) => {
        if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
        }

        if (!text.trim()) {
            setSuggestions([]);
            setLoading(false);
            setNoResults(false);
            return;
        }

        setLoading(true);
        setNoResults(false);

        debounceTimeout.current = setTimeout(async () => {
            const { data } = await suggestTags(type, text);
            if (data) {
                // Filter out tags that are already selected
                const filtered = data.filter(
                    suggestion => !existingTags.some(existing => existing.id === suggestion.id)
                );
                setSuggestions(filtered);
                setNoResults(filtered.length === 0);
            } else {
                setSuggestions([]);
                setNoResults(true);
            }
            setLoading(false);
        }, 300) as unknown as NodeJS.Timeout;
    }, [type, existingTags]);

    useEffect(() => {
        // Trigger search when query changes
        searchTags(query);
        setShowSuggestions(!!query.trim());

        return () => {
            if (debounceTimeout.current) {
                clearTimeout(debounceTimeout.current);
            }
        };
    }, [query, searchTags]);

    const handleSelectSuggestion = (tag: Tag) => {
        onAddTag(tag);
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    return (
        <View style={styles.container}>
            <View style={[styles.inputContainer, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    placeholder={type === 'offer' ? "Add what you can offer..." : "Add what you are looking for..."}
                    placeholderTextColor={theme.textSecondary}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                />
                {loading && <ActivityIndicator size="small" color={theme.accent} style={styles.loader} />}
            </View>

            {showSuggestions && (
                <View style={[styles.dropdown, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                    {suggestions.map(suggestion => (
                        <TouchableOpacity
                            key={suggestion.id}
                            style={[styles.suggestionItem, { borderBottomColor: theme.border }]}
                            onPress={() => handleSelectSuggestion(suggestion)}
                        >
                            <Text style={[styles.suggestionText, { color: theme.textPrimary }]}>
                                {suggestion.name}
                            </Text>
                            <Text style={[styles.usageText, { color: theme.textSecondary }]}>
                                {suggestion.usage_count} uses
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {!loading && noResults && (
                        <View style={styles.noResultsItem}>
                            <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
                                No matching options
                            </Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        zIndex: 10, // Ensure dropdown floats above other content
        marginBottom: spacing.sm,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: borderRadius.md,
        paddingHorizontal: spacing.sm,
        height: 40,
    },
    input: {
        flex: 1,
        paddingVertical: spacing.xs,
        fontSize: typography.fontSize.base,
    },
    loader: {
        marginLeft: spacing.xs,
    },
    dropdown: {
        position: 'absolute',
        top: 45,
        left: 0,
        right: 0,
        borderWidth: 1,
        borderRadius: borderRadius.md,
        maxHeight: 200,
        zIndex: 1000,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    suggestionItem: {
        padding: spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    suggestionText: {
        fontSize: typography.fontSize.base,
    },
    usageText: {
        fontSize: typography.fontSize.xs,
    },
    noResultsItem: {
        padding: spacing.sm,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noResultsText: {
        fontSize: typography.fontSize.sm,
        fontStyle: 'italic',
    }
});
