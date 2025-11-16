import React, { useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Animated,
} from 'react-native';
import {
    Text,
    Card,
    Button,
    Chip,
    IconButton,
    Modal,
    Portal,
    Dialog,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useIncidents } from '../../hooks/useIncidents';
import { useNotifications } from '../../hooks/useNotifications';

type StatusFilter = 'todas' | 'pendente' | 'em_andamento' | 'resolvido';

export default function AdminDashboard() {
    const router = useRouter();
    const { incidents, updateIncidentStatus } = useIncidents();
    const { addNotification } = useNotifications();

    const [filter, setFilter] = useState<StatusFilter>('todas');
    const [selectedIncident, setSelectedIncident] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);

    // Filtra incidentes
    const filteredIncidents =
        filter === 'todas'
            ? incidents
            : incidents.filter((i) => i.status === filter);

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

    const getNextStatus = (currentStatus: string) => {
        switch (currentStatus) {
            case 'pendente':
                return 'em_andamento';
            case 'em_andamento':
                return 'resolvido';
            case 'resolvido':
                return 'pendente';
            default:
                return 'pendente';
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

    const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
        Alert.alert(
            'Atualizar Status',
            `Tem certeza que deseja mudar para "${getStatusLabel(newStatus)}"?`,
            [
                { text: 'Cancelar', onPress: () => {} },
                {
                    text: 'Confirmar',
                    onPress: async () => {
                        try {
                            await updateIncidentStatus(incidentId, newStatus as any);

                            // Envia notificação
                            const statusMessages: any = {
                                em_andamento: '🔧 Sua denúncia foi aprovada! Obra iniciando...',
                                resolvido: '✅ Sua denúncia foi resolvida! Obrigado.',
                            };

                            if (statusMessages[newStatus]) {
                                await addNotification(
                                    `Status Atualizado: ${getStatusLabel(newStatus)}`,
                                    statusMessages[newStatus],
                                    newStatus === 'resolvido' ? 'success' : 'info',
                                    incidentId,
                                    newStatus === 'resolvido' ? 'check-circle' : 'progress-clock'
                                );
                            }

                            setModalVisible(false);
                            Alert.alert('Sucesso', 'Status atualizado com sucesso!');
                        } catch (err) {
                            Alert.alert('Erro', 'Erro ao atualizar status');
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialCommunityIcons
                        name="arrow-left"
                        size={28}
                        color={Colors.primary}
                    />
                </TouchableOpacity>
                <View style={styles.headerText}>
                    <Text style={styles.title}>🛡️ Painel Admin</Text>
                    <Text style={styles.subtitle}>Gerenciar Denúncias</Text>
                </View>
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
                    Todas ({incidents.length})
                </Chip>
                <Chip
                    selected={filter === 'pendente'}
                    onPress={() => setFilter('pendente')}
                    style={[
                        styles.filterChip,
                        filter === 'pendente' && styles.filterChipSelected,
                    ]}
                    icon="clock"
                >
                    Pendentes ({incidents.filter((i) => i.status === 'pendente').length})
                </Chip>
                <Chip
                    selected={filter === 'em_andamento'}
                    onPress={() => setFilter('em_andamento')}
                    style={[
                        styles.filterChip,
                        filter === 'em_andamento' && styles.filterChipSelected,
                    ]}
                    icon="progress-clock"
                >
                    Andamento ({incidents.filter((i) => i.status === 'em_andamento').length})
                </Chip>
                <Chip
                    selected={filter === 'resolvido'}
                    onPress={() => setFilter('resolvido')}
                    style={[
                        styles.filterChip,
                        filter === 'resolvido' && styles.filterChipSelected,
                    ]}
                    icon="check"
                >
                    Resolvidas ({incidents.filter((i) => i.status === 'resolvido').length})
                </Chip>
            </View>

            {/* Lista de Incidentes */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {filteredIncidents.length > 0 ? (
                    filteredIncidents.map((incident) => (
                        <Card
                            key={incident.id}
                            style={styles.incidentCard}
                            onPress={() => {
                                setSelectedIncident(incident);
                                setModalVisible(true);
                            }}
                        >
                            <Card.Content>
                                <View style={styles.incidentHeader}>
                                    <View style={styles.headerLeft}>
                                        <Text style={styles.incidentId}>#{incident.id}</Text>
                                        <Chip
                                            icon="alert-circle"
                                            label={incident.severity.toUpperCase()}
                                            style={{
                                                backgroundColor:
                                                    incident.severity === 'alta'
                                                        ? Colors.error
                                                        : incident.severity === 'média'
                                                            ? Colors.warning
                                                            : Colors.success,
                                            }}
                                        />
                                    </View>
                                    <Chip
                                        icon="check-circle"
                                        label={getStatusLabel(incident.status)}
                                        style={{
                                            backgroundColor: getStatusColor(incident.status),
                                        }}
                                    />
                                </View>

                                <Text
                                    style={styles.description}
                                    numberOfLines={2}
                                    ellipsizeMode="tail"
                                >
                                    {incident.description}
                                </Text>

                                <View style={styles.footer}>
                                    <View style={styles.footerItem}>
                                        <MaterialCommunityIcons
                                            name="calendar"
                                            size={14}
                                            color={Colors.textLight}
                                        />
                                        <Text style={styles.footerText}>{incident.date}</Text>
                                    </View>
                                    <View style={styles.footerItem}>
                                        <MaterialCommunityIcons
                                            name="map-marker"
                                            size={14}
                                            color={Colors.textLight}
                                        />
                                        <Text style={styles.footerText} numberOfLines={1}>
                                            {incident.location}
                                        </Text>
                                    </View>
                                </View>

                                <Button
                                    mode="contained"
                                    onPress={() => {
                                        setSelectedIncident(incident);
                                        setModalVisible(true);
                                    }}
                                    style={styles.actionButton}
                                    icon="pencil"
                                >
                                    Gerenciar
                                </Button>
                            </Card.Content>
                        </Card>
                    ))
                ) : (
                    <View style={styles.emptyState}>
                        <MaterialCommunityIcons
                            name="inbox"
                            size={64}
                            color={Colors.textLight}
                        />
                        <Text style={styles.emptyStateText}>
                            Nenhuma denúncia {filter !== 'todas' ? filter : ''}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal de Gerenciamento */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={styles.modal}
                >
                    {selectedIncident && (
                        <Card style={styles.modalCard}>
                            <Card.Content style={styles.modalContent}>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>
                                        Denúncia #{selectedIncident.id}
                                    </Text>
                                    <IconButton
                                        icon="close"
                                        onPress={() => setModalVisible(false)}
                                    />
                                </View>

                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Descrição:</Text>
                                    <Text style={styles.modalValue}>
                                        {selectedIncident.description}
                                    </Text>
                                </View>

                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Status Atual:</Text>
                                    <Chip
                                        label={getStatusLabel(selectedIncident.status)}
                                        style={{
                                            backgroundColor: getStatusColor(selectedIncident.status),
                                        }}
                                    />
                                </View>

                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Severidade:</Text>
                                    <Text style={styles.modalValue}>
                                        {selectedIncident.severity.toUpperCase()}
                                    </Text>
                                </View>

                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Localização:</Text>
                                    <Text style={[styles.modalValue, { fontFamily: 'monospace' }]}>
                                        {selectedIncident.location}
                                    </Text>
                                </View>

                                <View style={styles.modalActions}>
                                    <Button
                                        mode="contained"
                                        onPress={() =>
                                            handleUpdateStatus(
                                                selectedIncident.id,
                                                getNextStatus(selectedIncident.status)
                                            )
                                        }
                                        icon="arrow-right"
                                        style={styles.updateButton}
                                    >
                                        Avançar para:{' '}
                                        {getStatusLabel(
                                            getNextStatus(selectedIncident.status)
                                        )}
                                    </Button>
                                    <Button
                                        mode="outlined"
                                        onPress={() => setModalVisible(false)}
                                    >
                                        Fechar
                                    </Button>
                                </View>
                            </Card.Content>
                        </Card>
                    )}
                </Modal>
            </Portal>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: 12,
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textLight,
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
    incidentCard: {
        backgroundColor: Colors.surface,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
    },
    incidentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    incidentId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    description: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 8,
        fontWeight: '500',
    },
    footer: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 12,
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
    actionButton: {
        marginTop: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 64,
    },
    emptyStateText: {
        fontSize: 16,
        color: Colors.textLight,
        marginTop: 12,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '85%',
    },
    modalContent: {
        padding: 16,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    modalInfo: {
        marginBottom: 16,
    },
    modalLabel: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '600',
        marginBottom: 6,
        textTransform: 'uppercase',
    },
    modalValue: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    modalActions: {
        gap: 8,
        marginTop: 20,
    },
    updateButton: {
        marginBottom: 8,
    },
});
