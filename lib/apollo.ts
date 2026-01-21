/**
 * urql Client Configuration for pg_graphql
 * 
 * Configures urql to connect to Supabase's pg_graphql endpoint
 * with automatic JWT token injection for authenticated requests.
 */

import { createClient, fetchExchange, FetchOptions } from 'urql';
import { getAuthToken } from './supabase';

// pg_graphql endpoint is always at /graphql/v1 on your Supabase URL
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const graphqlUrl = `${supabaseUrl}/graphql/v1`;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

console.log('[urql] GraphQL URL:', graphqlUrl);
console.log('[urql] Supabase URL:', supabaseUrl);

/**
 * Custom fetch with auth headers and POST method
 * Supabase pg_graphql requires POST requests
 */
const customFetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const token = await getAuthToken();

    const headers = new Headers(init?.headers);
    headers.set('apikey', supabaseAnonKey);
    headers.set('Content-Type', 'application/json');

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    // Force POST method for all GraphQL requests
    const fetchOptions: RequestInit = {
        ...init,
        method: 'POST',
        headers,
    };

    console.log('[urql] Fetching with POST:', input);

    try {
        const response = await fetch(input, fetchOptions);
        console.log('[urql] Response status:', response.status);

        if (!response.ok) {
            const text = await response.text();
            console.log('[urql] Error response:', text);
        }

        return response;
    } catch (error) {
        console.error('[urql] Fetch error:', error);
        throw error;
    }
};

/**
 * urql Client instance
 */
export const urqlClient = createClient({
    url: graphqlUrl,
    fetch: customFetch,
    exchanges: [fetchExchange],
    // Force POST for all operations
    fetchOptions: {
        method: 'POST',
    } as FetchOptions,
});
