import { Tabs } from "expo-router"
import { useColorScheme } from "react-native"
import { Colors } from "../../constants/Colors"
import { Ionicons} from "@expo/vector-icons";
import Profile from "./profile";
import UserOnly from "../../components/auth/UserOnly";

export default function DashboardLayout() {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <UserOnly>
            <Tabs
                screenOptions={{
                    headerShown: false,
                    tabBarStyle: { backgroundColor: theme.navBackground, paddingTop: 10, height: 100 },
                    tabBarActiveTintColor: theme.iconColorFocused,
                    tabBarInactiveTintColor: theme.iconColor,
                }}
            >
                <Tabs.Screen
                    name="profile"
                    options={{ title: "Profile", tabBarIcon: ({focused}) => (
                        <Ionicons
                            size={24}
                            name={focused ? 'person': 'person-outline'}
                            color={focused ? theme.iconColorFocused : theme.iconColor}
                        />
                        ) }}
                />
                <Tabs.Screen
                    name="incidents"
                    options={{ title: "Incidents",  tabBarIcon: ({focused}) => (
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
                    options={{ title: "Create", tabBarIcon: ({focused}) => (
                            <Ionicons
                                size={24}
                                name={focused ? 'create': 'create-outline'}
                                color={focused ? theme.iconColorFocused : theme.iconColor}
                            />
                        )}}
                />
                <Tabs.Screen
                    name="incidents/[id]"
                    options={{ href: null }}
                />
            </Tabs>
        </UserOnly>
    )
}