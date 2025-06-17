import { View, StyleSheet, TextInput, Pressable, Text } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { getColors } from '@/constants/ThemeColors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { FloatingBox } from '@/components/FloatingBox';

type SearchType = 'location' | 'station';

export default function SearchScreen() {
    const { colors } = useThemeContext();
    const globalLight = getColors('light').neutral;
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchTypeDropdownOpen, setSearchTypeDropdownOpen] = useState(false);
    const [iconPosition, setIconPosition] = useState({ x: 0, y: 0 });
    const iconRef = useRef<View>(null);
    const [searchType, setSearchType] = useState<SearchType>('location');

    const onIconPress = () => {
        if (iconRef.current) {
            iconRef.current.measureInWindow((x, y, width, height) => {
                setIconPosition({
                    x: x + width / 2,
                    y: y + height
                });
                setSearchTypeDropdownOpen(!searchTypeDropdownOpen);
            });
        } else {
            setSearchTypeDropdownOpen(!searchTypeDropdownOpen);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.neutral }]}>
            <View style={styles.header}>
                <View style={[styles.searchBar, { backgroundColor: colors.accent }]}>
                    <Pressable onPress={() => router.back()}>
                        <Ionicons name="chevron-back" size={30} color={globalLight} />
                    </Pressable>
                    <TextInput 
                        style={[styles.input, { color: globalLight }]}
                        placeholder={searchType == 'location' ? 'Search locations...' : 'Search stations...'}
                        placeholderTextColor={colors.lightAccent}
                        selectionColor={globalLight}
                        autoFocus={true}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    <View style={{width: 1, height: 24, backgroundColor: colors.lightAccent}}/>
                    <Pressable 
                        ref={iconRef}
                        onPress={onIconPress}
                        style={{position: 'relative'}}
                    >
                        <Ionicons name={searchType == 'location' ? 'location-outline' : 'train-outline'} size={30} color={globalLight} />
                    </Pressable>
                </View>
            </View>
            {searchTypeDropdownOpen && (
                <FloatingBox 
                    anchorPosition={iconPosition}
                    placement="bottom"
                >
                    <View style={styles.dropdownContainer}>
                        <Pressable 
                            style={[styles.dropdownSelection, {backgroundColor: searchType == 'location' ? `${colors.secondaryAccent}50` : ''}]}
                            onPress={() => {
                                setSearchType('location');
                                setSearchTypeDropdownOpen(false);
                            }}
                        >
                            <Ionicons name={searchType == 'location' ? 'location' : 'location-outline'} size={20} color={searchType == 'location' ? colors.secondaryAccent : colors.neutralOpposite} />
                            <Text style={{color: searchType == 'location' ? colors.secondaryAccent : colors.neutralOpposite, fontSize: 16}}>Locations</Text>
                        </Pressable>
                        <Pressable 
                            style={[styles.dropdownSelection, {backgroundColor: searchType == 'station' ? `${colors.secondaryAccent}50` : ''}]}
                            onPress={() => {
                                setSearchType('station');
                                setSearchTypeDropdownOpen(false);
                            }}
                        >
                            <Ionicons name={searchType == 'station' ? 'train' : 'train-outline'} size={20} color={searchType == 'station' ? colors.secondaryAccent : colors.neutralOpposite} />
                            <Text style={{color: searchType == 'station' ? colors.secondaryAccent : colors.neutralOpposite, fontSize: 16}}>Stations</Text>
                        </Pressable>
                    </View>
                </FloatingBox>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
        gap: 10,
    },
    searchBar: {
        flexDirection: 'row',
        flex: 1,
        gap: 8,
        borderRadius: 8,
        padding: 10,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    input: {
        fontSize: 20,
        fontWeight: '400',
        height: '100%',
        flex: 1,
        overflow: 'hidden',
    },
    dropdownContainer: {
        flexDirection: 'column',
        gap: 4
    },
    dropdownSelection: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 8,
        gap: 4,
        borderRadius: 8
    }
}); 