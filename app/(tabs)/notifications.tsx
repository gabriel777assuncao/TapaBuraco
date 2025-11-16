import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Animated,
} from 'react-native';
import {
    Text,
    Card,
    Button,
    Chip,
    IconButton,
    Snackbar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useNotifications } from '../../hooks/useNotifications';

type NotificationFilter = 'todas' | 'nao-lidas' | 'lidas';

export default function NotificationsScreen() {
    const { notifications, loading, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } =
        useNotifications();

    const [filter, setFilter] = useState<NotificationFilter>('todas');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Filtra notificações
    const filteredNotifications = notifications.filter((n) => {
        if (filter === 'nao-lidas') return !n.read;
        if (filter === 'lidas') return n.read;
        return true;
    });

    // Cores por tipo
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success':
                return Colors.success;
            case 'danger':
                return Colors.error;
            case 'warning':
                return Colors.warning;
            case 'info':
                return Colors.primary;
            default:
                return Colors.textLight;
        }
    };

    // Ícone por tipo
    const getTypeIcon = (icon: string) => icon;

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setSnackbarMessage('✓ Marcado como lido');
        setSnackbarVisible(true);
    };

    const handleDelete = (id: string) => {
        Alert.alert('Deletar', 'Tem certeza que deseja deletar esta notificação?', [
            {
                text: 'Cancelar',
                onPress: () => {},
            },
            {
                text: 'Deletar',
                onPress: async () => {
                    await deleteNotification(id);
                    setSnackbarMessage('🗑️ Notificação deletada');
                    setSnackbarVisible(true);
                },
                style: 'destructive',
            },
        ]);
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setSnackbarMessage('✓ Todas marcadas como lidas');
        setSnackbarVisible(true);
    };

    const handleClearAll = () => {
        Alert.alert('Limpar Tudo', 'Tem certeza que deseja deletar todas as notificações?', [
            {
                text: 'Cancelar',
                onPress: () => {},
            },
            {
                text: 'Limpar',
                onPress: async () => {
                    await clearAll();
                    setSnackbarMessage('🗑️ Todas as notificações foram deletadas');
                    setSnackbarVisible(true);
                },
                style: 'destructive',
            },
        ]);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins}m atrás`;
        if (diffHours < 24) return `${diffHours}h atrás`;
        if (diffDays < 7) return `${diffDays}d atrás`;

        return date.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Carregando notificações...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>🔔 Notificações</Text>
                    <Text style={styles.subtitle}>
                        {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
                    </Text>
                </View>
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                )}
            </View>

            {/* Filtros */}
            <View style={styles.filterContainer}>
                <Chip
                    selected={filter === 'todas'}
                    onPress={() => setFilter('todas')}
                    style={[
                        styles.filterChip,
                        filter === 'todas' && styles.filterChipSelected,
                    ]}
                    icon="layers"
                >
                    Todas ({notifications.length})
                </Chip>
                <Chip
                    selected={filter === 'nao-lidas'}
                    onPress={() => setFilter('nao-lidas')}
                    style={[
                        styles.filterChip,
                        filter === 'nao-lidas' && styles.filterChipSelected,
                    ]}
                    icon="bell"
                >
                    Não lidas ({unreadCount})
                </Chip>
                <Chip
                    selected={filter === 'lidas'}
                    onPress={() => setFilter('lidas')}
                    style={[
                        styles.filterChip,
                        filter === 'lidas' && styles.filterChipSelected,
                    ]}
                    icon="check-circle"
                >
                    Lidas ({notifications.length - unreadCount})
                </Chip>
            </View>

            {/* Notificações */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {filteredNotifications.length > 0 ? (
                    <>
                        {unreadCount > 0 && (
                            <Button
                                mode="text"
                                onPress={handleMarkAllAsRead}
                                icon="check-all"
                                style={styles.markAllButton}
                            >
                                Marcar todas como lidas
                            </Button>
                        )}

                        {filteredNotifications.map((notification) => (
                            <Card
                                key={notification.id}
                                style={[
                                    styles.notificationCard,
                                    !notification.read && styles.notificationCardUnread,
                                ]}
                            >
                                <Card.Content style={styles.cardContent}>
                                    <View style={styles.notificationHeader}>
                                        <View style={styles.iconContainer}>
                                            <MaterialCommunityIcons
                                                name={notification.icon}
                                                size={28}
                                                color={getTypeColor(notification.type)}
                                            />
                                        </View>

                                        <View style={styles.textContainer}>
                                            <Text
                                                style={[
                                                    styles.notificationTitle,
                                                    !notification.read && styles.notificationTitleBold,
                                                ]}
                                            >
                                                {notification.title}
                                            </Text>
                                            <Text style={styles.notificationMessage}>
                                                {notification.message}
                                            </Text>
                                            <Text style={styles.notificationDate}>
                                                {formatDate(notification.createdAt)}
                                            </Text>
                                        </View>

                                        {!notification.read && (
                                            <View
                                                style={[
                                                    styles.unreadDot,
                                                    { backgroundColor: getTypeColor(notification.type) },
                                                ]}
                                            />
                                        )}
                                    </View>

                                    <View style={styles.actionButtons}>
                                        {!notification.read && (
                                            <Button
                                                mode="text"
                                                size="small"
                                                onPress={() => handleMarkAsRead(notification.id)}
                                                icon="check"
                                            >
                                                Marcar como lida
                                            </Button>
                                        )}
                                        <IconButton
                                            icon="delete"
                                            size={20}
                                            onPress={() => handleDelete(notification.id)}
                                            iconColor={Colors.error}
                                        />
                                    </View>
                                </Card.Content>
                            </Card>
                        ))}

                        {filteredNotifications.length > 0 && (
                            <Button
                                mode="outlined"
                                onPress={handleClearAll}
                                icon="delete-multiple"
                                style={styles.clearButton}
                                textColor={Colors.error}
                            >
                                Limpar todas
                            </Button>
                        )}
                    </>
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="bell-off"
                            size={64}
                            color={Colors.textLight}
                        />
                        <Text style={styles.emptyStateText}>
                            {filter === 'todas'
                                ? 'Nenhuma notificação'
                                : filter === 'nao-lidas'
                                    ? 'Nenhuma notificação não lida'
                                    : 'Nenhuma notificação lida'}
                        </Text>
                        <Text style={styles.emptyStateSubtext}>
                            Você será notificado sobre atualizações das suas denúncias
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Snackbar */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={2000}
            >
                {snackbarMessage}
            </Snackbar>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 32,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: Colors.textLight,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textLight,
    },
    badge: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 12,
        gap: 8,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        backgroundColor: Colors.surface,
    },
    filterChip: {
        backgroundColor: Colors.background,
        borderColor: Colors.border,
        borderWidth: 1,
    },
    filterChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    markAllButton: {
        marginBottom: 12,
    },
    notificationCard: {
        backgroundColor: Colors.surface,
        marginBottom: 12,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.border,
    },
    notificationCardUnread: {
        borderLeftColor: Colors.primary,
        backgroundColor: '#F0F7FF',
    },
    cardContent: {
        padding: 12,
    },
    notificationHeader: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    notificationTitle: {
        fontSize: 16,
        color: Colors.text,
        marginBottom: 4,
    },
    notificationTitleBold: {
        fontWeight: 'bold',
    },
    notificationMessage: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 6,
    },
    notificationDate: {
        fontSize: 12,
        color: Colors.textLight,
    },
    unreadDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        alignSelf: 'center',
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    clearButton: {
        marginTop: 16,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginTop: 12,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: Colors.textLight,
        marginTop: 8,
        textAlign: 'center',
    },
});
