import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Rating {
    id: string;
    incidentId: string;
    stars: number;
    comment?: string;
    createdAt: string;
}

const RATINGS_KEY = '@tapaburaco_ratings';

export const useRatings = () => {
    const [ratings, setRatings] = useState<Rating[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRatings();
    }, []);

    const loadRatings = async () => {
        try {
            setLoading(true);
            const data = await AsyncStorage.getItem(RATINGS_KEY);
            if (data) {
                setRatings(JSON.parse(data));
            }
        } catch (err) {
            console.error('Erro ao carregar avaliações:', err);
        } finally {
            setLoading(false);
        }
    };

    const addRating = async (incidentId: string, stars: number, comment?: string) => {
        try {
            const newRating: Rating = {
                id: Date.now().toString(),
                incidentId,
                stars,
                comment,
                createdAt: new Date().toISOString(),
            };

            const updated = [...ratings, newRating];
            setRatings(updated);
            await AsyncStorage.setItem(RATINGS_KEY, JSON.stringify(updated));
            return newRating;
        } catch (err) {
            console.error('Erro ao adicionar avaliação:', err);
        }
    };

    const getIncidentRating = (incidentId: string) => {
        return ratings.find((r) => r.incidentId === incidentId);
    };

    const getAverageRating = () => {
        if (ratings.length === 0) return 0;
        const sum = ratings.reduce((acc, r) => acc + r.stars, 0);
        return (sum / ratings.length).toFixed(1);
    };

    return {
        ratings,
        loading,
        addRating,
        getIncidentRating,
        getAverageRating,
    };
};
