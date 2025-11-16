import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface MapMarkerProps {
    severity: 'baixa' | 'média' | 'alta';
    status: 'pendente' | 'em_andamento' | 'resolvido';
}

export default function MapMarker({ severity, status }: MapMarkerProps) {
    const getColor = () => {
        if (status === 'resolvido') return Colors.success;
        if (severity === 'alta') return Colors.error;
        if (severity === 'média') return Colors.warning;
        return Colors.primary;
    };

    const getIcon = () => {
        if (status === 'resolvido') return 'check-circle';
        if (status === 'em_andamento') return 'progress-clock';
        return 'alert-circle';
    };

    const color = getColor();

    return (
        <View style={[styles.marker, { borderColor: color }]}>
            <MaterialCommunityIcons
                name={getIcon()}
                size={24}
                color={color}
                style={styles.icon}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    marker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.surface,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3,
        elevation: 5,
    },
    icon: {
        marginRight: 0,
    },
});
