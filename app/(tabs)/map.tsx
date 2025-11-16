import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import { Text, Card, Chip, Button, Modal, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useIncidents, Incident } from '../../hooks/useIncidents';
import { useLocation } from '../../hooks/useLocalization';
import MapMarker from '../../components/MapMarker';

type StatusFilter = 'todos' | 'pendente' | 'em_andamento' | 'resolvido';

export default function MapScreen() {
    const mapRef = useRef<MapView>(null);
    const { incidents, loading } = useIncidents();
    const { location, loading: locationLoading } = useLocation();

    const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');
    const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [mapInitialized, setMapInitialized] = useState(false);
    const [initialRegion, setInitialRegion] = useState({
        latitude: -23.5505,
        longitude: -46.6333,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });

    // Filtra incidentes
    const filteredIncidents =
        statusFilter === 'todos'
            ? incidents
            : incidents.filter((i) => i.status === statusFilter);

    // Cores por status
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

    // Centraliza na localização do usuário ao carregar
    useEffect(() => {
        if (location && !mapInitialized) {
            setInitialRegion({
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
            setMapInitialized(true);

            // Anima para a localização do usuário
            if (mapRef.current) {
                setTimeout(() => {
                    mapRef.current?.animateToRegion(
                        {
                            latitude: location.latitude,
                            longitude: location.longitude,
                            latitudeDelta: 0.05,
                            longitudeDelta: 0.05,
                        },
                        1000
                    );
                }, 500);
            }
        }
    }, [location, mapInitialized]);

    // Centraliza no local do usuário
    const handleCenterOnUser = async () => {
        if (location && mapRef.current) {
            mapRef.current.animateToRegion(
                {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                },
                1000
            );
        } else {
            Alert.alert('Localização', 'Não foi possível obter sua localização');
        }
    };

    const handleMarkerPress = (incident: Incident) => {
        setSelectedIncident(incident);
        setModalVisible(true);
    };

    useEffect(() => {
        if (incidents.length > 1 && mapRef.current && mapInitialized) {
            const latitudes = incidents.map((i) => i.latitude);
            const longitudes = incidents.map((i) => i.longitude);

            const maxLat = Math.max(...latitudes);
            const minLat = Math.min(...latitudes);
            const maxLon = Math.max(...longitudes);
            const minLon = Math.min(...longitudes);

            const centerLat = (maxLat + minLat) / 2;
            const centerLon = (maxLon + minLon) / 2;
            const latDelta = (maxLat - minLat) * 1.3;
            const lonDelta = (maxLon - minLon) * 1.3;

            mapRef.current.animateToRegion(
                {
                    latitude: centerLat,
                    longitude: centerLon,
                    latitudeDelta: Math.max(latDelta, 0.05),
                    longitudeDelta: Math.max(lonDelta, 0.05),
                },
                1000
            );
        }
    }, [incidents, mapInitialized]);

    if (locationLoading || !mapInitialized) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Obtendo sua localização...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Mapa */}
            <MapView
                ref={mapRef}
                provider={PROVIDER_DEFAULT}
                style={styles.map}
                initialRegion={initialRegion}
                zoomEnabled={true}
                scrollEnabled={true}
                pitchEnabled={false}
                rotateEnabled={false}
            >
                {/* Marker do usuário */}
                {location && (
                    <Marker
                        coordinate={{
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }}
                        title="Você está aqui"
                        description="Sua localização atual"
                    >
                        <View style={styles.userMarker}>
                            <View style={styles.userMarkerInner} />
                        </View>
                    </Marker>
                )}

                {/* Markers dos incidentes */}
                {filteredIncidents.map((incident) => (
                    <Marker
                        key={incident.id}
                        coordinate={{
                            latitude: incident.latitude,
                            longitude: incident.longitude,
                        }}
                        onPress={() => handleMarkerPress(incident)}
                        title={`Buraco #${incident.id}`}
                        description={incident.description}
                    >
                        <MapMarker
                            severity={incident.severity}
                            status={incident.status}
                        />
                    </Marker>
                ))}
            </MapView>

            {/* Filtros no topo */}
            <View style={styles.filterContainer}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    <Chip
                        selected={statusFilter === 'todos'}
                        onPress={() => setStatusFilter('todos')}
                        style={[
                            styles.filterChip,
                            statusFilter === 'todos' && styles.filterChipSelected,
                        ]}
                        icon="layers"
                    >
                        Todos ({incidents.length})
                    </Chip>
                    <Chip
                        selected={statusFilter === 'pendente'}
                        onPress={() => setStatusFilter('pendente')}
                        style={[
                            styles.filterChip,
                            statusFilter === 'pendente' && styles.filterChipSelected,
                        ]}
                        icon="clock"
                    >
                        Pendentes (
                        {incidents.filter((i) => i.status === 'pendente').length})
                    </Chip>
                    <Chip
                        selected={statusFilter === 'em_andamento'}
                        onPress={() => setStatusFilter('em_andamento')}
                        style={[
                            styles.filterChip,
                            statusFilter === 'em_andamento' && styles.filterChipSelected,
                        ]}
                        icon="progress-clock"
                    >
                        Andamento (
                        {incidents.filter((i) => i.status === 'em_andamento').length})
                    </Chip>
                    <Chip
                        selected={statusFilter === 'resolvido'}
                        onPress={() => setStatusFilter('resolvido')}
                        style={[
                            styles.filterChip,
                            statusFilter === 'resolvido' && styles.filterChipSelected,
                        ]}
                        icon="check-circle"
                    >
                        Resolvidos (
                        {incidents.filter((i) => i.status === 'resolvido').length})
                    </Chip>
                </ScrollView>
            </View>

            {/* Botão de centralizar */}
            <TouchableOpacity
                style={styles.centerButton}
                onPress={handleCenterOnUser}
            >
                <MaterialCommunityIcons
                    name="crosshairs-gps"
                    size={24}
                    color={Colors.primary}
                />
            </TouchableOpacity>

            {/* Modal de Detalhes */}
            <Portal>
                <Modal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    contentContainerStyle={styles.modal}
                >
                    {selectedIncident && (
                        <Card style={styles.modalCard}>
                            <Card.Content>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalId}>
                                        Buraco #{selectedIncident.id}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={() => setModalVisible(false)}
                                    >
                                        <MaterialCommunityIcons
                                            name="close"
                                            size={24}
                                            color={Colors.text}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Status:</Text>
                                    <Chip
                                        icon={
                                            selectedIncident.status === 'resolvido'
                                                ? 'check-circle'
                                                : selectedIncident.status === 'em_andamento'
                                                    ? 'progress-clock'
                                                    : 'clock'
                                        }
                                        style={{
                                            backgroundColor: getStatusColor(
                                                selectedIncident.status
                                            ),
                                        }}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                                            {getStatusLabel(selectedIncident.status)}
                                        </Text>
                                    </Chip>
                                </View>

                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Severidade:</Text>
                                    <Chip
                                        icon="alert-circle"
                                        style={{
                                            backgroundColor:
                                                selectedIncident.severity === 'alta'
                                                    ? Colors.error
                                                    : selectedIncident.severity === 'média'
                                                        ? Colors.warning
                                                        : Colors.success,
                                        }}
                                    >
                                        <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                                            {selectedIncident.severity.charAt(0).toUpperCase() +
                                                selectedIncident.severity.slice(1)}
                                        </Text>
                                    </Chip>
                                </View>

                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Descrição:</Text>
                                    <Text style={styles.modalDescription}>
                                        {selectedIncident.description}
                                    </Text>
                                </View>

                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Localização:</Text>
                                    <Text style={styles.modalLocationText}>
                                        📍 {selectedIncident.location}
                                    </Text>
                                </View>

                                <View style={styles.modalInfo}>
                                    <Text style={styles.modalLabel}>Data:</Text>
                                    <Text style={styles.modalDateText}>
                                        📅 {selectedIncident.date}
                                    </Text>
                                </View>

                                {selectedIncident.imageUri && (
                                    <View style={styles.modalInfo}>
                                        <Text style={styles.modalLabel}>Foto:</Text>
                                        <TouchableOpacity
                                            style={styles.imagePreview}
                                            onPress={() => {
                                                /* Aqui você pode abrir a imagem em tela cheia */
                                            }}
                                        >
                                            <MaterialCommunityIcons
                                                name="image"
                                                size={32}
                                                color={Colors.primary}
                                            />
                                            <Text style={styles.imagePreviewText}>
                                                Ver foto
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <Button
                                    mode="contained"
                                    onPress={() => setModalVisible(false)}
                                    style={styles.modalButton}
                                >
                                    Fechar
                                </Button>
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
    map: {
        flex: 1,
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
    userMarker: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: '#FFF',
    },
    userMarkerInner: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFF',
    },
    filterContainer: {
        position: 'absolute',
        top: 16,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        paddingHorizontal: 8,
    },
    filterScroll: {
        paddingHorizontal: 8,
        gap: 8,
    },
    filterChip: {
        backgroundColor: Colors.surface,
        borderColor: Colors.border,
        borderWidth: 1,
    },
    filterChipSelected: {
        backgroundColor: Colors.primary,
        borderColor: Colors.primary,
    },
    centerButton: {
        position: 'absolute',
        bottom: 24,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    modal: {
        justifyContent: 'flex-end',
        margin: 0,
    },
    modalCard: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: '80%',
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
    modalId: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    modalInfo: {
        marginVertical: 12,
    },
    modalLabel: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '600',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    modalDescription: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 20,
    },
    modalLocationText: {
        fontSize: 14,
        color: Colors.text,
        fontFamily: 'monospace',
    },
    modalDateText: {
        fontSize: 14,
        color: Colors.text,
    },
    imagePreview: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        borderStyle: 'dashed',
    },
    imagePreviewText: {
        fontSize: 12,
        color: Colors.primary,
        marginTop: 8,
        fontWeight: '600',
    },
    modalButton: {
        marginTop: 16,
    },
});
