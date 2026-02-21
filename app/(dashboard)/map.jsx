import { useEffect, useRef, useState } from 'react'
import { StyleSheet } from 'react-native'
import MapView, {Marker} from 'react-native-maps'
import * as Location from 'expo-location'
import { useIncidents } from '../../hooks/useIncidents'


import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedLoader from '../../components/ThemedLoader'
import Spacer from '../../components/Spacer'

const STATIC_MARKERS = [
    { id: '1', title: 'Hall Building',        description: 'Main hub', latitude: 45.4972, longitude: -73.5789 },
    { id: '2', title: 'EV Building',          description: 'Engineering', latitude: 45.4957, longitude: -73.5780 },
    { id: '3', title: 'MB Building',          description: 'Business', latitude: 45.4942, longitude: -73.5795 },
    { id: '4', title: 'Library Building',     description: 'Webster Library', latitude: 45.4966, longitude: -73.5778 },
    { id: '5', title: 'GM Building',          description: 'Guy-Metro', latitude: 45.4948, longitude: -73.5772 },
]

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
        <ThemedView style={styles.container} safe={true}>
            <Spacer />
            <ThemedText title={true} style={styles.heading}>Campus Map</ThemedText>
            <Spacer />

            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                }}
                showsUserLocation={true}
                showsPointsOfInterest={false}
                showsBuildings={false}
                showsMyLocationButton={true}
                zoomControlEnabled={true}
            >
                {STATIC_MARKERS.map((marker) => (
                    <Marker
                        key={marker.id}
                        coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
                        title={marker.title}
                        description={marker.description}
                    />
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
})