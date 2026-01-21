/**
 * Login Screen
 * 
 * Modern email/password login with:
 * - Themed UI with gradient background
 * - New Input and Button components
 * - Animated logo/header
 * - Form validation
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ScrollView,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withDelay,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { spacing, typography } from '@/constants/tokens';

export default function LoginScreen() {
    const { signIn } = useAuth();
    const { theme, colorScheme } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // Entry animations
    const logoOpacity = useSharedValue(0);
    const formOpacity = useSharedValue(0);

    React.useEffect(() => {
        logoOpacity.value = withSpring(1, { damping: 15 });
        formOpacity.value = withDelay(200, withSpring(1, { damping: 15 }));
    }, []);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
    }));

    const formAnimatedStyle = useAnimatedStyle(() => ({
        opacity: formOpacity.value,
    }));

    const validateForm = () => {
        let valid = true;
        setEmailError('');
        setPasswordError('');

        if (!email) {
            setEmailError('Email is required');
            valid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            setEmailError('Please enter a valid email');
            valid = false;
        }

        if (!password) {
            setPasswordError('Password is required');
            valid = false;
        } else if (password.length < 6) {
            setPasswordError('Password must be at least 6 characters');
            valid = false;
        }

        return valid;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        const { error } = await signIn(email, password);
        setLoading(false);

        if (error) {
            Alert.alert('Login Failed', error.message);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={
                    colorScheme === 'dark'
                        ? ['#0a0a0a', '#1a1a1a']
                        : ['#ffffff', '#f8f9fa']
                }
                style={styles.gradient}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Animated Logo/Header */}
                    <Animated.View style={[styles.header, logoAnimatedStyle]}>
                        <LinearGradient
                            colors={theme.gradientPrimary as unknown as string[]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.logoContainer}
                        >
                            <Ionicons name="people" size={48} color={theme.textInverse} />
                        </LinearGradient>
                        <Text style={[styles.title, { color: theme.textPrimary }]}>
                            Welcome Back
                        </Text>
                        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                            Sign in to continue to ContourZ
                        </Text>
                    </Animated.View>

                    {/* Animated Form */}
                    <Animated.View style={[styles.form, formAnimatedStyle]}>
                        <Input
                            label="Email"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                setEmailError('');
                            }}
                            leftIcon="mail-outline"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            error={emailError}
                        />

                        <Input
                            label="Password"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                setPasswordError('');
                            }}
                            leftIcon="lock-closed-outline"
                            secureTextEntry
                            autoComplete="password"
                            error={passwordError}
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            disabled={loading}
                            icon="log-in-outline"
                            iconPosition="right"
                            fullWidth
                            style={{ marginTop: spacing.md }}
                        />

                        {/* Footer */}
                        <View style={styles.footer}>
                            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
                                Don't have an account?{' '}
                            </Text>
                            <Button
                                title="Sign Up"
                                onPress={() => router.push('/signup' as any)}
                                variant="ghost"
                                size="sm"
                                style={{ marginLeft: -spacing.sm }}
                            />
                        </View>
                    </Animated.View>
                </ScrollView>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.xl,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    logoContainer: {
        width: 96,
        height: 96,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        textAlign: 'center',
    },
    form: {
        gap: spacing.sm,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.lg,
    },
    footerText: {
        fontSize: typography.fontSize.sm,
    },
});
