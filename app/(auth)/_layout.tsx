/**
 * Auth Stack Layout
 * 
 * Contains login and signup screens
 * Only shown when user is not authenticated
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#0a0a0a' },
            }}
        >
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
        </Stack>
    );
}
