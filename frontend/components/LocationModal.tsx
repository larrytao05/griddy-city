import React from 'react';
import { Location } from '../types'
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeContext } from '@/context/ThemeContext';
import { useSearchContext } from '@/context/SearchContext';

const { height: screenHeight } = Dimensions.get('window');

export function LocationModal({ location }: {location: Location | null}) {
    const { colors } = useThemeContext();
    const { clearSelectedLocation } = useSearchContext();

    if (!location) return null;

    return (
        <View style={[styles.overlay, {backgroundColor: colors.neutral}]}>
            <View style={styles.header}>
                <Text style={[styles.locationName, {color: colors.neutralOpposite}]}>{location.name}</Text>
                <Text style={[styles.locationAddress, {color: colors.neutralSubtitle}]}>{location.address}</Text>
                <Pressable style={styles.closeButton} onPress={clearSelectedLocation}>
                    <Ionicons 
                        name='close'
                        size={30}
                        color={colors.neutralOpposite}
                    />
                </Pressable>
            </View>
            <View style={styles.footer}>
                <Text style={[styles.attribution, {color: colors.neutralOpposite}]}>{location.attribution}</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopRightRadius: 24,
        borderTopLeftRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 100,
        zIndex: 1000,
    },
    header: {
        position: 'relative',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%'
    },
    footer: {

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
    },
    attribution: {
        fontSize: 8,
        textAlign: 'center'
    }
})