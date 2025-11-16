import React, { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import {
    View,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import {
    Text,
    Title,
    Card,
    Button,
} from 'react-native-paper';
import { useRouter, useFocusEffect as useFocusEffectRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import { useIncidents } from '../../hooks/useIncidents';

const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 32;

export default function StatisticsScreen() {
    const router = useRouter();
    const { incidents, loading, refresh } = useIncidents();
    const [isRefreshing, setIsRefreshing] = useState(false);
    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [])
    );

    // Recarrega dados quando tela ganha foco
    useFocusEffectRouter(
        useCallback(() => {
            refresh();
        }, [])
    );

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await refresh();
        setIsRefreshing(false);
    };

    // Calcula estatísticas
    const totalIncidents = incidents.length;
    const pendingIncidents = incidents.filter((i) => i.status === 'pendente').length;
    const inProgressIncidents = incidents.filter((i) => i.status === 'em_andamento').length;
    const resolvedIncidents = incidents.filter((i) => i.status === 'resolvido').length;

    const lowSeverity = incidents.filter((i) => i.severity === 'baixa').length;
    const mediumSeverity = incidents.filter((i) => i.severity === 'média').length;
    const highSeverity = incidents.filter((i) => i.severity === 'alta').length;

    // Calcula tempo médio de resolução
    const calculateAverageResolutionTime = () => {
        const resolved = incidents.filter((i) => i.status === 'resolvido');
        if (resolved.length === 0) return 0;

        const totalTime = resolved.reduce((acc, incident) => {
            const createdDate = new Date(incident.createdAt);
            const now = new Date();
            const days = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
            return acc + days;
        }, 0);

        return Math.round(totalTime / resolved.length);
    };

    const avgResolutionTime = calculateAverageResolutionTime();
    const resolutionRate = totalIncidents > 0 ? Math.round((resolvedIncidents / totalIncidents) * 100) : 0;

    // Dados para gráficos
    const statusPieChartData = [
        {
            name: 'Pendente',
            data: pendingIncidents,
            color: Colors.warning,
            legendFontColor: Colors.text,
            legendFontSize: 12,
        },
        {
            name: 'Andamento',
            data: inProgressIncidents,
            color: Colors.primary,
            legendFontColor: Colors.text,
            legendFontSize: 12,
        },
        {
            name: 'Resolvido',
            data: resolvedIncidents,
            color: Colors.success,
            legendFontColor: Colors.text,
            legendFontSize: 12,
        },
    ];

    const severityBarChartData = {
        labels: ['Baixa', 'Média', 'Alta'],
        datasets: [
            {
                data: [lowSeverity, mediumSeverity, highSeverity],
            },
        ],
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Carregando estatísticas...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <Title style={styles.title}>📊 Estatísticas</Title>
                    <Text style={styles.subtitle}>
                        Análise geral do sistema
                    </Text>
                </View>

                {/* Resumo Rápido */}
                <View style={styles.statsGrid}>
                    <Card style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <MaterialCommunityIcons
                                name="alert-circle"
                                size={32}
                                color={Colors.primary}
                                style={styles.statIcon}
                            />
                            <Text style={styles.statValue}>{totalIncidents}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <MaterialCommunityIcons
                                name="clock"
                                size={32}
                                color={Colors.warning}
                                style={styles.statIcon}
                            />
                            <Text style={styles.statValue}>{pendingIncidents}</Text>
                            <Text style={styles.statLabel}>Pendentes</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <MaterialCommunityIcons
                                name="progress-clock"
                                size={32}
                                color={Colors.primary}
                                style={styles.statIcon}
                            />
                            <Text style={styles.statValue}>{inProgressIncidents}</Text>
                            <Text style={styles.statLabel}>Andamento</Text>
                        </Card.Content>
                    </Card>

                    <Card style={styles.statCard}>
                        <Card.Content style={styles.statContent}>
                            <MaterialCommunityIcons
                                name="check-circle"
                                size={32}
                                color={Colors.success}
                                style={styles.statIcon}
                            />
                            <Text style={styles.statValue}>{resolvedIncidents}</Text>
                            <Text style={styles.statLabel}>Resolvidas</Text>
                        </Card.Content>
                    </Card>
                </View>

                {/* Taxa de Resolução */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>✅ Taxa de Resolução</Text>
                        <View style={styles.rateContainer}>
                            <View style={styles.rateCircle}>
                                <Text style={styles.rateValue}>{resolutionRate}%</Text>
                            </View>
                            <View style={styles.rateInfo}>
                                <Text style={styles.rateLabel}>
                                    {resolvedIncidents} de {totalIncidents} denúncias
                                </Text>
                                <Text style={styles.rateDescription}>
                                    foram resolvidas com sucesso
                                </Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Tempo Médio */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>⏱️ Tempo Médio de Resolução</Text>
                        <View style={styles.timeContainer}>
                            <Text style={styles.timeValue}>{avgResolutionTime}</Text>
                            <Text style={styles.timeUnit}>dias</Text>
                        </View>
                        <Text style={styles.timeDescription}>
                            Tempo médio para resolver uma denúncia
                        </Text>
                    </Card.Content>
                </Card>

                {/* Gráfico de Status - Pizza */}
                {totalIncidents > 0 && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>📈 Distribuição por Status</Text>
                            <PieChart
                                data={statusPieChartData}
                                width={chartWidth}
                                height={220}
                                chartConfig={{
                                    backgroundColor: Colors.surface,
                                    backgroundGradientFrom: Colors.surface,
                                    backgroundGradientTo: Colors.surface,
                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                    strokeWidth: 2,
                                    barPercentage: 0.5,
                                }}
                                accessor="data"
                                backgroundColor="transparent"
                                paddingLeft="15"
                                absolute
                            />
                        </Card.Content>
                    </Card>
                )}

                {/* Gráfico de Severidade - Barras */}
                {totalIncidents > 0 && (
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>⚠️ Distribuição por Severidade</Text>
                            <BarChart
                                data={severityBarChartData}
                                width={chartWidth}
                                height={220}
                                chartConfig={{
                                    backgroundColor: Colors.surface,
                                    backgroundGradientFrom: Colors.surface,
                                    backgroundGradientTo: Colors.surface,
                                    color: (opacity = 1) => `rgba(26, 255, 146, ${opacity})`,
                                    strokeWidth: 2,
                                    barPercentage: 0.5,
                                }}
                                style={styles.chart}
                            />
                        </Card.Content>
                    </Card>
                )}

                {/* Relatório Detalhado */}
                <Card style={styles.card}>
                    <Card.Content>
                        <Text style={styles.cardTitle}>📋 Relatório Detalhado</Text>

                        <View style={styles.reportRow}>
                            <View style={styles.reportItem}>
                                <Text style={styles.reportLabel}>Baixa Severidade</Text>
                                <Text style={styles.reportValue}>{lowSeverity}</Text>
                            </View>
                            <View style={styles.reportDivider} />
                            <View style={styles.reportItem}>
                                <Text style={styles.reportLabel}>Média Severidade</Text>
                                <Text style={styles.reportValue}>{mediumSeverity}</Text>
                            </View>
                            <View style={styles.reportDivider} />
                            <View style={styles.reportItem}>
                                <Text style={styles.reportLabel}>Alta Severidade</Text>
                                <Text style={styles.reportValue}>{highSeverity}</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Botão Refresh */}
                <Button
                    mode="contained"
                    onPress={handleRefresh}
                    loading={isRefreshing}
                    disabled={isRefreshing}
                    icon="refresh"
                    style={styles.refreshButton}
                >
                    Atualizar Dados
                </Button>
            </ScrollView>
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
        padding: 16,
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
        marginBottom: 24,
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    statCard: {
        flex: 1,
        minWidth: '48%',
        backgroundColor: Colors.surface,
        borderRadius: 12,
        elevation: 2,
    },
    statContent: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    statIcon: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    statLabel: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 4,
    },
    card: {
        backgroundColor: Colors.surface,
        marginBottom: 16,
        borderRadius: 12,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    rateContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    rateCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rateValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFF',
    },
    rateInfo: {
        flex: 1,
    },
    rateLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.text,
    },
    rateDescription: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 4,
    },
    timeContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    timeValue: {
        fontSize: 48,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    timeUnit: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: 4,
    },
    timeDescription: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'center',
        marginTop: 8,
    },
    chart: {
        marginVertical: 8,
        borderRadius: 8,
    },
    reportRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    reportItem: {
        alignItems: 'center',
    },
    reportLabel: {
        fontSize: 12,
        color: Colors.textLight,
        marginBottom: 8,
    },
    reportValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    reportDivider: {
        width: 1,
        backgroundColor: Colors.border,
    },
    refreshButton: {
        marginTop: 16,
    },
});
