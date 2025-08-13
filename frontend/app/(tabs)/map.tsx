import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, TouchableOpacity, Text } from 'react-native';
//Components
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileButton } from '@/components/ProfileButton';
import { SearchButton } from '@/components/SearchButton';
import { LocationModal } from '@/components/LocationModal';
import { Ionicons } from '@expo/vector-icons';
import { Animated } from 'react-native';
//Contexts
import { useThemeContext } from '@/context/ThemeContext';
import { useLocation } from '@/context/LocationContext';
import { useSearchContext } from '@/context/SearchContext';
//Maps/Subway
import { markers } from '@/assets/markers';
import { LINE_COLORS } from '@/assets/subway-lines';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Polyline } from 'react-native-maps';
//Routing/URLs
import { useLocalSearchParams, useRouter } from 'expo-router';


const initialRegion = {
  latitude: 40.7535,
  longitude: -73.9830,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

// Custom map style to remove unnecessary visual elements
const mapStyle = [
  {
    "featureType": "all",
    "elementType": "labels.text.fill",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "all",
    "elementType": "labels.text.stroke",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "all",
    "elementType": "labels.icon",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "landscape",
    "elementType": "geometry",
    "stylers": [{ "visibility": "simplified" }]
  },
  {
    "featureType": "poi",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry",
    "stylers": [{ "visibility": "simplified" }]
  },
  {
    "featureType": "transit",
    "stylers": [{ "visibility": "off" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "visibility": "simplified" }]
  }
];

export default function Map() {
    const mapRef = useRef<MapView>(null);
    const [selectedStation, setSelectedStation] = useState<string | null>(null);
    const { colors, colorScheme } = useThemeContext();
    const { userLocation } = useLocation();
    const { selectedLocation, clearSelectedLocation } = useSearchContext();
    const [subwayShapes, setSubwayShapes] = useState<Record<string, { lat: number; lon: number }[][]>>({});
    const router = useRouter();

    // Fetch subway shapes from backend
    useEffect(() => {
        const fetchShapes = async () => {
            try {
                const response = await fetch(`http://${process.env.EXPO_PUBLIC_API_IP}/transit/shapes`);
                if (!response.ok) throw new Error('Failed to fetch subway shapes');
                const data = await response.json();
                setSubwayShapes(data);
            } catch (err) {
                console.error('Error fetching subway shapes:', err);
            }
        };
        fetchShapes();
    }, []);

    // Focus map on search params or user location when it becomes available
    useEffect(() => {
        if (mapRef.current) {
            if (selectedLocation) {
                const newRegion = {
                    latitude: Number(selectedLocation.lat),
                    longitude: Number(selectedLocation.lng),
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                focusMap(newRegion)
            }
            else if (userLocation) {
                const newRegion = {
                    latitude: userLocation.lat,
                    longitude: userLocation.lng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                };
                focusMap(newRegion);
            }
            else focusMap(initialRegion);
        }
    }, [userLocation, selectedLocation]);

    const focusMap = (region: Region) => {
        if (mapRef.current) {
            mapRef.current.animateToRegion(region, 1000);
        }
    };

    const onMarkerSelected = (marker: any) => {
    };

    const onRegionChange = () => {
        focusMap(initialRegion);
    };

    return (
        <View style={styles.container}>
            <View style={styles.topButtons}>
                <ThemeToggle />
                <ProfileButton />
            </View>
            <MapView
                style={styles.map}
                initialRegion={initialRegion}
                customMapStyle={mapStyle}
                showsUserLocation={!!userLocation}
                showsMyLocationButton={!!userLocation}
                showsCompass={false}
                showsScale={false}
                showsBuildings={false}
                showsTraffic={false}
                showsIndoors={false}
                showsPointsOfInterest={false}
                userInterfaceStyle={colorScheme}
                ref={mapRef}
            >
                {/* Render all station markers */}
                {markers.map((marker) => (
                  <Marker
                    key={marker.station_id}
                    coordinate={{
                      latitude: parseFloat(marker.latitude),
                      longitude: parseFloat(marker.longitude),
                    }}
                    title={marker.station_name}
                    onPress={() => setSelectedStation(marker.station_id)}
                  />
                ))}
                {/* Render all subway lines from GTFS shapes, using per-line color */}
                {Object.entries(subwayShapes).map(([line, shapes], i) => (
                    shapes.map((shape, j) => (
                        <Polyline
                            key={`${line}-${j}`}
                            coordinates={shape.map(pt => ({ latitude: pt.lat, longitude: pt.lon }))}
                            strokeColor={LINE_COLORS[line] || '#000000'}
                            strokeWidth={6}
                            zIndex={i + 1}
                            tappable={true}
                        />
                    ))
                ))}
                {/* Keep the test marker for reference */}
                <Marker coordinate={{ latitude: 40.7128, longitude: -74.0060 }} title="Test Marker" />
            </MapView>
            <View style={styles.searchContainer}>
                <SearchButton />
            </View>
            <LocationModal location={selectedLocation}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    topButtons: {
        position: 'absolute',
        top: 60,
        left: 20,
        right: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        zIndex: 1,
    },
    searchContainer: {
        position: 'absolute',
        bottom: 105,
        left: 20,
        right: 20,
        flex: 1,
        alignItems: 'center'
    },
    map: {
        width: '100%',
        height: '100%',
    },
    lineToggleContainer: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 2,
        backgroundColor: '#fff',
        zIndex: 2,
        borderBottomWidth: 1,
        borderColor: '#eee',
    },
    lineMenuButton: {
        marginLeft: 10,
        padding: 4,
        backgroundColor: '#f2f2f2',
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
}); 