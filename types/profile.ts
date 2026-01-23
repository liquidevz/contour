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
