import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    Share,
    ActivityIndicator,
} from 'react-native';
import {
    Text,
    Card,
    Button,
    TextInput,
    Dialog,
    Portal,
    Divider,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useUser } from '../../hooks/useUser';
import { useIncidents } from '../../hooks/useIncidents';
import StatCard from '../../components/StatCard';

export default function ProfileScreen() {
    const router = useRouter();
    const { user, loading, updateUser, logout } = useUser();
    const { incidents } = useIncidents();

    const [editMode, setEditMode] = useState(false);
    const [editedData, setEditedData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        city: user?.city || '',
    });
    const [dialogVisible, setDialogVisible] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Recarrega dados quando tela ganha foco
    useFocusEffect(
        useCallback(() => {
            if (user) {
                setEditedData({
                    name: user.name,
                    email: user.email,
                    phone: user.phone || '',
                    city: user.city || '',
                });
            }
        }, [user])
    );

    // Se carregando
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Carregando perfil...</Text>
            </View>
        );
    }

    // Se não houver usuário logado
    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                        name="account-alert"
                        size={64}
                        color={Colors.textLight}
                    />
                    <Text style={styles.emptyText}>Usuário não logado</Text>
                    <Button
                        mode="contained"
                        onPress={() => router.replace('/auth/login')}
                        style={styles.emptyButton}
                    >
                        Fazer Login
                    </Button>
                </View>
            </View>
        );
    }

    const handleSaveChanges = async () => {
        if (!editedData.name.trim() || !editedData.email.trim()) {
            Alert.alert('Erro', 'Nome e email são obrigatórios');
            return;
        }

        try {
            setSubmitting(true);
            await updateUser({
                name: editedData.name,
                email: editedData.email,
                phone: editedData.phone,
                city: editedData.city,
            });
            setEditMode(false);
            Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        } catch (err) {
            Alert.alert('Erro', 'Erro ao atualizar perfil');
        } finally {
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Tem certeza que deseja sair?', [
            {
                text: 'Cancelar',
                onPress: () => {},
            },
            {
                text: 'Sair',
                onPress: async () => {
                    await logout();
                    router.replace('/auth/login');
                },
                style: 'destructive',
            },
        ]);
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Olá! Estou usando o TapaBuraco para denunciar buracos e melhorar as vias da minha cidade! 🚧 Já fiz ${incidents.length} denúncias. Você também pode ajudar!`,
                title: 'Compartilhe o TapaBuraco',
            });
        } catch (error) {
            console.error(error);
        }
    };

    const calculateRepairRate = () => {
        if (incidents.length === 0) return 0;
        const resolved = incidents.filter((i) => i.status === 'resolvido').length;
        return Math.round((resolved / incidents.length) * 100);
    };

    // Contar incidentes
    const userTotalIncidents = incidents.length;
    const userResolvedIncidents = incidents.filter(
        (i) => i.status === 'resolvido'
    ).length;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Header com Avatar */}
                <View style={styles.headerSection}>
                    <View style={styles.avatarContainer}>
                        <Text style={styles.avatar}>{user.avatar || '👤'}</Text>
                    </View>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>

                    {!editMode && (
                        <Button
                            mode="contained"
                            onPress={() => setEditMode(true)}
                            icon="pencil"
                            style={styles.editButton}
                        >
                            Editar Perfil
                        </Button>
                    )}
                </View>

                {/* Modo Edição */}
                {editMode && (
                    <Card style={styles.editCard}>
                        <Card.Content>
                            <Text style={styles.editTitle}>Editar Informações</Text>

                            <TextInput
                                label="Nome"
                                value={editedData.name}
                                onChangeText={(text) =>
                                    setEditedData({ ...editedData, name: text })
                                }
                                mode="outlined"
                                style={styles.input}
                                editable={!submitting}
                            />

                            <TextInput
                                label="Email"
                                value={editedData.email}
                                onChangeText={(text) =>
                                    setEditedData({ ...editedData, email: text })
                                }
                                mode="outlined"
                                keyboardType="email-address"
                                style={styles.input}
                                editable={false}
                            />

                            <TextInput
                                label="Telefone"
                                value={editedData.phone}
                                onChangeText={(text) =>
                                    setEditedData({ ...editedData, phone: text })
                                }
                                mode="outlined"
                                keyboardType="phone-pad"
                                style={styles.input}
                                editable={!submitting}
                            />

                            <TextInput
                                label="Cidade"
                                value={editedData.city}
                                onChangeText={(text) =>
                                    setEditedData({ ...editedData, city: text })
                                }
                                mode="outlined"
                                style={styles.input}
                                editable={!submitting}
                            />

                            <View style={styles.editButtonContainer}>
                                <Button
                                    mode="contained"
                                    onPress={handleSaveChanges}
                                    style={styles.saveButton}
                                    icon="check"
                                    loading={submitting}
                                    disabled={submitting}
                                >
                                    Salvar
                                </Button>
                                <Button
                                    mode="outlined"
                                    onPress={() => {
                                        setEditMode(false);
                                        setEditedData({
                                            name: user.name,
                                            email: user.email,
                                            phone: user.phone || '',
                                            city: user.city || '',
                                        });
                                    }}
                                    style={styles.cancelButton}
                                    icon="close"
                                    disabled={submitting}
                                >
                                    Cancelar
                                </Button>
                            </View>
                        </Card.Content>
                    </Card>
                )}

                {/* Informações Pessoais */}
                {!editMode && (
                    <>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.cardTitle}>👤 Informações Pessoais</Text>
                                <Divider style={styles.divider} />

                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons
                                        name="phone"
                                        size={20}
                                        color={Colors.primary}
                                    />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Telefone</Text>
                                        <Text style={styles.infoValue}>
                                            {user.phone || 'Não informado'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons
                                        name="map-marker"
                                        size={20}
                                        color={Colors.primary}
                                    />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Cidade</Text>
                                        <Text style={styles.infoValue}>
                                            {user.city || 'Não informado'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.infoRow}>
                                    <MaterialCommunityIcons
                                        name="calendar"
                                        size={20}
                                        color={Colors.primary}
                                    />
                                    <View style={styles.infoContent}>
                                        <Text style={styles.infoLabel}>Membro desde</Text>
                                        <Text style={styles.infoValue}>{user.joinedDate}</Text>
                                    </View>
                                </View>
                            </Card.Content>
                        </Card>

                        {/* Estatísticas */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📊 Suas Estatísticas</Text>

                            <StatCard
                                title="Denúncias Realizadas"
                                value={userTotalIncidents}
                                icon="alert"
                                color={Colors.primary}
                                subtitle="Obrigado por ajudar!"
                            />

                            <StatCard
                                title="Reparadas"
                                value={userResolvedIncidents}
                                icon="check-circle"
                                color={Colors.success}
                                subtitle={`Taxa: ${calculateRepairRate()}%`}
                            />

                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={styles.progressHeader}>
                                        <Text style={styles.progressTitle}>Taxa de Reparo</Text>
                                        <Text style={styles.progressValue}>
                                            {calculateRepairRate()}%
                                        </Text>
                                    </View>

                                    <View style={styles.progressBar}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                {
                                                    width: `${calculateRepairRate()}%`,
                                                    backgroundColor: Colors.success,
                                                },
                                            ]}
                                        />
                                    </View>

                                    <Text style={styles.progressSubtext}>
                                        {userResolvedIncidents} de {userTotalIncidents} denúncias
                                        foram reparadas
                                    </Text>
                                </Card.Content>
                            </Card>
                        </View>

                        {/* Ações */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>⚙️ Ações</Text>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={handleShare}
                            >
                                <MaterialCommunityIcons
                                    name="share-variant"
                                    size={24}
                                    color={Colors.primary}
                                />
                                <Text style={styles.actionButtonText}>
                                    Compartilhar Aplicativo
                                </Text>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color={Colors.textLight}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => setDialogVisible(true)}
                            >
                                <MaterialCommunityIcons
                                    name="information"
                                    size={24}
                                    color={Colors.primary}
                                />
                                <Text style={styles.actionButtonText}>Sobre o App</Text>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color={Colors.textLight}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, styles.logoutButton]}
                                onPress={handleLogout}
                            >
                                <MaterialCommunityIcons
                                    name="logout"
                                    size={24}
                                    color={Colors.error}
                                />
                                <Text style={[styles.actionButtonText, styles.logoutText]}>
                                    Sair da Conta
                                </Text>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color={Colors.error}
                                />
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.actionButton, { borderLeftColor: Colors.primary, borderLeftWidth: 4 }]}
                                onPress={() => router.push('/(admin)/dashboard')}
                            >
                                <MaterialCommunityIcons
                                    name="shield-admin"
                                    size={24}
                                    color={Colors.primary}
                                />
                                <Text style={styles.actionButtonText}>
                                    Painel Admin (Teste)
                                </Text>
                                <MaterialCommunityIcons
                                    name="chevron-right"
                                    size={24}
                                    color={Colors.textLight}
                                />
                            </TouchableOpacity>

                        </View>
                    </>
                )}
            </ScrollView>

            {/* Dialog Sobre */}
            <Portal>
                <Dialog visible={dialogVisible} onDismiss={() => setDialogVisible(false)}>
                    <Dialog.Title>Sobre o TapaBuraco</Dialog.Title>
                    <Dialog.Content>
                        <Text style={styles.dialogText}>
                            <Text style={styles.dialogBold}>TapaBuraco v1.0.0</Text>
                            {'\n\n'}
                            Um aplicativo para denunciar e acompanhar o reparo de buracos nas
                            vias públicas, conectando cidadãos e poder público.
                            {'\n\n'}
                            <Text style={styles.dialogBold}>Desenvolvido com ❤️</Text>
                            {'\n'}
                            Usando React Native, Expo e tecnologia de ponta.
                            {'\n\n'}
                            <Text style={styles.dialogBold}>© 2025</Text>
                            {'\n'}
                            Todos os direitos reservados.
                        </Text>
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setDialogVisible(false)}>Fechar</Button>
                    </Dialog.Actions>
                </Dialog>
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.background,
        gap: 16,
    },
    emptyText: {
        fontSize: 18,
        color: Colors.textLight,
        fontWeight: '600',
        marginTop: 12,
    },
    emptyButton: {
        marginTop: 16,
        minWidth: 150,
    },
    headerSection: {
        alignItems: 'center',
        paddingVertical: 32,
        backgroundColor: Colors.surface,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatar: {
        fontSize: 48,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 4,
    },
    userEmail: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 16,
    },
    editButton: {
        marginTop: 12,
    },
    editCard: {
        marginHorizontal: 16,
        marginBottom: 24,
        backgroundColor: Colors.surface,
    },
    editTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: Colors.text,
        marginBottom: 16,
    },
    input: {
        marginBottom: 12,
    },
    editButtonContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    saveButton: {
        flex: 1,
    },
    cancelButton: {
        flex: 1,
    },
    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    card: {
        backgroundColor: Colors.surface,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
        marginBottom: 12,
    },
    divider: {
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        gap: 12,
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 12,
        color: Colors.textLight,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    infoValue: {
        fontSize: 14,
        color: Colors.text,
        marginTop: 4,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.text,
    },
    progressValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: Colors.success,
    },
    progressBar: {
        width: '100%',
        height: 12,
        backgroundColor: Colors.background,
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        borderRadius: 6,
    },
    progressSubtext: {
        fontSize: 12,
        color: Colors.textLight,
        textAlign: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        paddingVertical: 16,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 12,
        gap: 12,
    },
    actionButtonText: {
        flex: 1,
        fontSize: 16,
        color: Colors.text,
        fontWeight: '500',
    },
    logoutButton: {
        borderColor: Colors.error,
        borderWidth: 1,
    },
    logoutText: {
        color: Colors.error,
    },
    dialogText: {
        fontSize: 14,
        color: Colors.text,
        lineHeight: 22,
    },
    dialogBold: {
        fontWeight: 'bold',
        color: Colors.primary,
    },
});
