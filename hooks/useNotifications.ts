import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationType = 'info' | 'success' | 'warning' | 'danger';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    incidentId: string;
    read: boolean;
    createdAt: string;
    icon: string;
}

const NOTIFICATIONS_KEY = '@tapaburaco_notifications';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Carrega notificações
    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);

            if (data) {
                setNotifications(JSON.parse(data));
            }
        } catch (err) {
            console.error('Erro ao carregar notificações:', err);
        } finally {
            setLoading(false);
        }
    };

    // Adiciona notificação
    const addNotification = async (
        title: string,
        message: string,
        type: NotificationType,
        incidentId: string,
        icon: string
    ) => {
        try {
            const newNotification: Notification = {
                id: Date.now().toString(),
                title,
                message,
                type,
                incidentId,
                read: false,
                createdAt: new Date().toISOString(),
                icon,
            };

            const updated = [newNotification, ...notifications];
            setNotifications(updated);
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));

            return newNotification;
        } catch (err) {
            console.error('Erro ao adicionar notificação:', err);
        }
    };

    // Marca como lida
    const markAsRead = async (id: string) => {
        try {
            const updated = notifications.map((n) =>
                n.id === id ? { ...n, read: true } : n
            );
            setNotifications(updated);
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
        } catch (err) {
            console.error('Erro ao marcar notificação como lida:', err);
        }
    };

    // Marca todas como lidas
    const markAllAsRead = async () => {
        try {
            const updated = notifications.map((n) => ({ ...n, read: true }));
            setNotifications(updated);
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
        } catch (err) {
            console.error('Erro ao marcar todas como lidas:', err);
        }
    };

    // Deleta notificação
    const deleteNotification = async (id: string) => {
        try {
            const updated = notifications.filter((n) => n.id !== id);
            setNotifications(updated);
            await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
        } catch (err) {
            console.error('Erro ao deletar notificação:', err);
        }
    };

    // Limpa todas
    const clearAll = async () => {
        try {
            setNotifications([]);
            await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
        } catch (err) {
            console.error('Erro ao limpar notificações:', err);
        }
    };

    // Conta não lidas
    const unreadCount = notifications.filter((n) => !n.read).length;

    return {
        notifications,
        loading,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
    };
};
