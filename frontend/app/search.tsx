import { View, StyleSheet, TextInput, Pressable, Text, FlatList, Animated } from 'react-native';
import { useState, useCallback, useRef } from 'react';

import { getColors } from '@/constants/ThemeColors';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SearchResult } from '@/types';
import { SearchResultItem } from '@/components/SearchResultItem';

import { useLocation } from '@/context/LocationContext';
import { useThemeContext } from '@/context/ThemeContext';
import { useSearchContext } from '@/context/SearchContext';


type SearchType = 'location' | 'station';

export default function SearchScreen() {
    const { colors } = useThemeContext();
    const globalLight = getColors('light').neutral;
    const router = useRouter();
    const { userLocation } = useLocation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('location');
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const { setSelectedLocation } = useSearchContext();

    // Debounced search function
    const debouncedSearch = useCallback(
        debounce(async (query: string) => {
            if (!query.trim() || query.length < 2) {
                setSearchResults([]);
                return;
            }

            setIsSearching(true);
            try {
                const params = new URLSearchParams({ q: query });
                if (userLocation) {
                    params.append('lat', userLocation.lat.toString());
                    params.append('lng', userLocation.lng.toString());
                }

                const url = `http://${process.env.EXPO_PUBLIC_BACKEND_URL}/search/autocomplete?${params}`;
                
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                
                const response = await fetch(url, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);
                
                if (!response.ok) {
                    throw new Error(`Search failed with status: ${response.status}`);
                }

                const suggestions = await response.json();
                setSearchResults(suggestions);
            } catch (error) {
                console.error('Search error:', error);
                setSearchResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 300),
        [userLocation]
    );

    // Handle search query changes
    const handleSearchChange = (text: string) => {
        setSearchQuery(text);
        debouncedSearch(text);
    };

    // Handle result selection
    const handleResultSelect = async (result: SearchResult) => {
        const params = new URLSearchParams({ q: result.mapbox_id });

        try {
            const url = `http://${process.env.EXPO_PUBLIC_BACKEND_URL}/search/retrieve?${params.toString()}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Retrieval failed with status: ${response.status}`);
            }

            const data = await response.json()
            setSelectedLocation(data);

            router.push({ pathname: '/(tabs)/map' });
        } catch (error) {
            console.error(error);
        }
    };

    const onIconPress = () => {
        setSearchType(prev => prev === 'location' ? 'station' : 'location');
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
                        onChangeText={handleSearchChange}
                    />
                    <View style={{width: 1, height: 24, backgroundColor: colors.lightAccent}}/>
                    <Pressable 
                        onPress={onIconPress}
                        style={{position: 'relative'}}
                    >
                        <Ionicons name={searchType == 'location' ? 'location-outline' : 'train-outline'} size={30} color={globalLight} />
                    </Pressable>
                </View>
            </View>

            {/* Search Results */}
            {searchQuery.length > 0 && (
                <View style={styles.resultsContainer}>
                    {isSearching ? (
                        <View style={styles.loadingContainer}>
                            <Text style={[styles.loadingText, { color: colors.accent }]}>
                                Searching...
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={searchResults}
                            renderItem={({ item }) => (
                                <SearchResultItem 
                                    item={item} 
                                    onPress={handleResultSelect} 
                                />
                            )}
                            keyExtractor={(item) => item.mapbox_id}
                            style={styles.resultsList}
                            showsVerticalScrollIndicator={false}
                        />
                    )}
                </View>
            )}
        </View>
    );
}

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
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
    resultsContainer: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    resultsList: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    loadingText: {
        fontSize: 16,
        fontWeight: '500',
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
    },
    resultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        marginBottom: 8,
        borderRadius: 8,
    },
    pressable: {
        flex: 1,
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