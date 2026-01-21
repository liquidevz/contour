/**
 * Loading Skeleton Component
 * 
 * Animated placeholder for loading states
 * Use for lists while data is being fetched
 */

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface LoadingSkeletonProps {
    count?: number;
}

function SkeletonItem() {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.6,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, [opacity]);

    return (
        <View style={styles.item}>
            <Animated.View style={[styles.avatar, { opacity }]} />
            <View style={styles.content}>
                <Animated.View style={[styles.line, styles.lineLong, { opacity }]} />
                <Animated.View style={[styles.line, styles.lineShort, { opacity }]} />
            </View>
        </View>
    );
}

export default function LoadingSkeleton({ count = 5 }: LoadingSkeletonProps) {
    return (
        <View style={styles.container}>
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonItem key={index} />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#2a2a2a',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#333',
    },
    content: {
        flex: 1,
        marginLeft: 12,
        gap: 8,
    },
    line: {
        height: 14,
        borderRadius: 4,
        backgroundColor: '#333',
    },
    lineLong: {
        width: '70%',
    },
    lineShort: {
        width: '40%',
    },
});
