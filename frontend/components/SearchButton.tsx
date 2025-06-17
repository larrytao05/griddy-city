import { StyleSheet, View, Text, Pressable } from "react-native";
import { useThemeContext } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export function SearchBar() {
    const { colors } = useThemeContext();
    const router = useRouter();

    return (
        <Pressable 
            style={[styles.container, {backgroundColor: colors.accent}]} 
            onPress={() => router.push('/search')}
        >
            <Text style={[styles.text, {color: colors.lightAccent}]}>Search</Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 60,
        gap: 8,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 5
    },
    text: {
        fontSize: 24,
        fontWeight: '400'
    }
})