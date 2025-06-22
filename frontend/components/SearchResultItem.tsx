import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export interface SearchResult {
    name: string;
    mapbox_id: string;
    feature_type: string;
    address: string;
    full_address: string;
}

interface SearchResultItemProps {
    item: SearchResult;
    onPress: (result: SearchResult) => void;
}

export function SearchResultItem({ item, onPress }: SearchResultItemProps) {
    const { colors } = useThemeContext();

    return (
        <Pressable 
            style={[styles.resultItem, { backgroundColor: colors.neutralMid }]}
            onPress={() => onPress(item)}
        >
            <View style={styles.resultContent}>
                <Text style={[styles.resultName, { color: colors.neutralOpposite }]}>
                    {item.name}
                </Text>
                <Text style={[styles.resultAddress, { color: colors.neutralSubtitle }]}>
                    {item.address}
                </Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    resultContent: {
        flex: 1,
    },
    resultName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    resultAddress: {
        fontSize: 14,
        fontWeight: '400',
    },
}); 