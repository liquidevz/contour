/**
 * Profile Types
 * 
 * TypeScript interfaces for user profile data
 */

export interface Profile {
    id: string;
    username: string | null;
    display_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    is_public: boolean;
    created_at: string;
    is_complete: boolean;
    tags?: ProfileTag[];
}

export interface Tag {
    id: string;
    name: string;
    normalized_name: string;
    tag_type: 'offer' | 'want';
    usage_count: number;
}

export interface ProfileTag {
    id: string; // The profile_tag ID (needed for removal)
    tag_id: string;
    profile_id: string;
    tag: Tag;
}

export interface ProfileUpdateInput {
    username?: string;
    display_name?: string;
    bio?: string;
    avatar_url?: string;
    is_public?: boolean;
}

export interface ProfileCompletionStatus {
    isComplete: boolean;
    completionPercentage: number;
    missingFields: string[];
}
