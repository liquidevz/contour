import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { ScrollViewProps, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScreenScrollViewProps extends ScrollViewProps {
    children: React.ReactNode;
    useSafeArea?: boolean;
    bottomPadding?: number;
}

export default function ScreenScrollView({
    children,
    useSafeArea = true,
    bottomPadding = 0,
    contentContainerStyle,
    style,
    ...props
}: ScreenScrollViewProps) {
    const insets = useSafeAreaInsets();
    const { theme } = useTheme();

    return (
        <Animated.ScrollView
            style={[
                styles.container,
                { backgroundColor: theme.background },
                style
            ]}
            contentContainerStyle={[
                {
                    paddingBottom: (useSafeArea ? insets.bottom : 0) + bottomPadding,
                },
                contentContainerStyle,
            ]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            {...props}
        >
            {children}
        </Animated.ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
