/**
 * Authentication Context
 * 
 * Provides auth state and methods throughout the app:
 * - user: Current user object
 * - session: Current session with JWT token
 * - loading: Initial auth state loading
 * - signIn, signUp, signOut methods
 */

import { getProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';
import { Profile } from '@/types/profile';
import { Session, User } from '@supabase/supabase-js';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    profileLoading: boolean;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(false);

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            // Load profile if user exists
            if (session?.user) {
                loadProfile(session.user.id);
            }

            setLoading(false);
        });

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (_event, session) => {
                setSession(session);
                setUser(session?.user ?? null);

                // Load profile when user signs in
                if (session?.user) {
                    await loadProfile(session.user.id);
                } else {
                    setProfile(null);
                }

                setLoading(false);
            }
        );

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const loadProfile = async (userId: string) => {
        setProfileLoading(true);
        const { data } = await getProfile(userId);
        if (data) {
            setProfile(data);
        }
        setProfileLoading(false);
    };

    const refreshProfile = async () => {
        if (user) {
            await loadProfile(user.id);
        }
    };

    /**
     * Sign in with email and password
     */
    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });
        return { error: error as Error | null };
    };

    /**
     * Sign up with email and password
     */
    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
        });
        return { error: error as Error | null };
    };

    /**
     * Sign out current user
     */
    const signOut = async () => {
        await supabase.auth.signOut();
    };

    const value = {
        user,
        session,
        profile,
        profileLoading,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook to access auth context
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
