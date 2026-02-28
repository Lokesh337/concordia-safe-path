import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useColorScheme } from 'react-native'
import { Colors } from '../../constants/Colors'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'
import { Ionicons } from '@expo/vector-icons'

const RolePickerModal = ({ visible, onSelect }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <ThemedView style={styles.card}>

                    <ThemedText style={styles.title}>Are you a</ThemedText>

                    <TouchableOpacity
                        style={[styles.option, { backgroundColor: theme.tint }]}
                        onPress={() => onSelect('student')}
                    >
                        <Ionicons name="school-outline" size={18} color="#fff" />
                        <ThemedText style={styles.optionText}>Student</ThemedText>
                    </TouchableOpacity>

                    <ThemedText style={styles.or}>or</ThemedText>

                    <TouchableOpacity
                        style={[styles.option, { backgroundColor: theme.tint }]}
                        onPress={() => onSelect('staff')}
                    >
                        <Ionicons name="shield-outline" size={18} color="#fff" />
                        <ThemedText style={styles.optionText}>Staff</ThemedText>
                    </TouchableOpacity>

                </ThemedView>
            </View>
        </Modal>
    )
}

export default RolePickerModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    card: {
        width: '100%',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        gap: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 8,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
        paddingVertical: 14,
        borderRadius: 10,
    },
    optionText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    or: {
        opacity: 0.5,
        fontSize: 13,
    },
})