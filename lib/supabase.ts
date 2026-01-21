/**
 * Supabase Client Configuration
 * 
 * Provides Supabase client with JWT token management for auth
 */

import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('[Supabase] URL:', supabaseUrl);

/**
 * Secure storage adapter for React Native
 * Persists JWT tokens securely
 */
const SecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Ignore errors
    }
  },
  removeItem: async (key: string) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      // Ignore errors
    }
  },
};

/**
 * Supabase Client instance
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: SecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

/**
 * Helper to get current user's JWT token
 */
export async function getAuthToken() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}
