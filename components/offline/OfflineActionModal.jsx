/**
 * OfflineActionModal — shown when an offline user attempts a restricted action
 * (creating incidents, upvoting, etc.)
 */

import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'

const OfflineActionModal = ({ visible, onClose }) => {
    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} accessibilityViewIsModal={true}>
            <View style={styles.overlay}>
                <View style={styles.card}>

                    <View style={styles.iconCircle}>
                        <Ionicons name="cloud-offline-outline" size={30} color={Colors.primary} />
                    </View>

                    <Text style={styles.title}>You're offline</Text>

                    <Text style={styles.message}>
                        This action requires an internet connection. Please reconnect and try again.
                    </Text>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>Okay</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    )
}

export default OfflineActionModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 28,
        alignItems: 'center',
        width: '100%',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: Colors.attention,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        color: Colors.attention,
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 12,
    },
    message: {
        color: '#555',
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    button: {
        backgroundColor: Colors.attention,
        borderRadius: 30,
        paddingVertical: 14,
        width: '100%',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
})