import {StyleSheet} from 'react-native'
import { useLocalSearchParams, useRouter} from "expo-router";
import {useEffect, useState} from "react";

//themed
import ThemedText from "../../../components/ThemedText";
import ThemedView from "../../../components/ThemedView";
import Spacer  from "../../../components/Spacer";
import ThemedCard from "../../../components/ThemedCard";
import ThemedLoader from "../../../components/ThemedLoader";
import {Colors} from "../../../constants/Colors";
import {useIncidents} from "../../../hooks/useIncidents";
import {getNearestBuilding} from "../../../lib/helpers";

const IncidentDetails = () => {
    const [ incident, setIncident ] = useState(null);
    const { id } = useLocalSearchParams()
    const { fetchIncidentById } = useIncidents();

    useEffect(() => {
        async function loadIncident() {
            const incidentData = await fetchIncidentById(id)
            setIncident(incidentData)
        }
        loadIncident()
    }, [id]);

    if(!incident){
        return (
            <ThemedView safe={true} style={styles.container}>
                <ThemedLoader/>
            </ThemedView>
        )
    }

    return (
        <ThemedView safe={true} style={styles.container}>
            <ThemedCard style={styles.card}>
                <ThemedText style={styles.location}>
                    📍 {incident.latitude && incident.longitude
                    ? getNearestBuilding(incident.latitude, incident.longitude)
                    : 'Unknown location'}
                </ThemedText>
                <Spacer/>
                <ThemedText title={true}>Incident description:</ThemedText>
                <Spacer height={10}/>
                <ThemedText>{incident.description}</ThemedText>
            </ThemedCard>
        </ThemedView>
    )
}
export default IncidentDetails
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch'
    },
    title: {
        fontSize: 22,
        marginVertical: 10
    },
    card: {
        margin: 20
    },
    delete: {
        marginTop: 20,
        width: 200,
        backgroundColor: Colors.warning,
        alignSelf: 'center'
    }
})