import { Modal, View, Pressable, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import ThemedText from '../ThemedText'

const AMBER = '#F7B023'

const EmergencyNotifiedModal = ({ visible, onClose }) => (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
    >
        <View style={styles.overlay}>
            <View style={styles.card}>
                {/* corner dots */}
                <View style={[styles.dot, { top: 12, left: 12 }]} />
                <View style={[styles.dot, { top: 12, right: 12 }]} />
                <View style={[styles.dot, { bottom: 12, left: 12 }]} />
                <View style={[styles.dot, { bottom: 12, right: 12 }]} />

                <View style={styles.iconCircle}>
                    <Ionicons name="volume-high" size={32} color={AMBER} />
                </View>

                <ThemedText style={styles.title}>
                    Your emergency contacts{'\n'}have been notified
                </ThemedText>

                <ThemedText style={styles.body}>
                    Please stay safe and follow any instructions from emergency responders.
                </ThemedText>

                <Pressable style={styles.okayBtn} onPress={onClose}>
                    <Text style={styles.okayText}>Okay</Text>
                </Pressable>
            </View>
        </View>
    </Modal>
)

export default EmergencyNotifiedModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '82%',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: AMBER,
        backgroundColor: '#fff',
        padding: 32,
        alignItems: 'center',
        gap: 16,
    },
    dot: {
        position: 'absolute',
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#59A7E7',
    },
    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 2,
        borderColor: AMBER,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: AMBER,
    },
    body: {
        fontSize: 14,
        textAlign: 'center',
        color: '#555',
        lineHeight: 20,
    },
    okayBtn: {
        backgroundColor: AMBER,
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 48,
        marginTop: 4,
        width: '100%',
        alignItems: 'center',
    },
    okayText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
})