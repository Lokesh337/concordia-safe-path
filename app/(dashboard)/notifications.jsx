import { StyleSheet, FlatList } from 'react-native'
import ThemedView from '../../components/ThemedView'
import ThemedText from '../../components/ThemedText'
import ThemedCard from '../../components/ThemedCard'
import Spacer from '../../components/Spacer'

const MOCK_NOTIFICATIONS = [
    { id: '1', title: 'New Incident Reported', body: 'A protest was reported near Hall Building', time: '2m ago' },
    { id: '2', title: 'Incident Resolved', body: 'Construction on EV Building has been resolved', time: '1h ago' },
    { id: '3', title: 'New Incident Reported', body: 'Emergency reported near MB Building', time: '3h ago' },
]

const Notifications = () => {
    return (
        <ThemedView style={[styles.container, {margin: 0, padding:0}]} safe={true}>
            <ThemedText title={true} style={styles.heading}>Notifications</ThemedText>
            <Spacer />

            <FlatList
                data={MOCK_NOTIFICATIONS}
                keyExtractor={(item) => item.id}
                ListEmptyComponent={
                    <ThemedText style={styles.empty}>No notifications yet.</ThemedText>
                }
                renderItem={({ item }) => (
                    <ThemedCard style={styles.card}>
                        <ThemedView style={styles.row}>
                            <ThemedText style={styles.title}>{item.title}</ThemedText>
                            <ThemedText style={styles.time}>{item.time}</ThemedText>
                        </ThemedView>
                        <ThemedText style={styles.body}>{item.body}</ThemedText>
                    </ThemedCard>
                )}
            />
        </ThemedView>
    )
}

export default Notifications

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'stretch',
    },
    heading: {
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
    },
    card: {
        marginHorizontal: '5%',
        marginVertical: 6,
        padding: 14,
        gap: 6,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'transparent',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    time: {
        fontSize: 12,
        opacity: 0.5,
    },
    body: {
        fontSize: 13,
        opacity: 0.7,
    },
    empty: {
        textAlign: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
})