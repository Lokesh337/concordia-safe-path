import {View, TouchableOpacity, StyleSheet, useColorScheme, TouchableWithoutFeedback, Modal} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { Colors } from '../../constants/Colors'
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {useState} from "react";
import {useRouter} from "expo-router";

const SpeedDial = ({ paddingTop = 0 }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const insets = useSafeAreaInsets()
    const [open, setOpen] = useState(false)


    const router = useRouter()

    function handleEmergency() {
        setOpen(false)
        router.push('/menu/resources')
    }

    function safeRouteNow() {
        setOpen(false)
        router.push('/routes')
    }

    return (
        <>
            <Modal visible={open} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={() => setOpen(false)}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
                {/* Action buttons */}
                <View style={[styles.actionsContainer, { bottom: insets.bottom - paddingTop + 20 }]} >
                    {/* Left - lowest */}
                    <TouchableOpacity style={[styles.actionButton, { marginBottom: 15 }]} onPress={safeRouteNow}>
                        <Ionicons name="navigate-outline" size={30} color="#fff" />
                    </TouchableOpacity>

                    {/* Center - highest */}
                    <TouchableOpacity style={[styles.actionButton, { marginBottom: 65 }]} onPress={handleEmergency}>
                        <Ionicons name="alert-circle-outline" size={30} color="#fff" />
                    </TouchableOpacity>

                    {/* Right - lowest */}
                    <TouchableOpacity style={[styles.actionButton, { marginBottom: 15 }]}>
                        <Ionicons name="people-outline" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>

            </Modal>

            <View style={[styles.container, { bottom: insets.bottom - paddingTop }]}>
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: Colors.primary }]}
                    onPress={() => setOpen(!open)}
                >
                    <Ionicons name="warning" size={26} color="#fff" />
                </TouchableOpacity>
            </View>
        </>
    )
}

export default SpeedDial

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        alignSelf: 'center',
    },
    button: {
        width: 80,
        height: 100,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    overlay: {
        flex: 1,
        backgroundColor: Colors.overlay,
    },

    actionsContainer: {
        position: 'absolute',
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 25,
        alignItems: 'flex-end',

    },
    actionButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
})