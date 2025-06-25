import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { getColors } from '@/constants/ThemeColors';

export interface LocationModalProps {
    location: {
        name: string;
        address: string;
        lat: number;
        lng: number;
    } | null;
    onClose: () => void;
}

const { height: screenHeight } = Dimensions.get('window');

export function LocationModal({ location, onClose }: LocationModalProps) {
    const { colors } = useThemeContext();

    if (!location) return null;

    return (
        <View style={[styles.overlay, {backgroundColor: colors.neutral}]}>
            <View style={styles.header}>
                <Text style={[styles.locationName, {color: colors.neutralOpposite}]}>{location.name}</Text>
                <Text style={[styles.locationAddress, {color: colors.neutralSubtitle}]}>{location.address}</Text>
                <Pressable style={styles.closeButton} onPress={onClose}>
                    <Ionicons 
                        name='close'
                        size={30}
                        color={colors.neutralOpposite}
                    />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: screenHeight * 0.4,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        zIndex: 1000,
    },
    header: {
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%'
    },
    locationName: {
        fontSize: 30,
        fontWeight: 500
    },
    locationAddress: {
        fontSize: 16
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        borderRadius: '100%',
        padding: 4
    }
})