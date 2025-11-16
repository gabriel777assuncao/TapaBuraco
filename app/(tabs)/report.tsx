import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import {
    Text,
    Title,
    Card,
    TextInput,
    Button,
    HelperText,
    Chip,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import ImagePickerComponent from '../../components/imagePicker';
import FormButton from '../../components/FormButton';
import { Colors } from '../../constants/colors';
import { useLocation } from '../../hooks/useLocalization';
import { useIncidents } from '../../hooks/useIncidents';
import { useNotifications } from '../../hooks/useNotifications';

interface ReportData {
    description: string;
    imageUri: string | null;
    severity: 'baixa' | 'média' | 'alta';
}

export default function ReportScreen() {
    const router = useRouter();
    const { location, loading: locationLoading, getLocation } = useLocation();
    const { addIncident } = useIncidents();
    const { addNotification } = useNotifications();

    const [reportData, setReportData] = useState<ReportData>({
        description: '',
        imageUri: null,
        severity: 'média',
    });

    const [errors, setErrors] = useState({ description: '' });
    const [submitting, setSubmitting] = useState(false);

    // Obtém localização ao carregar
    useEffect(() => {
        getLocation();
    }, []);

    // Validação
    const validateForm = (): boolean => {
        const newErrors = { description: '' };

        if (!reportData.description.trim()) {
            newErrors.description = 'Descrição é obrigatória';
        } else if (reportData.description.trim().length < 10) {
            newErrors.description = 'Descrição deve ter pelo menos 10 caracteres';
        }

        setErrors(newErrors);
        return newErrors.description === '';
    };

    // Gera data formatada
    const getFormattedDate = () => {
        const today = new Date();
        return today.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
        });
    };

    // Gera endereço aproximado
    const getApproximateLocation = () => {
        if (!location) return 'Localização desconhecida';
        return `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`;
    };

    // Submeter relatório
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        if (!location) {
            Alert.alert('Erro', 'Não foi possível obter sua localização. Tente novamente.');
            return;
        }

        if (!reportData.imageUri) {
            Alert.alert('Erro', 'Por favor, selecione uma foto do buraco');
            return;
        }

        setSubmitting(true);

        try {
            // Cria o novo incidente
            const incident = await addIncident({
                description: reportData.description,
                severity: reportData.severity,
                status: 'pendente',
                imageUri: reportData.imageUri,
                latitude: location.latitude,
                longitude: location.longitude,
                date: getFormattedDate(),
                location: getApproximateLocation(),
            });

            // Cria notificações
            await addNotification(
                'Denúncia Registrada ✅',
                'Sua denúncia foi recebida com sucesso!',
                'success',
                incident.id,
                'check-circle'
            );

            // Sucesso!
            Alert.alert(
                'Sucesso! ✅',
                'Sua denúncia foi enviada com sucesso.\nObrigado por ajudar a melhorar as vias!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // Reseta o formulário
                            setReportData({
                                description: '',
                                imageUri: null,
                                severity: 'média',
                            });
                            // Volta para a home
                            router.replace('/(tabs)');
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Erro ao enviar relatório:', error);
            Alert.alert('Erro', 'Erro ao enviar o relatório. Tente novamente.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRefreshLocation = () => {
        getLocation();
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.header}>
                    <Title style={styles.title}>📸 Registrar Ocorrência</Title>
                    <Text style={styles.subtitle}>
                        Ajude-nos a identificar e reparar buracos nas vias
                    </Text>
                </View>

                <View style={styles.content}>
                    {/* Card de Localização */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <View style={styles.cardHeader}>
                                <Text style={styles.cardTitle}>📍 Sua Localização</Text>
                                <Button
                                    mode="text"
                                    icon="refresh"
                                    onPress={handleRefreshLocation}
                                    disabled={locationLoading}
                                    compact
                                >
                                    Atualizar
                                </Button>
                            </View>

                            {locationLoading ? (
                                <Text style={styles.locationText}>Obtendo localização...</Text>
                            ) : location ? (
                                <View style={styles.locationInfo}>
                                    <Text style={styles.locationText}>
                                        Latitude: {location.latitude.toFixed(6)}
                                    </Text>
                                    <Text style={styles.locationText}>
                                        Longitude: {location.longitude.toFixed(6)}
                                    </Text>
                                    <Text style={styles.locationText}>
                                        Precisão: ~{Math.round(location.accuracy || 0)}m
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.errorText}>Erro ao obter localização</Text>
                            )}
                        </Card.Content>
                    </Card>

                    {/* Card de Foto */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>📷 Foto do Buraco</Text>
                            <ImagePickerComponent
                                selectedImage={reportData.imageUri}
                                onImagePicked={(uri) =>
                                    setReportData({ ...reportData, imageUri: uri })
                                }
                            />
                        </Card.Content>
                    </Card>

                    {/* Card de Descrição */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>📝 Descrição</Text>
                            <TextInput
                                label="Descreva o problema..."
                                value={reportData.description}
                                onChangeText={(text) =>
                                    setReportData({ ...reportData, description: text })
                                }
                                mode="outlined"
                                multiline
                                numberOfLines={4}
                                style={styles.input}
                                error={!!errors.description}
                                placeholder="Ex: Buraco grande na via, aproximadamente 50cm de diâmetro..."
                            />
                            {errors.description ? (
                                <HelperText type="error" visible={!!errors.description}>
                                    {errors.description}
                                </HelperText>
                            ) : null}
                        </Card.Content>
                    </Card>

                    {/* Card de Severidade */}
                    <Card style={styles.card}>
                        <Card.Content>
                            <Text style={styles.cardTitle}>⚠️ Nível de Severidade</Text>
                            <View style={styles.chipContainer}>
                                {(['baixa', 'média', 'alta'] as const).map((level) => (
                                    <Chip
                                        key={level}
                                        selected={reportData.severity === level}
                                        onPress={() =>
                                            setReportData({ ...reportData, severity: level })
                                        }
                                        style={[
                                            styles.chip,
                                            reportData.severity === level && styles.chipSelected,
                                        ]}
                                    >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </Chip>
                                ))}
                            </View>
                        </Card.Content>
                    </Card>

                    {/* Botões de Ação */}
                    <View style={styles.buttonContainer}>
                        <FormButton
                            title="Enviar Denúncia"
                            onPress={handleSubmit}
                            mode="contained"
                            loading={submitting}
                            disabled={submitting}
                            icon="check-circle"
                        />
                        <FormButton
                            title="Cancelar"
                            onPress={() => router.back()}
                            mode="outlined"
                            disabled={submitting}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
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
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: Colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.textLight,
    },
    content: {
        gap: 16,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: 12,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    locationInfo: {
        backgroundColor: Colors.background,
        borderRadius: 8,
        padding: 12,
        gap: 8,
    },
    locationText: {
        fontSize: 14,
        color: Colors.text,
        fontFamily: 'monospace',
    },
    errorText: {
        fontSize: 14,
        color: Colors.error,
    },
    input: {
        marginTop: 12,
    },
    chipContainer: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        flexWrap: 'wrap',
    },
    chip: {
        backgroundColor: Colors.background,
    },
    chipSelected: {
        backgroundColor: Colors.primary,
    },
    buttonContainer: {
        gap: 12,
        marginTop: 24,
        marginBottom: 32,
    },
});
