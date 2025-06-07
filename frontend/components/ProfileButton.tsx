import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { Colors } from "@/constants/Colors";
import { useThemeContext } from "@/context/ThemeContext";
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export function ProfileButton() {
    const { colors } = useThemeContext();
    const router = useRouter();

    return (
        <Pressable 
            style={[styles.container, { backgroundColor: colors.accent, borderColor: colors.neutral}]}
            onPress={() => router.push('/profile')}
        >
            <Ionicons
                name={'person'} 
                size={22}
                color={`${Colors.light.neutral}60`}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 4
    },
})