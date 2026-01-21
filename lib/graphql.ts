/**
 * GraphQL Client using Supabase RPC
 * 
 * Since Supabase doesn't expose pg_graphql over HTTP at /graphql/v1,
 * we use RPC functions that call graphql.resolve() internally.
 */

import { supabase } from './supabase';

/**
 * Execute a GraphQL query via Supabase RPC
 */
export async function executeGraphQL<T = any>(
    query: string,
    variables: Record<string, any> = {}
): Promise<{ data?: T; error?: Error }> {
    try {
        console.log('[GraphQL RPC] Executing query:', query.substring(0, 100) + '...');

        const { data, error } = await supabase.rpc('graphql_query', {
            query,
            variables: variables || {},
        });

        if (error) {
            console.error('[GraphQL RPC] Supabase Error:', error);
            return { error: new Error(error.message) };
        }

        // Log full response to see GraphQL errors
        console.log('[GraphQL RPC] Full Response:', JSON.stringify(data, null, 2));

        // Check for GraphQL errors in the response
        if (data?.errors && data.errors.length > 0) {
            console.error('[GraphQL RPC] GraphQL Errors:', data.errors);
            return { error: new Error(data.errors[0].message) };
        }

        console.log('[GraphQL RPC] Success');
        return { data: data?.data as T };
    } catch (err) {
        console.error('[GraphQL RPC] Exception:', err);
        return { error: err as Error };
    }
}

/**
 * Execute a GraphQL mutation via Supabase RPC
 */
export async function executeGraphQLMutation<T = any>(
    mutation: string,
    variables: Record<string, any> = {}
): Promise<{ data?: T; error?: Error }> {
    return executeGraphQL<T>(mutation, variables);
}
