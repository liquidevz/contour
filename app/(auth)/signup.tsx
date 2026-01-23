/**
 * Signup Screen - Uber Style
 * 
 * Clean, minimal signup with black/white aesthetic
 */

import { makeRedirectUri } from 'expo-auth-session';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { createProfile } from '@/lib/profile';
import { supabase } from '@/lib/supabase';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

WebBrowser.maybeCompleteAuthSession();

export default function SignupScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const { theme, colorScheme } = useTheme();
    const insets = useSafeAreaInsets();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    // Validation state
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [confirmError, setConfirmError] = useState('');

    const validate = () => {
        let valid = true;
        if (!email.includes('@')) {
            setEmailError('Invalid email address');
            valid = false;
        } else {
            setEmailError('');
        }

        if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        } else {
            setPasswordError('');
        }

        if (password !== confirmPassword) {
            setConfirmError('Passwords do not match');
            valid = false;
        } else {
            setConfirmError('');
        }

        return valid;
    };

    const handleSignup = async () => {
        if (!validate()) return;

        setLoading(true);
        const { error } = await signUp(email, password);
        setLoading(false);

        if (error) {
            Alert.alert('Signup Failed', error.message);
        } else {
            // Get the newly created user
            const { data: { user } } = await supabase.auth.getUser();

            // Create initial profile
            if (user) {
                await createProfile(user.id);
            }

            Alert.alert(
                'Check Your Email',
                'We sent you a confirmation link. Please verify your email to continue.',
                [{ text: 'OK', onPress: () => router.replace('/login') }]
            );
        }
    };

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        try {
            const redirectUrl = makeRedirectUri({
                path: '/auth/callback',
                scheme: 'contourz'
            });

            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: redirectUrl,
                    skipBrowserRedirect: false,
                },
            });

            if (error) throw error;

            if (data?.url) {
                const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);
                if (result.type === 'success') {
                    // Auth state change will handle navigation
                }
            }
        } catch (error: any) {
            Alert.alert('Google Signup Error', error.message);
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={[
                        styles.scrollContent,
                        {
                            paddingTop: insets.top + 40,
                            paddingBottom: insets.bottom + 40,
                        }
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View entering={FadeInUp.delay(100).springify()} style={styles.header}>
                        <View style={[styles.logoContainer, { backgroundColor: theme.textPrimary }]}>
                            <Text style={[styles.logoText, { color: theme.textInverse }]}>C</Text>
                        </View>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>Create Account</Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join Contour today</Text>
                    </Animated.View>

                    <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
                        <Input
                            label="Email"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            leftIcon="mail-outline"
                            error={emailError}
                            size="lg"
                        />

                        <Input
                            label="Password"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Create a password"
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={passwordError}
                            size="lg"
                        />

                        <Input
                            label="Confirm Password"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm your password"
                            secureTextEntry
                            leftIcon="lock-closed-outline"
                            error={confirmError}
                            size="lg"
                        />

                        <Button
                            title="Create Account"
                            onPress={handleSignup}
                            loading={loading}
                            size="xl"
                            fullWidth
                            style={{ marginTop: spacing.sm }}
                        />

                        <View style={styles.divider}>
                            <View style={[styles.line, { backgroundColor: theme.border }]} />
                            <Text style={[styles.dividerText, { color: theme.textSecondary }]}>OR</Text>
                            <View style={[styles.line, { backgroundColor: theme.border }]} />
                        </View>

                        <Button
                            title="Continue with Google"
                            onPress={handleGoogleLogin}
                            variant="outline"
                            loading={googleLoading}
                            icon="logo-google"
                            size="lg"
                            fullWidth
                        />

                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                                Already have an account?
                            </Text>
                            <Button
                                title="Sign In"
                                variant="ghost"
                                size="sm"
                                onPress={() => router.push('/login')}
                            />
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoContainer: {
        width: 72,
        height: 72,
        borderRadius: borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    logoText: {
        fontSize: typography.fontSize['4xl'],
        fontWeight: typography.fontWeight.bold,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.xs,
        letterSpacing: typography.letterSpacing.tight,
    },
    subtitle: {
        fontSize: typography.fontSize.lg,
    },
    form: {
        gap: spacing.sm,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.lg,
    },
    line: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        paddingHorizontal: spacing.md,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        fontSize: typography.fontSize.base,
    },
});
