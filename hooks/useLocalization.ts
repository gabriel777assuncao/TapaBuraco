import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export interface LocationCoords {
    latitude: number;
    longitude: number;
    accuracy: number | null;
}

export const useLocation = () => {
    const [location, setLocation] = useState<LocationCoords | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const getLocation = async () => {
            try {
                setLoading(true);
                setError(null);

                // Solicita permissão
                const { status } = await Location.requestForegroundPermissionsAsync();

                if (status !== 'granted') {
                    if (isMounted) {
                        setError('Permissão de localização negada');
                        setLoading(false);
                    }
                    return;
                }

                // Obtém a localização com timeout
                const locationData = await Promise.race([
                    Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced, // Menos preciso, mais rápido
                        maxAge: 5000, // Cache de 5 segundos
                    }),
                    new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout')), 10000)
                    ),
                ]);

                if (isMounted && locationData) {
                    const { latitude, longitude, accuracy } = (locationData as any).coords;
                    setLocation({
                        latitude,
                        longitude,
                        accuracy,
                    });
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    console.error('Erro de localização:', err);
                    setError('Erro ao obter localização');
                    // Usa localização padrão se falhar
                    setLocation({
                        latitude: -23.5505,
                        longitude: -46.6333,
                        accuracy: null,
                    });
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        getLocation();

        return () => {
            isMounted = false;
        };
    }, []);

    const getLocation = async () => {
        try {
            setLoading(true);
            setError(null);

            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                setError('Permissão de localização negada');
                setLoading(false);
                return;
            }

            const locationData = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
                maxAge: 5000,
            });

            const { latitude, longitude, accuracy } = locationData.coords;

            setLocation({
                latitude,
                longitude,
                accuracy,
            });
        } catch (err) {
            console.error('Erro ao atualizar localização:', err);
            setError('Erro ao obter localização');
        } finally {
            setLoading(false);
        }
    };

    return {
        location,
        error,
        loading,
        getLocation,
    };
};
