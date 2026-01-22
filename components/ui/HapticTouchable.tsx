/**
 * HapticTouchable Component
 * 
 * Wrapper for TouchableOpacity that adds haptic feedback
 * Platform-aware: only triggers on iOS and Android, not web
 */

import * as Haptics from 'expo-haptics';
import React from 'react';
import { Platform, TouchableOpacity, TouchableOpacityProps } from 'react-native';

interface HapticTouchableProps extends TouchableOpacityProps {
    hapticStyle?: 'light' | 'medium' | 'heavy';
    disabled?: boolean;
}

export default function HapticTouchable({
    hapticStyle = 'light',
    disabled = false,
    onPress,
    children,
    ...props
}: HapticTouchableProps) {
    const handlePress = (event: any) => {
        if (!disabled && Platform.OS !== 'web') {
            switch (hapticStyle) {
                case 'light':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    break;
                case 'medium':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    break;
                case 'heavy':
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                    break;
            }
        }
        onPress?.(event);
    };

    return (
        <TouchableOpacity
            {...props}
            disabled={disabled}
            onPress={handlePress}
        >
            {children}
        </TouchableOpacity>
    );
}
