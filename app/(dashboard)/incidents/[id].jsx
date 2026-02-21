import {StyleSheet, Text} from 'react-native'
import {router, useLocalSearchParams, useRouter} from "expo-router";
import {useEffect, useState} from "react";

//themed
import ThemedText from "../../../components/ThemedText";
import ThemedButton from "../../../components/ThemedButton";
import ThemedView from "../../../components/ThemedView";
import Spacer  from "../../../components/Spacer";
import ThemedCard from "../../../components/ThemedCard";
import ThemedLoader from "../../../components/ThemedLoader";
import {Colors} from "../../../constants/Colors";
import {useIncidents} from "../../../hooks/useIncidents";

const IncidentDetails = () => {
    const [ incident, setIncident ] = useState(null);
    const { id } = useLocalSearchParams()
    const { fetchIncidentById } = useIncidents();
    const router = useRouter();

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

    // const handleDelete = async () => {
    //     await deleteBook(id);
    //     setBook(null);
    //     router.replace('/incidents')
    // }
    return (
        <ThemedView safe={true} style={styles.container}>
            <ThemedCard style={styles.card}>
                <ThemedText style={styles.title}>{incident.type}</ThemedText>
                <ThemedText>Location: {incident.location}</ThemedText>
                <Spacer/>
                <ThemedText title={true}>Incident description:</ThemedText>
                <Spacer height={10}/>
                <ThemedText>{incident.description}</ThemedText>
            </ThemedCard>
            {/*<ThemedButton onPress={handleDelete} style={styles.delete}>*/}
            {/*    <Text style={{ color: '#fff', textAlign: 'center' }}>*/}
            {/*        Delete Book*/}
            {/*    </Text>*/}
            {/*</ThemedButton>*/}
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