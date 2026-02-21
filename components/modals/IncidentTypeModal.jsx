import { View, Modal, TouchableWithoutFeedback, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import ThemedText from './../ThemedText'

const TYPES = [
    { value: 'protest', label: 'Protest', icon: 'megaphone-outline' },
    { value: 'construction', label: 'Construction', icon: 'construct-outline' },
    { value: 'emergency', label: 'Emergency', icon: 'alert-circle-outline' },
]

const IncidentTypeModal = ({ visible, onClose, onSelect }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <Modal visible={visible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.overlay}>
                    <TouchableWithoutFeedback>
                        <View style={[styles.container, { backgroundColor: theme.navBackground }]}>
                            <ThemedText title={true} style={styles.heading}>What are you reporting?</ThemedText>

                            {TYPES.map((type) => (
                                <TouchableOpacity
                                    key={type.value}
                                    style={[styles.card, { backgroundColor: theme.uiBackground }]}
                                    onPress={() => onSelect(type.value)}
                                >
                                    <Ionicons name={type.icon} size={24} color={Colors.primary} />
                                    <ThemedText style={styles.label}>{type.label}</ThemedText>
                                    <Ionicons name="chevron-forward" size={18} color={theme.text} style={styles.arrow} />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default IncidentTypeModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: '#00000066',
        justifyContent: 'flex-end',
    },
    container: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 24,
        gap: 12,
    },
    heading: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 14,
    },
    label: {
        fontSize: 16,
        flex: 1,
    },
    arrow: {
        opacity: 0.4,
    },
})