/**
 * Login Screen - Uber Style
 * 
 * Clean, minimal auth screen with black/white aesthetic
 */

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LoginScreen() {
    const { signIn } = useAuth();
    const { theme, colorScheme } = useTheme();
    const insets = useSafeAreaInsets();
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
            style={[styles.container, { backgroundColor: theme.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingTop: insets.top + 60,
                        paddingBottom: insets.bottom + 40,
                    }
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* Logo/Header */}
                <Animated.View style={[styles.header, logoAnimatedStyle]}>
                    <View style={[styles.logoContainer, { backgroundColor: theme.textPrimary }]}>
                        <Ionicons name="people" size={40} color={theme.textInverse} />
                    </View>
                    <Text style={[styles.title, { color: theme.textPrimary }]}>
                        Welcome back
                    </Text>
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Sign in to continue to Contour
                    </Text>
                </Animated.View>

                {/* Form */}
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
                        size="lg"
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
                        size="lg"
                    />

                    <Button
                        title="Sign In"
                        onPress={handleLogin}
                        loading={loading}
                        disabled={loading}
                        icon="arrow-forward"
                        iconPosition="right"
                        fullWidth
                        size="xl"
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
                        />
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logoContainer: {
        width: 80,
        height: 80,
        borderRadius: borderRadius.xl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        marginBottom: spacing.xs,
        letterSpacing: typography.letterSpacing.tight,
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
        marginTop: spacing.xl,
    },
    footerText: {
        fontSize: typography.fontSize.base,
    },
});
