import { useTheme } from '@/contexts/ThemeContext';
import { Stack } from 'expo-router';

export default function ProfileLayout() {
    const { theme } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: theme.background },
            }}
        >
            <Stack.Screen name="index" />
            <Stack.Screen name="edit" />
        </Stack>
    );
}
