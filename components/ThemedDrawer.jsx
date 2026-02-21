import {
    Modal,
    TouchableWithoutFeedback,
    useColorScheme,
    View,
    StyleSheet,
} from 'react-native'
import {Colors} from "../constants/Colors";
import ThemedText from "./ThemedText";
import {useUser} from "../hooks/useUser";
import {Ionicons} from "@expo/vector-icons";
import ThemedMenuItem from "./ThemedMenuItem";
import {useRouter} from "expo-router";

const ThemedDrawer = ({ visible, onClose }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const { user, logout } = useUser()
    const router = useRouter()
    async function handleLogout() {
        onClose()
        await logout()
    }

    function navigate(path) {
        onClose()
        router.push(path)
    }

    return (
        <Modal visible={visible} transparent>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={{ flex: 1, backgroundColor: '#00000066' }}>
                    <TouchableWithoutFeedback>
                        <View style={{ width: 300, height: '100%', backgroundColor: theme.navBackground }}>
                            {/* Avatar */}
                            <View style={styles.userSection}>
                                <View style={[styles.avatar, { backgroundColor: Colors.primary }]}>
                                    <ThemedText style={styles.avatarText}>
                                        {user?.email?.[0].toUpperCase()}
                                    </ThemedText>
                                </View>
                                <ThemedText style={styles.email} numberOfLines={1}>
                                    {user?.email}
                                </ThemedText>
                                {/* Divider */}
                                <View style={styles.divider} />

                                {/* Profile */}
                                <ThemedMenuItem onPress={() => navigate('menu/profile')}>
                                    <Ionicons name="person-outline" size={22} color={theme.text} />
                                    <ThemedText style={{ color: theme.text, fontSize: 16 }}>Profile</ThemedText>
                                </ThemedMenuItem>


                                {/* Preferences */}
                                <ThemedMenuItem onPress={() => navigate('menu/preferences')}>
                                    <Ionicons name="options-outline" size={22} color={theme.text} />
                                    <ThemedText style={{ color: theme.text, fontSize: 16 }}>Preferences</ThemedText>
                                </ThemedMenuItem>

                                {/* Resources */}
                                <ThemedMenuItem onPress={() => navigate('menu/resources')}>
                                    <Ionicons name="options-outline" size={22} color={theme.text} />
                                    <ThemedText style={{ color: theme.text, fontSize: 16 }}>Emergency Resources</ThemedText>
                                </ThemedMenuItem>

                                {/* Logout */}
                                <ThemedMenuItem onPress={handleLogout}>
                                    <Ionicons name="log-out-outline" size={22} color={Colors.warning} />
                                    <ThemedText style={{ color: Colors.warning, fontSize: 16 }}>Logout</ThemedText>
                                </ThemedMenuItem>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    )
}

export default ThemedDrawer

const styles = StyleSheet.create({
    drawer: {
        width: 280,
        height: '100%',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    userSection: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 12,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
    },
    email: {
        fontSize: 14,
        opacity: 0.7,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: '#ffffff33',
        marginVertical: 10,
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
    },
    itemText: {
        fontSize: 16,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 16,
        borderRadius: 10,
        marginVertical: 4,
        marginHorizontal: 15,
        alignSelf: 'stretch',

    },
})