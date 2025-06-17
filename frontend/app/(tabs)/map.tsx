import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region, Polyline } from 'react-native-maps';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ProfileButton } from '@/components/ProfileButton';
import { SearchBar } from '@/components/SearchButton';
import { useThemeContext } from '@/context/ThemeContext';
import { markers } from '@/assets/markers';
import { LINE_COLORS, SUBWAY_LINES } from '@/assets/subway-lines';
import * as Location from 'expo-location';

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
    const [userLocation, setUserLocation] = useState<Region | null>(null);
    const { colors, colorScheme } = useThemeContext();

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Location permission is required to show your current location.');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
            };
            setUserLocation(newRegion);
            focusMap(newRegion);
        })();
    }, []);

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
                showsUserLocation={true}
                showsMyLocationButton={true}
                showsCompass={false}
                showsScale={false}
                showsBuildings={false}
                showsTraffic={false}
                showsIndoors={false}
                showsPointsOfInterest={false}
                userInterfaceStyle={colorScheme}
                ref={mapRef}
            >
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

                {Object.entries(SUBWAY_LINES).map(([line, stops], i) => (
                    <Polyline
                        key={line}
                        coordinates={stops.map(stop => ({
                            latitude: parseFloat(stop.latitude),
                            longitude: stop.longitude
                        }))}
                        strokeColor={LINE_COLORS[line] || '#000000'}
                        strokeWidth={6}
                        zIndex={i + 1}
                        tappable={true}
                    />
                ))}
            </MapView>
            <View style={styles.searchContainer}>
                <SearchBar />
            </View>
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
}); 