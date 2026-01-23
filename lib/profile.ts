/**
 * Profile Service
 * 
 * Functions for managing user profiles via GraphQL
 */

import { Profile, ProfileCompletionStatus, ProfileUpdateInput } from '@/types/profile';
import { executeGraphQL, executeGraphQLMutation } from './graphql';

/**
 * Get user profile by user ID
 */
export async function getProfile(userId: string): Promise<{ data?: Profile; error?: Error }> {
    const query = `
        query GetProfile($userId: UUID!) {
            profilesCollection(filter: { id: { eq: $userId } }) {
                edges {
                    node {
                        id
                        username
                        display_name
                        bio
                        avatar_url
                        is_public
                        created_at
                        is_complete
                    }
                }
            }
        }
    `;

    const result = await executeGraphQL<{ profilesCollection: { edges: Array<{ node: Profile }> } }>(
        query,
        { userId }
    );

    if (result.error) {
        return { error: result.error };
    }

    const profile = result.data?.profilesCollection?.edges[0]?.node;
    if (!profile) {
        return { error: new Error('Profile not found') };
    }

    return { data: profile };
}

/**
 * Create initial profile for new user
 */
export async function createProfile(userId: string): Promise<{ data?: Profile; error?: Error }> {
    const mutation = `
        mutation CreateProfile($userId: UUID!) {
            insertIntoprofilesCollection(objects: [{
                id: $userId
                is_public: true
                is_complete: false
            }]) {
                records {
                    id
                    username
                    display_name
                    bio
                    avatar_url
                    is_public
                    created_at
                    is_complete
                }
            }
        }
    `;

    const result = await executeGraphQLMutation<{ insertIntoprofilesCollection: { records: Profile[] } }>(
        mutation,
        { userId }
    );

    if (result.error) {
        return { error: result.error };
    }

    const profile = result.data?.insertIntoprofilesCollection?.records[0];
    if (!profile) {
        return { error: new Error('Failed to create profile') };
    }

    return { data: profile };
}

/**
 * Update user profile
 */
export async function updateProfile(
    userId: string,
    updates: ProfileUpdateInput
): Promise<{ data?: Profile; error?: Error }> {
    // Build the set fields dynamically
    const setFields = Object.entries(updates)
        .map(([key, value]) => {
            if (typeof value === 'string') {
                return `${key}: "${value}"`;
            } else if (typeof value === 'boolean') {
                return `${key}: ${value}`;
            }
            return '';
        })
        .filter(Boolean)
        .join(', ');

    const mutation = `
        mutation UpdateProfile($userId: UUID!) {
            updateprofilesCollection(
                filter: { id: { eq: $userId } }
                set: { ${setFields} }
            ) {
                records {
                    id
                    username
                    display_name
                    bio
                    avatar_url
                    is_public
                    created_at
                    is_complete
                }
            }
        }
    `;

    const result = await executeGraphQLMutation<{ updateprofilesCollection: { records: Profile[] } }>(
        mutation,
        { userId }
    );

    if (result.error) {
        return { error: result.error };
    }

    const profile = result.data?.updateprofilesCollection?.records[0];
    if (!profile) {
        return { error: new Error('Failed to update profile') };
    }

    return { data: profile };
}

/**
 * Check profile completion status
 */
export function checkProfileCompletion(profile: Profile | null): ProfileCompletionStatus {
    if (!profile) {
        return {
            isComplete: false,
            completionPercentage: 0,
            missingFields: ['username', 'display_name', 'bio'],
        };
    }

    const requiredFields = ['username', 'display_name', 'bio'];
    const missingFields: string[] = [];
    let filledCount = 0;

    requiredFields.forEach(field => {
        const value = profile[field as keyof Profile];
        if (value && typeof value === 'string' && value.trim() !== '') {
            filledCount++;
        } else {
            missingFields.push(field);
        }
    });

    const completionPercentage = Math.round((filledCount / requiredFields.length) * 100);
    const isComplete = missingFields.length === 0;

    return {
        isComplete,
        completionPercentage,
        missingFields,
    };
}

/**
 * Mark profile as complete
 */
export async function markProfileComplete(userId: string): Promise<{ error?: Error }> {
    return await updateProfile(userId, { is_complete: true } as any);
}
