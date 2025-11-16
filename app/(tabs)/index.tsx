// File: `app/(tabs)/index.tsx`
import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import {
    Text,
    Title,
    FAB,
    Snackbar,
    ActivityIndicator,
} from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import StatCard from '../../components/StatCard';
import IncidentCard from '../../components/IncidentCard';
import { Colors } from '../../constants/colors';
import { useIncidents } from '../../hooks/useIncidents';

export default function HomeScreen() {
    const router = useRouter();
    const { incidents, loading, refresh } = useIncidents();
    const [refreshing, setRefreshing] = useState(false);
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Recarrega dados quando a tela ganha foco (volta do report)
    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [])
    );

    // Calcula estatísticas
    const stats = {
        total: incidents.length,
        pendentes: incidents.filter((i) => i.status === 'pendente').length,
        resolvidas: incidents.filter((i) => i.status === 'resolvido').length,
        emAndamento: incidents.filter((i) => i.status === 'em_andamento').length,
    };

    // Atualiza lista
    const handleRefresh = async () => {
        setRefreshing(true);
        try {
            await refresh();
            setSnackbarMessage('✅ Dados atualizados!');
            setSnackbarVisible(true);
        } catch (error) {
            setSnackbarMessage('❌ Erro ao atualizar');
            setSnackbarVisible(true);
        } finally {
            setRefreshing(false);
        }
    };

    // Navegação para registrar
    const handleReportNewIncident = () => {
        router.push('/(tabs)/report');
    };

    // Ordenar por mais recentes
    const sortedIncidents = [...incidents].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={[Colors.primary]}
                        tintColor={Colors.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Title style={styles.title}>🚧 TapaBuraco</Title>
                        <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileButton}
                        onPress={() => router.navigate('profile')}
                    >
                        <MaterialCommunityIcons
                            name="account-circle"
                            size={36}
                            color={Colors.primary}
                        />
                    </TouchableOpacity>
                </View>


                {/* Estatísticas */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>📊 Resumo</Text>
                    <StatCard
                        title="Total de Denúncias"
                        value={stats.total}
                        icon="alert"
                        color={Colors.primary}
                        subtitle={`${stats.pendentes} pendentes`}
                    />
                    <StatCard
                        title="Em Andamento"
                        value={stats.emAndamento}
                        icon="progress-clock"
                        color={Colors.warning}
                        subtitle="Sendo reparadas"
                    />
                    <StatCard
                        title="Resolvidas"
                        value={stats.resolvidas}
                        icon="check-circle"
                        color={Colors.success}
                        subtitle="Obrigado por relatar!"
                    />
                </View>

                {/* Incidentes Recentes */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔔 Incidentes Recentes</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/incidents')}
                        >
                            <Text style={styles.seeAllLink}>Ver todos →</Text>
                        </TouchableOpacity>
                    </View>

                    {sortedIncidents.length > 0 ? (
                        sortedIncidents.slice(0, 3).map((incident) => (
                            <IncidentCard
                                key={incident.id}
                                {...incident}
                                onPress={() => {
                                    setSnackbarMessage(`Incidente #${incident.id} selecionado`);
                                    setSnackbarVisible(true);
                                }}
                            />
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="inbox"
                                size={64}
                                color={Colors.textLight}
                            />
                            <Text style={styles.emptyStateText}>
                                Nenhuma denúncia no momento
                            </Text>
                        </View>
                    )}
                </View>

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <MaterialCommunityIcons
                        name="information"
                        size={24}
                        color={Colors.primary}
                    />
                    <Text style={styles.infoText}>
                        Sua denúncia ajuda a melhorar as vias da sua cidade. Obrigado!
                    </Text>
                </View>
            </ScrollView>

            {/* FAB para registrar novo incidente */}
            <FAB
                icon="plus"
                style={[styles.fab, { backgroundColor: Colors.primary }]}
                onPress={handleReportNewIncident}
                label="Registrar"
                visible={true}
            />

            {/* Snackbar */}
            <Snackbar
                visible={snackbarVisible}
                onDismiss={() => setSnackbarVisible(false)}
                duration={3000}
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
        paddingBottom: 100,
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
    profileButton: {
        padding: 8,
    },
    section: {
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    seeAllLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
    infoCard: {
        flexDirection: 'row',
        marginHorizontal: 16,
        marginVertical: 16,
        padding: 16,
        backgroundColor: Colors.surface,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
        gap: 12,
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        color: Colors.text,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyStateText: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: 12,
    },
    fab: {
        position: 'absolute',
        margin: 16,
        right: 0,
        bottom: 0,
    },
});