import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface IncidentCardProps {
    id: string;
    description: string;
    severity: 'baixa' | 'média' | 'alta';
    status: 'pendente' | 'em_andamento' | 'resolvido';
    imageUri?: string;
    date: string;
    location: string;
    onPress?: () => void;
}

export default function IncidentCard({
                                         id,
                                         description,
                                         severity,
                                         status,
                                         imageUri,
                                         date,
                                         location,
                                         onPress,
                                     }: IncidentCardProps) {
    const getSeverityColor = (sev: string) => {
        switch (sev) {
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

    const getStatusLabel = (stat: string) => {
        switch (stat) {
            case 'pendente':
                return 'Pendente';
            case 'em_andamento':
                return 'Em andamento';
            case 'resolvido':
                return 'Resolvido';
            default:
                return stat;
        }
    };

    const getStatusColor = (stat: string) => {
        switch (stat) {
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

    // @ts-ignore
    // @ts-ignore
    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <Card style={styles.card}>
                <Card.Content>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <Text style={styles.id}>#{id}</Text>
                            <Chip
                                icon="alert-circle"
                                label={severity.charAt(0).toUpperCase() + severity.slice(1)}
                                style={[
                                    styles.severityChip,
                                    { backgroundColor: getSeverityColor(severity) },
                                ]}
                                textStyle={styles.chipText}
                            />
                        </View>
                        <Chip
                            label={getStatusLabel(status)}
                            style={[
                                styles.statusChip,
                                { backgroundColor: getStatusColor(status) },
                            ]}
                            textStyle={styles.chipText}
                        />
                    </View>

                    <Text
                        style={styles.description}
                        numberOfLines={2}
                        ellipsizeMode="tail"
                    >
                        {description}
                    </Text>

                    {imageUri && (
                        <Image
                            source={{ uri: imageUri }}
                            style={styles.image}
                            resizeMode="cover"
                        />
                    )}

                    <View style={styles.footer}>
                        <View style={styles.footerItem}>
                            <MaterialCommunityIcons
                                name="calendar"
                                size={16}
                                color={Colors.textLight}
                            />
                            <Text style={styles.footerText}>{date}</Text>
                        </View>
                        <View style={styles.footerItem}>
                            <MaterialCommunityIcons
                                name="map-marker"
                                size={16}
                                color={Colors.textLight}
                            />
                            <Text style={styles.footerText} numberOfLines={1}>
                                {location}
                            </Text>
                        </View>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        marginVertical: 8,
        borderRadius: 12,
        elevation: 2,
    },
    header: {
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
    id: {
        fontSize: 12,
        fontWeight: 'bold',
        color: Colors.primary,
    },
    severityChip: {
        height: 28,
    },
    statusChip: {
        height: 28,
    },
    chipText: {
        fontSize: 12,
        color: '#FFFFFF',
    },
    description: {
        fontSize: 14,
        color: Colors.text,
        marginBottom: 8,
        fontWeight: '500',
    },
    image: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: Colors.background,
    },
    footer: {
        flexDirection: 'row',
        gap: 16,
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
});
