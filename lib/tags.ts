/**
 * Tag Service
 * 
 * Functions for managing tags and profile offers/wants
 * 
 * STRICT RULES (User Defined):
 * - Tags are SYSTEM-CONTROLLED (read-only for users)
 * - NO user-generated tag creation
 * - NO update/delete of tags
 * - ONLY Attach/Remove existing tags to profile
 */

import { ProfileTag, Tag } from '@/types/profile';
import { executeGraphQL, executeGraphQLMutation } from './graphql';

/**
 * Suggest tags based on type and query
 * Only fetches existing system tags.
 */
export async function suggestTags(type: 'offer' | 'want', query: string): Promise<{ data?: Tag[]; error?: Error }> {
    const gqlQuery = `
        query SuggestTags($type: String!, $query: String!) {
            tagsCollection(
                filter: {
                    tag_type: { eq: $type }
                    normalized_name: { ilike: $query }
                    is_active: { eq: true }
                }
                orderBy: { usage_count: Desc }
                first: 20
            ) {
                edges {
                    node {
                        id
                        name
                        normalized_name
                        tag_type
                        usage_count
                    }
                }
            }
        }
    `;

    // ilike uses % for wildcards
    const searchString = `%${query.trim().toLowerCase()}%`;

    const result = await executeGraphQL<{ tagsCollection: { edges: Array<{ node: Tag }> } }>(
        gqlQuery,
        { type, query: searchString }
    );

    if (result.error) {
        console.error('[suggestTags] Error:', result.error);
        return { error: result.error };
    }

    const tags = result.data?.tagsCollection?.edges.map(e => e.node) || [];
    return { data: tags };
}

/**
 * Attach Tag to Profile
 * 
 * Input: profileId (UUID), tagId (UUID)
 * Table affected: profile_tags
 * Behavior: insert a row linking profile_id and tag_id
 */
export async function attachTagToProfile(profileId: string, tagId: string): Promise<{ data?: ProfileTag; error?: Error }> {
    const mutation = `
        mutation AttachTagToProfile($profileId: UUID!, $tagId: UUID!) {
            insertIntoprofile_tagsCollection(
                objects: [{
                    profile_id: $profileId
                    tag_id: $tagId
                }]
            ) {
                records {
                    id
                    profile_id
                    profile_id
                    tag_id
                    tags {
                        id
                        name
                        normalized_name
                        tag_type
                    }
                }
            }
        }
    `;

    const result = await executeGraphQLMutation<{ insertIntoprofile_tagsCollection: { records: ProfileTag[] } }>(
        mutation,
        { profileId, tagId }
    );

    if (result.error) {
        console.error('[attachTagToProfile] Error:', result.error);
        return { error: result.error };
    }

    const profileTag = result.data?.insertIntoprofile_tagsCollection?.records[0];
    if (!profileTag) {
        return { error: new Error('Failed to attach tag to profile') };
    }

    return { data: profileTag };
}

/**
 * Remove Tag from Profile
 * 
 * Input: profileTagId (UUID)
 * Table affected: profile_tags
 * Behavior: delete the row by profile_tags.id
 */
export async function removeTagFromProfile(profileTagId: string): Promise<{ data?: boolean; error?: Error }> {
    const mutation = `
        mutation RemoveTagFromProfile($id: UUID!) {
            deleteFromprofile_tagsCollection(
                filter: { id: { eq: $id } }
            ) {
                affectedCount
            }
        }
    `;

    const result = await executeGraphQLMutation<{ deleteFromprofile_tagsCollection: { affectedCount: number } }>(
        mutation,
        { id: profileTagId }
    );

    if (result.error) {
        console.error('[removeTagFromProfile] Error:', result.error);
        return { error: result.error };
    }

    return { data: true };
}
