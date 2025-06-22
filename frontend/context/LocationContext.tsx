import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

interface LocationContextType {
    userLocation: { lat: number; lng: number } | null;
    isLoading: boolean;
    error: string | null;
    requestPermission: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkLocationPermission();
    }, []);

    const checkLocationPermission = async () => {
        try {
            const { status } = await Location.getForegroundPermissionsAsync();
            
            if (status === 'granted') {
                await getCurrentLocation();
            } else {
                setError('Location access denied. Enable in settings to use location-based features.');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Failed to check location permission');
            setIsLoading(false);
        }
    };

    const requestPermission = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status === 'granted') {
                await getCurrentLocation();
            } else {
                setError('Location permission denied. Enable in settings to use location-based features.');
                setIsLoading(false);
            }
        } catch (err) {
            setError('Failed to request location permission');
            setIsLoading(false);
        }
    };

    const getCurrentLocation = async () => {
        try {
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            setUserLocation({
                lat: location.coords.latitude,
                lng: location.coords.longitude,
            });
        } catch (err) {
            setError('Failed to get current location');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LocationContext.Provider value={{ userLocation, isLoading, error, requestPermission }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
} 