import {Tabs, usePathname, useRouter} from "expo-router"
import {TouchableOpacity, useColorScheme, StyleSheet } from "react-native"
import { Colors } from "../../constants/Colors"
import { Ionicons} from "@expo/vector-icons";
import UserOnly from "../../components/auth/UserOnly";
import ThemedHeader from "../../components/ThemedHeader";
import ThemedView from "../../components/ThemedView";
import SpeedDial from "../../components/SpeedDial";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import IncidentTypeModal from "../../components/modals/IncidentTypeModal";
import {useState} from "react";

const TAB_BAR_PADDING_TOP = 10


export default function DashboardLayout() {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const [typeModalOpen, setTypeModalOpen] = useState(false)

    const router = useRouter()
    const insets = useSafeAreaInsets()
    const pathname = usePathname()


    return (
        <UserOnly>
            <ThemedView style={{ flex: 1 }}>
                <ThemedHeader />
                <Tabs
                    screenOptions={{
                        headerShown: false,
                        tabBarStyle: { backgroundColor: 'blue', paddingTop: TAB_BAR_PADDING_TOP, height: insets.bottom + 65},
                        // tabBarStyle: { backgroundColor: theme.navBackground, paddingTop: 10, height: 100 },
                        tabBarActiveTintColor: theme.iconColorFocused,
                        tabBarInactiveTintColor: theme.iconColor,
                    }}
                >
                    {/*<Tabs.Screen*/}
                    {/*    name="profile"*/}
                    {/*    options={{ title: "Profile", tabBarIcon: ({focused}) => (*/}
                    {/*            <Ionicons*/}
                    {/*                size={24}*/}
                    {/*                name={focused ? 'person': 'person-outline'}*/}
                    {/*                color={focused ? theme.iconColorFocused : theme.iconColor}*/}
                    {/*            />*/}
                    {/*        ) }}*/}
                    {/*/>*/}
                    <Tabs.Screen
                        name="incidents"
                        options={{
                            title: "Incidents",
                            tabBarItemStyle: { paddingRight: 30 },
                            tabBarIcon: ({focused}) => (
                                <Ionicons
                                    size={24}
                                    name={focused ? 'book': 'book-outline'}
                                    color={focused ? theme.iconColorFocused : theme.iconColor}
                                />
                            ) }}
                    />

                    <Tabs.Screen
                        name="map"
                        options={{
                            title: "Map",
                            tabBarItemStyle: { paddingLeft: 30 },
                            tabBarIcon: ({ focused }) => (
                                <Ionicons
                                    size={24}
                                    name={focused ? 'map' : 'map-outline'}
                                    color={focused ? theme.iconColorFocused : theme.iconColor}
                                />
                            )
                        }}
                    />
                    <Tabs.Screen
                        name="create"
                        options={{ href: null }}
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
                        name="menu/resources"
                        options={{ href: null }}
                    />
                    <Tabs.Screen
                        name="notifications"
                        options={{ href: null }}
                    />
                </Tabs>
                <SpeedDial paddingTop={TAB_BAR_PADDING_TOP}/>
                <IncidentTypeModal
                    visible={typeModalOpen}
                    onClose={() => setTypeModalOpen(false)}
                    onSelect={(type) => {
                        setTypeModalOpen(false)
                        router.push({ pathname: '/create', params: { type } })
                    }}
                />
                {pathname !== '/create' && (
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => setTypeModalOpen(true)}
                    >
                        <Ionicons name="add" size={30} color="#fff" />
                    </TouchableOpacity>
                )}


                {/*<TouchableOpacity*/}
                {/*    style={styles.fab}*/}
                {/*    onPress={() => router.push('/create')}*/}
                {/*>*/}
                {/*    <Ionicons name="add" size={30} color="#fff" />*/}
                {/*</TouchableOpacity>*/}
            </ThemedView>

        </UserOnly>
    )
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 120,       // sits above the tab bar
        right: 30,
        width: 65,
        height: 65,
        borderRadius: 30,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,      // android shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
})

