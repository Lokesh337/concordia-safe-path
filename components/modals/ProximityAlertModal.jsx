import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import {SEVERITY_RADIUS} from "../../constants/Incidents";
import {useRouter} from "expo-router";

export default function ProximityAlertModal({ visible, incident, stage, onClose }) {
    const isUrgent = stage === 2;
    const router = useRouter()

    const distanceDisplay = SEVERITY_RADIUS[incident?.severity] + (stage === 1 ? 200 : 0);
    // drives both copy and color — keeps the jsx clean, onClose just calls dismissAlert() no args needed
    const config = {
        backgroundColor: isUrgent ? Colors.severity.high : '#F59E0B',
        title: isUrgent ? '⚠️ Incident Nearby' : '📍 Heads Up',
        message: isUrgent
            ? `You are inside the affected zone for a ${incident?.severity} severity incident.`
            : `There is an active incident within ${distanceDisplay}m of your location.`,
    };

    return (
        // transparent so the map is still visible behind the overlay
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.overlay}>
                {/* left border color changes with stage — visual severity cue */}
                <View style={[styles.card, { borderColor: config.backgroundColor }]}>
                    <Text style={[styles.title, { color: config.backgroundColor }]}>
                        {config.title}
                    </Text>
                    {/* capitalize first letter of incident type */}
                    <Text style={styles.type}>
                        {incident?.type?.charAt(0).toUpperCase() + incident?.type?.slice(1)}
                    </Text>
                    <Text style={styles.message}>{config.message}</Text>
                    <Text style={styles.location}>{incident?.location}</Text>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: config.backgroundColor }]}
                        onPress={() => {
                            // navigate to map with incident id as param, then dismiss
                            router.push({ pathname: '/map', params: { alertIncidentId: incident?.id } });
                            onClose();
                        }}
                    >
                        <Text style={styles.buttonText}>View on Map</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: config.backgroundColor }]}
                        onPress={onClose}
                    >
                        <Text style={styles.buttonText}>Dismiss</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    // dim the map but don't block it entirely
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    // slides up from bottom so it doesn't cover the full screen
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        borderLeftWidth: 6,
        margin: 16,
        marginBottom: 32,
        padding: 20,
        gap: 8,
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
    },
    type: {
        fontSize: 15,
        fontWeight: '600',
        color: '#111',
    },
    message: {
        fontSize: 14,
        color: '#444',
    },
    location: {
        fontSize: 13,
        color: '#888',
    },
    button: {
        marginTop: 8,
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
});