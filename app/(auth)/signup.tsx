/**
 * Signup Screen
 * 
 * Premium redesign with:
 * - Gradient background
 * - Animated form entry
 * - Theme-aware components
 * - OAuth integration
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    Image,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { supabase } from '@/lib/supabase';
import { spacing, typography, borderRadius } from '@/constants/tokens';

import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function SignupScreen() {
    const router = useRouter();
    const { signUp } = useAuth();
    const { theme, colorScheme } = useTheme();

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
        <View style={styles.container}>
            <LinearGradient
                colors={
                    colorScheme === 'dark'
                        ? ['#2c3e50', '#000000']
                        : ['#e0eafc', '#cfdef3']
                }
                style={styles.gradient}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={styles.keyboardView}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Animated.View entering={FadeInUp.delay(200).springify()} style={styles.header}>
                            {/* Placeholder Logo - In real app, use generic icon or text if logo image is missing */}
                            <View style={[styles.logoPlaceholder, { backgroundColor: theme.primary }]}>
                                <Text style={styles.logoText}>C</Text>
                            </View>
                            <Text style={[styles.title, { color: theme.textPrimary }]}>Create Account</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Join us today!</Text>
                        </Animated.View>

                        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.form}>
                            <Input
                                label="Email"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                leftIcon="mail-outline"
                                error={emailError}
                            />

                            <Input
                                label="Password"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Create a password"
                                secureTextEntry
                                leftIcon="lock-closed-outline"
                                error={passwordError}
                            />

                            <Input
                                label="Confirm Password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                placeholder="Confirm your password"
                                secureTextEntry
                                leftIcon="lock-closed-outline"
                                error={confirmError}
                            />

                            <Button
                                title="Sign Up"
                                onPress={handleSignup}
                                loading={loading}
                                style={styles.button}
                                size="lg"
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
                                    style={styles.linkButton}
                                />
                            </View>
                        </Animated.View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: spacing.xl,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    logoText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.lg,
    },
    form: {
        gap: spacing.md,
    },
    button: {
        marginTop: spacing.sm,
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
    linkButton: {
        marginLeft: -8,
    },
});
