/**
 * SegmentedControl Component - Uber Style
 * 
 * Modern tab/segment control with animated pill indicator
 */

import { borderRadius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import {
    LayoutChangeEvent,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface SegmentedControlProps {
    segments: string[];
    selectedIndex: number;
    onChange: (index: number) => void;
    style?: ViewStyle;
    size?: 'sm' | 'md' | 'lg';
}

export default function SegmentedControl({
    segments,
    selectedIndex,
    onChange,
    style,
    size = 'md',
}: SegmentedControlProps) {
    const { theme } = useTheme();
    const [segmentWidths, setSegmentWidths] = React.useState<number[]>([]);
    const translateX = useSharedValue(0);

    // Size configurations
    const sizeConfig = {
        sm: { height: 32, fontSize: typography.fontSize.xs, padding: spacing.sm },
        md: { height: 40, fontSize: typography.fontSize.sm, padding: spacing.md },
        lg: { height: 48, fontSize: typography.fontSize.base, padding: spacing.lg },
    };

    const currentSize = sizeConfig[size];

    React.useEffect(() => {
        if (segmentWidths.length === segments.length) {
            let offset = 0;
            for (let i = 0; i < selectedIndex; i++) {
                offset += segmentWidths[i];
            }
            translateX.value = withSpring(offset, {
                damping: 20,
                stiffness: 200,
            });
        }
    }, [selectedIndex, segmentWidths]);

    const handleLayout = (index: number) => (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        setSegmentWidths((prev) => {
            const newWidths = [...prev];
            newWidths[index] = width;
            return newWidths;
        });
    };

    const indicatorStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
        width: segmentWidths[selectedIndex] || 0,
    }));

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: theme.backgroundSecondary,
                    height: currentSize.height,
                },
                style,
            ]}
        >
            <Animated.View
                style={[
                    styles.indicator,
                    {
                        backgroundColor: theme.textPrimary,
                        height: currentSize.height - 6,
                    },
                    indicatorStyle,
                ]}
            />

            {segments.map((segment, index) => (
                <TouchableOpacity
                    key={segment}
                    style={styles.segment}
                    onPress={() => onChange(index)}
                    onLayout={handleLayout(index)}
                    activeOpacity={0.7}
                >
                    <Text
                        style={[
                            styles.segmentText,
                            {
                                color: selectedIndex === index
                                    ? theme.textInverse
                                    : theme.textSecondary,
                                fontSize: currentSize.fontSize,
                                fontWeight: selectedIndex === index
                                    ? typography.fontWeight.semibold
                                    : typography.fontWeight.medium,
                            },
                        ]}
                    >
                        {segment}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        borderRadius: borderRadius.lg,
        padding: 3,
        position: 'relative',
    },
    indicator: {
        position: 'absolute',
        top: 3,
        left: 3,
        borderRadius: borderRadius.md,
    },
    segment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    segmentText: {
        textTransform: 'capitalize',
    },
});
