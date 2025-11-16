import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useNotifications } from '../../hooks/useNotifications';

export default function TabsLayout() {
    const { unreadCount } = useNotifications();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary,
                tabBarInactiveTintColor: Colors.textLight,
                headerShown: false,
                tabBarStyle: {
                    borderTopColor: Colors.border,
                    backgroundColor: Colors.surface,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Início',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="report"
                options={{
                    title: 'Registrar',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="camera" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="incidents"
                options={{
                    title: 'Minhas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="list" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="map"
                options={{
                    title: 'Mapa',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="map" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="notifications"
                options={{
                    title: 'Notificações',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="notifications" size={size} color={color} />
                    ),
                    tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Perfil',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="statistics"
                options={{
                    title: 'Estatísticas',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="bar-chart" size={size} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
