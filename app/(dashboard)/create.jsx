import { StyleSheet, Text, TouchableWithoutFeedback, Keyboard, ScrollView } from 'react-native'
import { useRouter, useLocalSearchParams } from 'expo-router'

import { useEffect, useState } from 'react'
import MapView, { Marker } from 'react-native-maps'
import * as Location from 'expo-location'

// themed components
import ThemedView from "../../components/ThemedView"
import ThemedText from "../../components/ThemedText"
import ThemedTextInput from "../../components/ThemedTextInput"
import ThemedButton from '../../components/ThemedButton'
import Spacer from '../../components/Spacer'
import {useIncidents} from "../../hooks/useIncidents";
import ThemedDropdown from "../../components/ThemedDropdown";
import ThemedLoader from "../../components/ThemedLoader";

const SEVERITY_OPTIONS = [
    { label: '🟢 Low',    value: 'low' },
    { label: '🟠 Medium', value: 'medium' },
    { label: '🔴 High',   value: 'high' },
]

const TYPE_OPTIONS = [
    { label: '✊ Protest',      value: 'protest' },
    { label: '🚧 Construction', value: 'construction' },
    { label: '🚨 Emergency',    value: 'emergency' },
]

const Create = () => {
    const { type: initialType } = useLocalSearchParams()

    const [type, setType] = useState(initialType || '')
    const [severity, setSeverity] = useState("")
    const [description, setDescription] = useState("")


    const [userCoords, setUserCoords] = useState(null)
    const [pin, setPin] = useState(null)

    const [loading, setLoading] = useState(false)


    const { createIncident } = useIncidents()
    const router = useRouter()

    useEffect(() => {
        async function getLocation() {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') return
            const current = await Location.getCurrentPositionAsync({})
            setUserCoords(current.coords)
        }
        getLocation()
    }, [])

    async function handleSubmit() {
        if (!type.trim() || !severity.trim() || !description.trim() || !pin) return

        setLoading(true)

        await createIncident({ type, description, severity, latitude: pin.latitude, longitude: pin.longitude })

        setType("")
        setSeverity("")
        setDescription("")
        setPin(null)

        router.replace("/incidents")
        setLoading(false)
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ScrollView contentContainerStyle={styles.scroll}>
                <ThemedView style={styles.container}>
                    <Spacer height={20}/>
                    <ThemedText title={true} style={styles.heading}>
                        Report an Incident
                    </ThemedText>
                    <Spacer height={10}/>

                    <ThemedDropdown
                        style={styles.input}
                        placeholder="Incident Type"
                        value={type}
                        options={TYPE_OPTIONS}
                        onSelect={setType}
                    />

                    <Spacer height={10}/>

                    <ThemedDropdown
                        style={styles.input}
                        placeholder="Incident Severity"
                        value={severity}
                        options={SEVERITY_OPTIONS}
                        onSelect={setSeverity}
                    />
                    <Spacer height={10}/>

                    <ThemedTextInput
                        style={styles.multiline}
                        placeholder="Incident Description"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                    />

                    <Spacer height={6} />
                    {pin
                        ? <ThemedText style={styles.pinConfirm}>📍 Pin placed</ThemedText>
                        : <ThemedText style={styles.pinHint}>Tap the map to place a pin</ThemedText>
                    }
                    <Spacer height={6} />

                    <ThemedView style={styles.mapContainer}>
                        {!userCoords && <ThemedLoader />}
                        {userCoords && (
                            <MapView
                                style={styles.map}
                                initialRegion={{
                                    latitude: userCoords.latitude,
                                    longitude: userCoords.longitude,
                                    latitudeDelta: 0.005,
                                    longitudeDelta: 0.005,
                                }}
                                showsUserLocation={true}
                                showsPointsOfInterest={false}
                                showsBuildings={false}
                                showsTraffic={false}
                                showsIndoors={false}
                                showsCompass={false}
                                toolbarEnabled={false}
                                onPress={(e) => setPin(e.nativeEvent.coordinate)}
                            >
                                {pin && (
                                    <Marker
                                        coordinate={pin}
                                        draggable
                                        onDragEnd={(e) => setPin(e.nativeEvent.coordinate)}
                                    />
                                )}
                            </MapView>
                        )}
                    </ThemedView>

                    <ThemedButton onPress={handleSubmit} disabled={loading || !pin}>
                        <Text style={{ color: '#fff' }}>
                            {loading ? "Saving..." : !pin ? "Drop a Pin First" : "Report Incident"}
                        </Text>
                    </ThemedButton>

                </ThemedView>
            </ScrollView>
        </TouchableWithoutFeedback>
    )
}

export default Create

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
    },
    heading: {
        fontWeight: "bold",
        fontSize: 18,
        textAlign: "center",
    },
    input: {
        padding: 20,
        borderRadius: 6,
        alignSelf: 'stretch',
        marginHorizontal: 40,
    },
    multiline: {
        padding: 20,
        borderRadius: 6,
        minHeight: 100,
        alignSelf: 'stretch',
        marginHorizontal: 40,
    },
    scroll: {
        flexGrow: 1,
    },
    label: {
        alignSelf: 'flex-start',
        marginLeft: 40,
        marginBottom: 6,
        fontWeight: '600',
        opacity: 0.7,
    },
    mapContainer: {
        width: '90%',
        height: 200,
        borderRadius: 10,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    pinHint: {
        opacity: 0.5,
        fontSize: 13,
    },
    pinConfirm: {
        color: '#4caf50',
        fontSize: 13,
    },
})