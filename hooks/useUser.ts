import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    city?: string;
    avatar?: string;
    totalReports: number;
    resolvedReports: number;
    joinedDate: string;
    role?: string;
}

const CURRENT_USER_KEY = '@tapaburaco_current_user';
const USER_STATS_KEY = '@tapaburaco_user_stats';

export const useUser = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Carrega usuário logado
    useEffect(() => {
        loadCurrentUser();
    }, []);

    const loadCurrentUser = async () => {
        try {
            setLoading(true);

            // Busca usuário logado
            const currentUserData = await AsyncStorage.getItem(CURRENT_USER_KEY);

            if (currentUserData) {
                const currentUser = JSON.parse(currentUserData);

                // Busca estatísticas do usuário
                const statsKey = `${USER_STATS_KEY}_${currentUser.id}`;
                const statsData = await AsyncStorage.getItem(statsKey);
                const stats = statsData
                    ? JSON.parse(statsData)
                    : { totalReports: 0, resolvedReports: 0 };

                const userData: User = {
                    ...currentUser,
                    totalReports: stats.totalReports || 0,
                    resolvedReports: stats.resolvedReports || 0,
                };

                setUser(userData);
            } else {
                setUser(null);
            }
        } catch (err) {
            console.error('Erro ao carregar usuário logado:', err);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Atualiza dados do usuário
    const updateUser = async (updates: Partial<User>) => {
        try {
            if (!user) return;

            const updatedUser = { ...user, ...updates };
            setUser(updatedUser);

            // Salva usuário atualizado
            await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));

            // Atualiza na lista de usuários
            const usersData = await AsyncStorage.getItem('@tapaburaco_users');
            if (usersData) {
                const userList = JSON.parse(usersData);
                const updatedList = userList.map((u: any) =>
                    u.id === user.id ? { ...u, ...updatedUser } : u
                );
                await AsyncStorage.setItem('@tapaburaco_users', JSON.stringify(updatedList));
            }
        } catch (err) {
            console.error('Erro ao atualizar usuário:', err);
        }
    };

    // Incrementa contador de relatórios
    const incrementTotalReports = async () => {
        try {
            if (!user) return;

            const newTotal = user.totalReports + 1;
            const statsKey = `${USER_STATS_KEY}_${user.id}`;

            const stats = {
                totalReports: newTotal,
                resolvedReports: user.resolvedReports,
            };

            await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
            setUser((prev) =>
                prev ? { ...prev, totalReports: newTotal } : null
            );
        } catch (err) {
            console.error('Erro ao incrementar relatórios:', err);
        }
    };

    // Incrementa contador de relatórios resolvidos
    const incrementResolvedReports = async () => {
        try {
            if (!user) return;

            const newResolved = user.resolvedReports + 1;
            const statsKey = `${USER_STATS_KEY}_${user.id}`;

            const stats = {
                totalReports: user.totalReports,
                resolvedReports: newResolved,
            };

            await AsyncStorage.setItem(statsKey, JSON.stringify(stats));
            setUser((prev) =>
                prev ? { ...prev, resolvedReports: newResolved } : null
            );
        } catch (err) {
            console.error('Erro ao incrementar resolvidos:', err);
        }
    };

    // Logout
    const logout = async () => {
        try {
            await AsyncStorage.removeItem(CURRENT_USER_KEY);
            setUser(null);
        } catch (err) {
            console.error('Erro ao fazer logout:', err);
        }
    };

    return {
        user,
        loading,
        updateUser,
        incrementTotalReports,
        incrementResolvedReports,
        logout,
    };
};


export const createAdminUserIfNeeded = async () => {
    try {
        const users = await AsyncStorage.getItem('@tapaburaco_users');
        const userList = users ? JSON.parse(users) : [];

        // Verifica se já existe admin
        const adminExists = userList.some((u: any) => u.email === 'admin@tapaburaco.com');

        if (!adminExists) {
            const adminUser = {
                id: 'admin-001',
                name: 'Administrador',
                email: 'admin@tapaburaco.com',
                password: 'Admin@123',
                phone: '(11) 9999-9999',
                city: 'São Paulo, SP',
                totalReports: 0,
                resolvedReports: 0,
                joinedDate: new Date().toLocaleDateString('pt-BR'),
                avatar: '🛡️',
                role: 'admin',
            };

            userList.push(adminUser);
            await AsyncStorage.setItem('@tapaburaco_users', JSON.stringify(userList));

            console.log('✅ Conta admin criada automaticamente!');
            console.log('Email: admin@tapaburaco.com');
            console.log('Senha: Admin@123');
        }
    } catch (err) {
        console.error('Erro ao criar admin:', err);
    }
};
