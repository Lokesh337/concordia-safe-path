import { View, Modal, TouchableWithoutFeedback, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import ThemedText from './../ThemedText'

const TYPES = [
    { value: 'protest', label: 'Protest', icon: 'megaphone', color: '#e74c3c' },
    { value: 'construction', label: 'Construction', icon: 'construct', color: '#f39c12' },
    { value: 'blockade', label: 'Road Blockage', icon: 'ban', color: '#27ae60' },
    { value: 'vandalism', label: 'Vandalism', icon: 'hammer', color: '#8e44ad' },
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
                            <ThemedText title={true} style={styles.heading}>Select the Type of Incident</ThemedText>

                            <View style={styles.grid}>
                                {TYPES.map((type) => (
                                    <TouchableOpacity
                                        key={type.value}
                                        style={styles.item}
                                        onPress={() => onSelect(type.value)}
                                    >
                                        <View style={[styles.iconBox, { backgroundColor: type.color }]}>
                                            <Ionicons name={type.icon} size={36} color="#fff" />
                                        </View>
                                        <ThemedText style={styles.label}>{type.label}</ThemedText>
                                    </TouchableOpacity>
                                ))}
                            </View>
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingBottom: 40,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 16,
    },
    item: {
        width: '45%',
        alignItems: 'center',
        gap: 10,
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        textAlign: 'center',
    },
})