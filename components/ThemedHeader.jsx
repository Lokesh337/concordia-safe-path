import {TouchableOpacity, View, StyleSheet, useColorScheme} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import {Colors} from "../constants/Colors";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import ThemedDrawer from './modals/ThemedDrawer'
import {useState} from "react";
import {usePathname, useRouter} from "expo-router";
import ThemedText from "./ThemedText";

const PAGE_TITLES = {
    '/incidents': 'Incidents',
    '/map': 'Campus Map',
    '/profile': 'Profile',
    '/notifications': 'Notifications',
    '/create': 'Report Incident',
    '/menu/preferences': 'Preferences',
    '/menu/resources': 'Emergency Resources',
    '/menu/profile': 'Profile',
    '/routes': 'Safe Routes',
}

const ThemedHeader = () => {
    const colorScheme = useColorScheme()
    const insets = useSafeAreaInsets()
    const [drawerOpen, setDrawerOpen] = useState(false)

    const theme = Colors[colorScheme] ?? Colors.light
    const router = useRouter()
    const pathname = usePathname()

    const title = PAGE_TITLES[pathname] ??
        (pathname.startsWith('/incidents/') ? 'Incident Detail' : '');
    return (
        <View style={[
            styles.header,
            {
                backgroundColor: theme.navBackground,
                // backgroundColor: 'blue',
                paddingTop: insets.top + 10,
                // paddingBottom: 10,
            }
        ]}>
            <TouchableOpacity onPress={() => setDrawerOpen(true)}>
                <Ionicons name="menu" size={26} color={theme.title} />
            </TouchableOpacity>
            <ThemedDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />

            <ThemedText title={true} style={styles.headerTitle}>{title}</ThemedText>

            <TouchableOpacity onPress={() => router.push('/notifications')}>
                <Ionicons name="notifications-outline" size={26} color={theme.title} />
            </TouchableOpacity>
        </View>
    )
}

export default ThemedHeader

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: 'black'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
})