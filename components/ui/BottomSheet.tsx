/**
 * BottomSheet Component - Uber Style
 * 
 * Modern bottom sheet with drag-to-dismiss and backdrop blur
 */

import { borderRadius, spacing } from '@/constants/tokens';
import { useTheme } from '@/contexts/ThemeContext';
import React, { useCallback, useEffect } from 'react';
import {
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {
    Gesture,
    GestureDetector
} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface BottomSheetProps {
    visible: boolean;
    onClose: () => void;
    children: React.ReactNode;
    snapPoints?: number[];
    initialSnapIndex?: number;
    enableDragToClose?: boolean;
    showHandle?: boolean;
}

export default function BottomSheet({
    visible,
    onClose,
    children,
    snapPoints = [0.5, 0.9],
    initialSnapIndex = 0,
    enableDragToClose = true,
    showHandle = true,
}: BottomSheetProps) {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const translateY = useSharedValue(SCREEN_HEIGHT);
    const backdropOpacity = useSharedValue(0);
    const context = useSharedValue({ y: 0 });

    const snapPointsPixels = snapPoints.map(p => SCREEN_HEIGHT * (1 - p));

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(snapPointsPixels[initialSnapIndex], {
                damping: 20,
                stiffness: 150,
            });
            backdropOpacity.value = withTiming(1, { duration: 200 });
        } else {
            translateY.value = withSpring(SCREEN_HEIGHT, {
                damping: 20,
                stiffness: 150,
            });
            backdropOpacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible]);

    const closeSheet = useCallback(() => {
        onClose();
    }, [onClose]);

    const gesture = Gesture.Pan()
        .onStart(() => {
            context.value = { y: translateY.value };
        })
        .onUpdate((event) => {
            translateY.value = Math.max(
                event.translationY + context.value.y,
                snapPointsPixels[snapPointsPixels.length - 1]
            );
        })
        .onEnd((event) => {
            const velocity = event.velocityY;

            // If dragging down fast or past threshold, close
            if (enableDragToClose && (velocity > 500 || translateY.value > SCREEN_HEIGHT * 0.7)) {
                translateY.value = withSpring(SCREEN_HEIGHT, {
                    damping: 20,
                    stiffness: 150,
                });
                runOnJS(closeSheet)();
                return;
            }

            // Snap to nearest snap point
            let nearestSnap = snapPointsPixels[0];
            let minDistance = Math.abs(translateY.value - nearestSnap);

            for (const snap of snapPointsPixels) {
                const distance = Math.abs(translateY.value - snap);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestSnap = snap;
                }
            }

            translateY.value = withSpring(nearestSnap, {
                damping: 20,
                stiffness: 150,
            });
        });

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const backdropStyle = useAnimatedStyle(() => ({
        opacity: backdropOpacity.value,
        pointerEvents: visible ? 'auto' : 'none',
    }));

    if (!visible && backdropOpacity.value === 0) {
        return null;
    }

    return (
        <View style={StyleSheet.absoluteFillObject} pointerEvents={visible ? 'auto' : 'none'}>
            <TouchableWithoutFeedback onPress={closeSheet}>
                <Animated.View
                    style={[
                        styles.backdrop,
                        { backgroundColor: theme.overlay },
                        backdropStyle,
                    ]}
                />
            </TouchableWithoutFeedback>

            <GestureDetector gesture={gesture}>
                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: theme.surface,
                            paddingBottom: insets.bottom,
                        },
                        sheetStyle,
                    ]}
                >
                    {showHandle && (
                        <View style={styles.handleContainer}>
                            <View
                                style={[
                                    styles.handle,
                                    { backgroundColor: theme.border },
                                ]}
                            />
                        </View>
                    )}

                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={styles.content}
                    >
                        {children}
                    </KeyboardAvoidingView>
                </Animated.View>
            </GestureDetector>
        </View>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    sheet: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        height: SCREEN_HEIGHT,
        borderTopLeftRadius: borderRadius.xxl,
        borderTopRightRadius: borderRadius.xxl,
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    handle: {
        width: 36,
        height: 4,
        borderRadius: 2,
    },
    content: {
        flex: 1,
    },
});
