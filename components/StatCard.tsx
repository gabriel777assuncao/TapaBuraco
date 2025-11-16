import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: string;
    color: string;
    subtitle?: string;
}

export default function StatCard({
                                     title,
                                     value,
                                     icon,
                                     color,
                                     subtitle,
                                 }: StatCardProps) {
    // @ts-ignore
    return (
        <Card style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
            <Card.Content style={styles.content}>
                <View style={styles.headerRow}>
                    <View style={styles.textContainer}>
                        <Text style={styles.title}>{title}</Text>
                        <Text style={[styles.value, { color }]}>{value}</Text>
                        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    </View>
                    <MaterialCommunityIcons name={icon} size={40} color={color} />
                </View>
            </Card.Content>
        </Card>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: Colors.surface,
        marginVertical: 8,
        borderRadius: 12,
        elevation: 2,
    },
    content: {
        paddingVertical: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    textContainer: {
        flex: 1,
    },
    title: {
        fontSize: 14,
        color: Colors.textLight,
        marginBottom: 4,
    },
    value: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 12,
        color: Colors.textLight,
    },
});
