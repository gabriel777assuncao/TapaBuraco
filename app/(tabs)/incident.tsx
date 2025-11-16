import React, { useState, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    RefreshControl,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import {
    Text,
    Title,
    Chip,
    Snackbar,
    Card,
    Button,
    Modal,
    Portal,
    IconButton,
    Divider,
} from 'react-native-paper';
import { useRouter, useFocusEffect } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import RatingModal from '../../components/RatingModal';
import { Colors } from '../../constants/colors';
import { useIncidents, Incident } from '../../hooks/useIncidents';
import { useRatings } from '../../hooks/useRatings';

type StatusFilter = 'todas' | 'pendente' | 'em_andamento' | 'resolvido';

export default function IncidentsScreen() {
    const router = useRouter();
    const { incidents, loading, refresh } = useIncidents();
    const { addRating, getIncidentRating } = useRatings();

    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('todas');
    const [snackbarVisible, setSnackbarVisible] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [showRatingModal, setShowRatingModal] = useState(false);

    useFocusEffect(
        useCallback(() => {
            refresh();
        }, [])
    );

    const filteredIncidents =
        statusFilter === 'todas'
            ? incidents
            : incidents.filter((i) => i.status === statusFilter);

    const sortedIncidents = [...filteredIncidents].sort(
        (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pendente':
                return Colors.warning;
            case 'em_andamento':
                return Colors.primary;
            case 'resolvido':
                return Colors.success;
            default:
                return Colors.textLight;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pendente':
                return 'clock-outline';
            case 'em_andamento':
                return 'progress-clock';
            case 'resolvido':
                return 'check-circle';
            default:
                return 'help-circle';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pendente':
                return 'Pendente';
            case 'em_andamento':
                return 'Em andamento';
            case 'resolvido':
                return 'Resolvido';
            default:
                return status;
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'alta':
                return Colors.error;
            case 'média':
                return Colors.warning;
            case 'baixa':
                return Colors.success;
            default:
                return Colors.textLight;
        }
    };

    const handleIncidentPress = (incident: Incident) => {
        setSelectedIncident(incident);
        setDetailsModalVisible(true);
    };

    const handleSubmitRating = async (stars: number, comment?: string) => {
        if (selectedIncident) {
            await addRating(selectedIncident.id, stars, comment);
            setSnackbarMessage('✅ Obrigado pela sua avaliação!');
            setSnackbarVisible(true);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Carregando ocorrências...</Text>
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
                    <View style={styles.headerContent}>
                        <Title style={styles.title}>📋 Minhas Ocorrências</Title>
                        <Text style={styles.subtitle}>
                            {incidents.length} denúncias registradas
                        </Text>
                    </View>
                    <View style={styles.headerBadge}>
                        <Text style={styles.badgeNumber}>{incidents.length}</Text>
                    </View>
                </View>

                {/* Legenda de Status */}
                <Card style={styles.legendCard}>
                    <Card.Content>
                        <Text style={styles.legendTitle}>Legenda de Status:</Text>
                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendDot,
                                        { backgroundColor: Colors.warning },
                                    ]}
                                />
                                <Text style={styles.legendText}>Pendente</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendDot,
                                        { backgroundColor: Colors.primary },
                                    ]}
                                />
                                <Text style={styles.legendText}>Em andamento</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View
                                    style={[
                                        styles.legendDot,
                                        { backgroundColor: Colors.success },
                                    ]}
                                />
                                <Text style={styles.legendText}>Resolvido</Text>
                            </View>
                        </View>
                    </Card.Content>
                </Card>

                {/* Filtros */}
                <View style={styles.filterContainer}>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filterScroll}
                    >
                        <Chip
                            selected={statusFilter === 'todas'}
                            onPress={() => setStatusFilter('todas')}
                            style={[
                                styles.filterChip,
                                statusFilter === 'todas' && styles.filterChipSelected,
                            ]}
                            icon="layers"
                            selectedColor="#FFF"
                        >
                            Todas ({incidents.length})
                        </Chip>
                        <Chip
                            selected={statusFilter === 'pendente'}
                            onPress={() => setStatusFilter('pendente')}
                            style={[
                                styles.filterChip,
                                statusFilter === 'pendente' && styles.filterChipSelected,
                            ]}
                            icon="clock"
                            selectedColor="#FFF"
                        >
                            Pendentes ({incidents.filter((i) => i.status === 'pendente').length})
                        </Chip>
                        <Chip
                            selected={statusFilter === 'em_andamento'}
                            onPress={() => setStatusFilter('em_andamento')}
                            style={[
                                styles.filterChip,
                                statusFilter === 'em_andamento' && styles.filterChipSelected,
                            ]}
                            icon="progress-clock"
                            selectedColor="#FFF"
                        >
                            Andamento ({incidents.filter((i) => i.status === 'em_andamento').length})
                        </Chip>
                        <Chip
                            selected={statusFilter === 'resolvido'}
                            onPress={() => setStatusFilter('resolvido')}
                            style={[
                                styles.filterChip,
                                statusFilter === 'resolvido' && styles.filterChipSelected,
                            ]}
                            icon="check-circle"
                            selectedColor="#FFF"
                        >
                            Resolvidas ({incidents.filter((i) => i.status === 'resolvido').length})
                        </Chip>
                    </ScrollView>
                </View>

                {/* Lista de Incidentes */}
                <View style={styles.content}>
                    {sortedIncidents.length > 0 ? (
                        sortedIncidents.map((incident) => (
                            <TouchableOpacity
                                key={incident.id}
                                onPress={() => handleIncidentPress(incident)}
                                activeOpacity={0.7}
                            >
                                <Card style={styles.incidentCard}>
                                    <Card.Content>
                                        {/* Topo do Card */}
                                        <View style={styles.cardTop}>
                                            <View style={styles.cardTopLeft}>
                                                <Text style={styles.incidentId}>#{incident.id}</Text>
                                                <View
                                                    style={[
                                                        styles.statusBadge,
                                                        { backgroundColor: getStatusColor(incident.status) },
                                                    ]}
                                                >
                                                    <MaterialCommunityIcons
                                                        name={getStatusIcon(incident.status)}
                                                        size={14}
                                                        color="#FFF"
                                                    />
                                                    <Text style={styles.statusBadgeText}>
                                                        {getStatusLabel(incident.status)}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View
                                                style={[
                                                    styles.severityBadge,
                                                    { backgroundColor: getSeverityColor(incident.severity) },
                                                ]}
                                            >
                                                <MaterialCommunityIcons
                                                    name="alert-circle"
                                                    size={14}
                                                    color="#FFF"
                                                />
                                                <Text style={styles.severityBadgeText}>
                                                    {incident.severity.charAt(0).toUpperCase() +
                                                        incident.severity.slice(1)}
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Descrição */}
                                        <Text style={styles.description} numberOfLines={2}>
                                            {incident.description}
                                        </Text>

                                        <Divider style={styles.divider} />

                                        {/* Info Footer */}
                                        <View style={styles.cardFooter}>
                                            <View style={styles.footerItem}>
                                                <MaterialCommunityIcons
                                                    name="calendar"
                                                    size={14}
                                                    color={Colors.primary}
                                                />
                                                <Text style={styles.footerText}>{incident.date}</Text>
                                            </View>
                                            <View style={styles.footerItem}>
                                                <MaterialCommunityIcons
                                                    name="map-marker"
                                                    size={14}
                                                    color={Colors.primary}
                                                />
                                                <Text style={styles.footerText} numberOfLines={1}>
                                                    {incident.location.split(',')[0]}
                                                </Text>
                                            </View>
                                            <View style={styles.footerItem}>
                                                <MaterialCommunityIcons
                                                    name="chevron-right"
                                                    size={18}
                                                    color={Colors.primary}
                                                />
                                            </View>
                                        </View>
                                    </Card.Content>
                                </Card>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <MaterialCommunityIcons
                                name="inbox"
                                size={64}
                                color={Colors.textLight}
                            />
                            <Text style={styles.emptyStateText}>
                                {statusFilter === 'todas'
                                    ? 'Nenhuma denúncia realizada'
                                    : `Nenhuma denúncia ${statusFilter}`}
                            </Text>
                            <Text style={styles.emptyStateSubtext}>
                                Registre um buraco para começar! 🚧
                            </Text>
                            <Button
                                mode="contained"
                                onPress={() => router.push('/(tabs)/report')}
                                style={styles.emptyButton}
                                icon="plus"
                            >
                                Registrar Agora
                            </Button>
                        </View>
                    )}
                </View>
            </ScrollView>

            {/* Modal de Detalhes */}
            <Portal>
                <Modal
                    visible={detailsModalVisible}
                    onDismiss={() => setDetailsModalVisible(false)}
                    contentContainerStyle={styles.modal}
                >
                    {selectedIncident && (
                        <Card style={styles.modalCard}>
                            <Card.Content style={styles.modalContent}>
                                {/* Header do Modal */}
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text style={styles.modalTitle}>
                                            Denúncia #{selectedIncident.id}
                                        </Text>
                                        <Text style={styles.modalDate}>
                                            {selectedIncident.date}
                                        </Text>
                                    </View>
                                    <IconButton
                                        icon="close"
                                        onPress={() => setDetailsModalVisible(false)}
                                    />
                                </View>

                                <Divider style={styles.modalDivider} />

                                {/* Descrição */}
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>📝 Descrição:</Text>
                                    <Text style={styles.detailValue}>
                                        {selectedIncident.description}
                                    </Text>
                                </View>

                                {/* Status e Severidade */}
                                <View style={styles.statusRow}>
                                    <View style={styles.statusItem}>
                                        <Text style={styles.detailLabel}>Status:</Text>
                                        <View
                                            style={[
                                                styles.statusBadgeLarge,
                                                { backgroundColor: getStatusColor(selectedIncident.status) },
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name={getStatusIcon(selectedIncident.status)}
                                                size={16}
                                                color="#FFF"
                                            />
                                            <Text style={styles.statusBadgeTextLarge}>
                                                {getStatusLabel(selectedIncident.status)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={styles.statusItem}>
                                        <Text style={styles.detailLabel}>Severidade:</Text>
                                        <View
                                            style={[
                                                styles.statusBadgeLarge,
                                                { backgroundColor: getSeverityColor(selectedIncident.severity) },
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name="alert-circle"
                                                size={16}
                                                color="#FFF"
                                            />
                                            <Text style={styles.statusBadgeTextLarge}>
                                                {selectedIncident.severity
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                    selectedIncident.severity.slice(1)}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Localização */}
                                <View style={styles.detailSection}>
                                    <Text style={styles.detailLabel}>📍 Localização:</Text>
                                    <Text style={[styles.detailValue, { fontFamily: 'monospace', fontSize: 12 }]}>
                                        {selectedIncident.location}
                                    </Text>
                                </View>

                                {/* Avaliação - Se já avaliado */}
                                {getIncidentRating(selectedIncident.id) && (
                                    <View style={styles.ratingSection}>
                                        <Text style={styles.detailLabel}>⭐ Sua Avaliação:</Text>
                                        <View style={styles.ratingStars}>
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <MaterialCommunityIcons
                                                    key={star}
                                                    name="star"
                                                    size={24}
                                                    color={Colors.warning}
                                                />
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Foto */}
                                {selectedIncident.imageUri && (
                                    <View style={styles.detailSection}>
                                        <Text style={styles.detailLabel}>📷 Foto:</Text>
                                        <TouchableOpacity
                                            style={styles.imagePreview}
                                            onPress={() => {}}
                                        >
                                            <MaterialCommunityIcons
                                                name="image"
                                                size={32}
                                                color={Colors.primary}
                                            />
                                            <Text style={styles.imagePreviewText}>Ver foto</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {/* Botões */}
                                <View style={styles.modalActions}>
                                    <Button
                                        mode="outlined"
                                        onPress={() => setDetailsModalVisible(false)}
                                        style={styles.modalButton}
                                    >
                                        Fechar
                                    </Button>
                                    <Button
                                        mode="contained"
                                        onPress={() => {
                                            setSnackbarMessage(
                                                `Denúncia #${selectedIncident.id} compartilhada`
                                            );
                                            setSnackbarVisible(true);
                                            setDetailsModalVisible(false);
                                        }}
                                        icon="share-variant"
                                        style={styles.modalButton}
                                    >
                                        Compartilhar
                                    </Button>
                                </View>

                                {/* Botão de Avaliação - Se resolvido e não avaliado */}
                                {selectedIncident.status === 'resolvido' &&
                                    !getIncidentRating(selectedIncident.id) && (
                                        <Button
                                            mode="contained"
                                            onPress={() => setShowRatingModal(true)}
                                            icon="star"
                                            style={styles.ratingButton}
                                        >
                                            Avaliar Reparo ⭐
                                        </Button>
                                    )}
                            </Card.Content>
                        </Card>
                    )}
                </Modal>
            </Portal>

            {/* Modal de Avaliação */}
            <RatingModal
                visible={showRatingModal}
                onDismiss={() => setShowRatingModal(false)}
                incidentId={selectedIncident?.id || ''}
                onSubmit={handleSubmitRating}
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
        marginBottom: 16,
    },
    headerContent: {
        flex: 1,
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
    headerBadge: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    badgeNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFF',
    },
    legendCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        backgroundColor: Colors.surface,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.textLight,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: 12,
        color: Colors.text,
        fontWeight: '500',
    },
    filterContainer: {
        paddingHorizontal: 8,
        marginBottom: 16,
        backgroundColor: Colors.surface,
        paddingVertical: 8,
    },
    filterScroll: {
        paddingHorizontal: 8,
        gap: 8,
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
    content: {
        paddingHorizontal: 16,
    },
    incidentCard: {
        backgroundColor: Colors.surface,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: Colors.border,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTopLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    incidentId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    statusBadgeText: {
        fontSize: 11,
        color: '#FFF',
        fontWeight: '600',
    },
    severityBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
    },
    severityBadgeText: {
        fontSize: 11,
        color: '#FFF',
        fontWeight: '600',
    },
    description: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 12,
        lineHeight: 20,
    },
    divider: {
        marginBottom: 12,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    footerText: {
        fontSize: 12,
        color: Colors.textLight,
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
        marginBottom: 16,
    },
    emptyButton: {
        marginTop: 12,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '90%',
    },
    modalContent: {
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    modalDate: {
        fontSize: 12,
        color: Colors.textLight,
        marginTop: 4,
    },
    modalDivider: {
        marginBottom: 16,
    },
    detailSection: {
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    detailValue: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    statusRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    statusItem: {
        flex: 1,
    },
    statusBadgeLarge: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        marginTop: 8,
    },
    statusBadgeTextLarge: {
        fontSize: 12,
        color: '#FFF',
        fontWeight: '600',
    },
    ratingSection: {
        marginBottom: 16,
        backgroundColor: Colors.background,
        padding: 12,
        borderRadius: 8,
    },
    ratingStars: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
        justifyContent: 'center',
    },
    imagePreview: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
    },
    imagePreviewText: {
        fontSize: 12,
        color: Colors.primary,
        marginTop: 8,
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
    },
    ratingButton: {
        marginTop: 12,
        backgroundColor: Colors.warning,
    },
});
