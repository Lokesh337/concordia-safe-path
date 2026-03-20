import {Tabs, usePathname, useRouter} from "expo-router"
import {TouchableOpacity, useColorScheme, StyleSheet } from "react-native"
import { Colors } from "../../constants/Colors"
import { Ionicons} from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly";
import ThemedHeader from "../../components/ThemedHeader";
import { useUser } from "../../hooks/useUser";
import ThemedView from "../../components/ThemedView";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import IncidentTypeModal from "../../components/modals/IncidentTypeModal";
import {useState} from "react";
import OfflineBanner from "../../components/offline/OfflineBanner";

import { useIncidents } from "../../hooks/useIncidents";
import { useProximityAlerts } from "../../hooks/useProximityAlerts";
import ProximityAlertModal from "../../components/modals/ProximityAlertModal";
import LocationWakeup from "../../components/LocationWakeup";
import {useNotifications} from "../../hooks/useNotifications";

export default function DashboardLayout() {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const [typeModalOpen, setTypeModalOpen] = useState(false)
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const pathname = usePathname()
    const { profile } = useUser()

    const { incidents } = useIncidents();
    const activeIncidents = incidents.filter(i => i.status === 'active' && i.latitude && i.longitude);
    const { sendProximityNotification, resetNotification } = useNotifications();
    const { activeAlert, dismissAlert } = useProximityAlerts(activeIncidents, sendProximityNotification, resetNotification);

    // hide header/tabs when user is on preferences for the first time
    const isOnboarding = pathname === '/menu/preferences' && !profile?.preferences_completed
    return (
        <UserOnly>
            <ThemedView style={{ flex: 1 }}>
                <ThemedHeader />
                <OfflineBanner />
                <Tabs
                    screenOptions={({ route }) => ({
                        headerShown: false,
                        // tabBarStyle: { backgroundColor: 'blue', paddingTop: TAB_BAR_PADDING_TOP, height: insets.bottom + 65},
                        tabBarStyle: isOnboarding ? { display: 'none' } : { backgroundColor: theme.navBackground, height: 100 },
                        tabBarActiveTintColor: theme.iconColorFocused,
                        tabBarInactiveTintColor: theme.iconColor,
                        tabBarItemStyle: {
                            borderTopWidth: 3,
                            paddingTop: 10,
                            borderTopColor: pathname === `/${route.name}` ? theme.iconColorFocused : 'transparent',
                        },
                    })}
                >
                    <Tabs.Screen
                        name="incidents"
                        options={{
                            title: "Incidents",
                            tabBarIcon: ({focused}) => (
                                <Ionicons
                                    size={30}
                                    name={focused ? 'list': 'list-outline'}
                                    color={focused ? theme.iconColorFocused : theme.iconColor}
                                />
                            ) }}
                    />
                    <Tabs.Screen
                        name="menu/resources"
                        options={{
                            title: "Resources",
                            tabBarItemStyle: {
                                borderTopWidth: 3,
                                paddingTop: 10,
                                borderTopColor: pathname === '/menu/resources' ? theme.iconColorFocused : 'transparent',
                            },
                            tabBarIcon: ({focused}) => (
                                <Ionicons name="medkit" size={30} color={focused ? theme.iconColorFocused : theme.iconColor} />
                            ),
                        }}
                    />
                    <Tabs.Screen
                        name="create"
                        options={{
                            title: "Report",
                            tabBarItemStyle: {
                                borderTopWidth: 3,
                                paddingTop: 10,
                                borderTopColor: pathname === '/create' ? theme.iconColorFocused : 'transparent',
                            },
                            tabBarIcon: ({focused}) => (
                                <Ionicons name="warning" size={30} color={focused ? theme.iconColorFocused : theme.iconColor} />
                            ),
                        }}
                        listeners={{
                            tabPress: (e) => {
                                e.preventDefault()
                                setTypeModalOpen(true)
                            },
                        }}
                    />
                    <Tabs.Screen
                        name="map"
                        options={{
                            title: "Map",
                            tabBarIcon: ({ focused }) => (
                                <Ionicons
                                    size={30}
                                    name={focused ? 'map' : 'map-outline'}
                                    color={focused ? theme.iconColorFocused : theme.iconColor}
                                />
                            )
                        }}
                    />


                    <Tabs.Screen
                        name="incidents/[id]"
                        options={{ href: null }}
                    />
                    <Tabs.Screen
                        name="menu/preferences"
                        options={{ href: null }}
                    />
                    <Tabs.Screen
                        name="menu/profile"
                        options={{ href: null }}
                    />

                    <Tabs.Screen
                        name="notifications"
                        options={{ href: null }}
                    />
                    <Tabs.Screen
                        name="routes"
                        options={{ href: null }}
                    />
                </Tabs>
                <IncidentTypeModal
                    visible={typeModalOpen}
                    onClose={() => setTypeModalOpen(false)}
                    onSelect={(type) => {
                        setTypeModalOpen(false)
                        router.push({ pathname: '/create', params: { type } })
                    }}
                />
                <ProximityAlertModal
                    visible={!!activeAlert}
                    incident={activeAlert?.incident}
                    stage={activeAlert?.stage}
                    onClose={dismissAlert}
                />
                <LocationWakeup/>
            </ThemedView>
        </UserOnly>
    )
}
const styles = StyleSheet.create({
    emergencyFab: {
        position: 'absolute',
        bottom: 120, // sits above the tab bar
        right: 30,
        width: 65,
        height: 65,
        borderRadius: 30,
        backgroundColor: Colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    createFab: {
        position: 'absolute',
        bottom: 210,
        right: 30,
        width: 65,
        height: 65,
        borderRadius: 30,
        backgroundColor: Colors.primaryDark,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5, // android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
})