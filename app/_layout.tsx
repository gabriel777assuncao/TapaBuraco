import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { theme } from '../constants/theme';
import { createAdminUserIfNeeded } from '../hooks/useUser';

export default function RootLayout() {
    useEffect(() => {
        createAdminUserIfNeeded();
    }, []);

    return (
        <PaperProvider theme={theme}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="(admin)" />
            </Stack>
        </PaperProvider>
    );
}
