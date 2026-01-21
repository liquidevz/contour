/**
 * Root Layout
 * 
 * Wraps the entire app with:
 * - ThemeProvider (custom light/dark theme)
 * - AuthProvider (authentication state)
 * - Custom animated splash screen
 * 
 * Handles conditional navigation:
 * - Shows auth screens when not logged in
 * - Shows main app when authenticated
 */

import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

/**
 * Navigation guard component
 * Redirects based on auth state
 */
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const { theme, colorScheme } = useTheme();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Not logged in, redirect to login
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Logged in, redirect to main app
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="contact/[id]"
          options={{
            headerShown: true,
            headerStyle: { backgroundColor: theme.surface },
            headerTintColor: theme.textPrimary,
            headerTitle: 'Contact Details',
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavThemeProvider>
  );
}

/**
 * Root Layout - wraps everything with providers
 */
export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
