import { useEffect, useRef, useState } from 'react'
import {StyleSheet, View} from 'react-native'
import MapView, {Marker} from 'react-native-maps'
import * as Location from 'expo-location'
import { useIncidents } from '../../hooks/useIncidents'
import {CONCORDIA_BUILDINGS} from "../../constants/Buildings";

import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedLoader from '../../components/ThemedLoader'


const Map = () => {
    const [location, setLocation] = useState(null)
    const [error, setError] = useState(null)
    const mapRef = useRef(null)
    const { incidents } = useIncidents()

    useEffect(() => {
        async function getLocation() {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') {
                setError('Location permission denied')
                return
            }
            const current = await Location.getCurrentPositionAsync({})
            setLocation(current.coords)
        }
        getLocation()
    }, [])

    if (error) {
        return (
            <ThemedView style={styles.center}>
                <ThemedText>{error}</ThemedText>
            </ThemedView>
        )
    }

    if (!location) {
        return (
            <ThemedView style={styles.center}>
                <ThemedLoader />
            </ThemedView>
        )
    }

    return (
        <ThemedView style={[styles.container, {padding: 0}]} safe={true}>

            <MapView
                ref={mapRef}
                style={[styles.map, StyleSheet.absoluteFillObject]}
                initialRegion={{
                    latitude: 45.4948,
                    longitude: -73.5772,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsPointsOfInterest={false}
                showsBuildings={false}
                showsMyLocationButton={true}
                zoomControlEnabled={true}
            >
                {CONCORDIA_BUILDINGS.map((building) => (
                    <Marker
                        key={building.name}
                        coordinate={{ latitude: building.latitude, longitude: building.longitude }}
                        title={building.name}
                    >
                        <View style={styles.buildingMarker}>
                            <View style={styles.buildingMarkerInner} />
                        </View>
                    </Marker>
                ))}
                {incidents
                    .filter((i) => i.latitude && i.longitude)
                    .map((incident) => (
                        <Marker
                            key={incident.id}
                            coordinate={{ latitude: incident.latitude, longitude: incident.longitude }}
                            title={incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                            description={incident.location}
                            pinColor={
                                incident.severity === 'high' ? '#cc475a' :
                                    incident.severity === 'medium' ? '#ff9800' :
                                        '#4caf50'
                            }
                        />
                    ))
                }
            </MapView>
        </ThemedView>
    )
}

export default Map

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    buildingMarker: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#e74c3c',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#e74c3c',
    },
    buildingMarkerInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#fff',
    },
})