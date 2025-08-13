import { View, StyleSheet, Pressable, Text, Animated, ActivityIndicator } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useRef, useState } from 'react';
import { SearchResult } from '../types';

interface SearchResultItemProps {
    item: SearchResult;
    onPress: (result: SearchResult) => void;
}

export function SearchResultItem({ item, onPress }: SearchResultItemProps) {
    const { colors } = useThemeContext();
    const [isPressed, setIsPressed] = useState(false);

    const handlePress = () => {
        setIsPressed(true);
        onPress(item);
    };

    return (
        <View style={styles.resultItem}>
            <Pressable 
                style={[
                    styles.pressable,
                    { backgroundColor: colors.neutralMid }
                ]}
                onPress={handlePress}
            >
                <View style={styles.resultContent}>
                    <Text 
                        style={[
                            styles.resultName, 
                            { color: colors.neutralOpposite }
                        ]}
                    >
                        {item.name}
                    </Text>
                    <Text 
                        style={[
                            styles.resultAddress, 
                            { color: colors.neutralSubtitle }
                        ]}
                    >
                        {item.address}
                    </Text>
                </View>
            </Pressable>
            
            {/* Black overlay with loading spinner */}
            {isPressed && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="small" color="white" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    resultItem: {
        position: 'relative',
        marginBottom: 8,
        borderRadius: 8,
        overflow: 'hidden',
    },
    pressable: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
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
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
}); 