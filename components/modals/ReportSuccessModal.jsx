import { Modal, View, Pressable, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import ThemedText from '../ThemedText'

const ReportSuccessModal = ({ visible, onContinue }) => (
    <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onContinue}
    >
        <View style={styles.overlay}>
            <View style={styles.card}>
                <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={32} color={Colors.primary} />
                </View>
                <ThemedText style={styles.title}>
                    Report submitted!{'\n'}Thank you
                </ThemedText>
                <Pressable style={styles.continueBtn} onPress={onContinue}>
                    <Text style={styles.continueBtnText}>Continue home</Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors.primaryDark} />
                </Pressable>
            </View>
        </View>
    </Modal>
)

export default ReportSuccessModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '80%',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: Colors.primary,
        backgroundColor: '#fff',
        padding: 32,
        alignItems: 'center',
        gap: 20,
    },
    checkCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 2,
        borderColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        color: Colors.primary,
    },
    continueBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderWidth: 1,
        borderColor: Colors.primaryDark,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginTop: 8,
    },
    continueBtnText: {
        color: Colors.primaryDark,
        fontWeight: '600',
        fontSize: 14,
    },
})