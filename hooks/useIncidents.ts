import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Incident {
    id: string;
    description: string;
    severity: 'baixa' | 'média' | 'alta';
    status: 'pendente' | 'em_andamento' | 'resolvido';
    imageUri?: string;
    date: string;
    location: string;
    latitude: number;
    longitude: number;
    createdAt: string;
}

const STORAGE_KEY = '@tapaburaco_incidents';

export const useIncidents = () => {
    const [incidents, setIncidents] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Carrega os incidentes do AsyncStorage
    const loadIncidents = async () => {
        try {
            setLoading(true);
            const data = await AsyncStorage.getItem(STORAGE_KEY);

            if (data) {
                setIncidents(JSON.parse(data));
            } else {
                // Dados iniciais de exemplo (primeira vez que abre)
                const initialData: Incident[] = [
                    {
                        id: '001',
                        description: 'Buraco grande na Rua Principal, aproximadamente 60cm',
                        severity: 'alta',
                        status: 'pendente',
                        date: 'Hoje',
                        location: 'Rua Principal, nº 500',
                        latitude: -23.5505,
                        longitude: -46.6333,
                        createdAt: new Date().toISOString(),
                    },
                    {
                        id: '002',
                        description: 'Pequeno buraco na via lateral',
                        severity: 'baixa',
                        status: 'em_andamento',
                        date: 'Ontem',
                        location: 'Av. Secundária',
                        latitude: -23.5510,
                        longitude: -46.6340,
                        createdAt: new Date(Date.now() - 86400000).toISOString(),
                    },
                    {
                        id: '003',
                        description: 'Poça grande no asfalto, risco de acidentes',
                        severity: 'média',
                        status: 'resolvido',
                        date: '2 dias atrás',
                        location: 'Rua das Flores',
                        latitude: -23.5515,
                        longitude: -46.6320,
                        createdAt: new Date(Date.now() - 172800000).toISOString(),
                    },
                ];

                setIncidents(initialData);
                await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            }

            setError(null);
        } catch (err) {
            setError('Erro ao carregar incidentes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Adiciona um novo incidente
    const addIncident = async (newIncident: Omit<Incident, 'id' | 'createdAt'>) => {
        try {
            const id = Date.now().toString();
            const incident: Incident = {
                ...newIncident,
                id,
                createdAt: new Date().toISOString(),
            };

            const updatedIncidents = [incident, ...incidents];

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIncidents));
            setIncidents(updatedIncidents);

            return incident;
        } catch (err) {
            setError('Erro ao adicionar incidente');
            console.error(err);
            throw err;
        }
    };

    // Atualiza o status de um incidente
    const updateIncidentStatus = async (
        id: string,
        status: Incident['status']
    ) => {
        try {
            const updatedIncidents = incidents.map((incident) =>
                incident.id === id ? { ...incident, status } : incident
            );

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIncidents));
            setIncidents(updatedIncidents);
        } catch (err) {
            setError('Erro ao atualizar incidente');
            console.error(err);
            throw err;
        }
    };

    // Deleta um incidente
    const deleteIncident = async (id: string) => {
        try {
            const updatedIncidents = incidents.filter((incident) => incident.id !== id);

            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIncidents));
            setIncidents(updatedIncidents);
        } catch (err) {
            setError('Erro ao deletar incidente');
            console.error(err);
            throw err;
        }
    };

    // Limpa todos os incidentes (útil para teste)
    const clearAll = async () => {
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
            setIncidents([]);
        } catch (err) {
            setError('Erro ao limpar dados');
            console.error(err);
            throw err;
        }
    };

    useEffect(() => {
        loadIncidents();
    }, []);

    return {
        incidents,
        loading,
        error,
        addIncident,
        updateIncidentStatus,
        deleteIncident,
        clearAll,
        refresh: loadIncidents,
    };
};
