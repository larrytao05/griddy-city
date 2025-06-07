import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileButton } from '@/components/ProfileButton';
import { useThemeContext } from '@/context/ThemeContext';

export default function Map() {
    return (
        <View style={[styles.container]}>
            <View style={[styles.topButtons]}>
                <ThemeToggle />
                <ProfileButton />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 60
    },
    topButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
    },
}) 