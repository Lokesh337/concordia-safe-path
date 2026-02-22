/**
 * A full-screen centered loading spinner, theme-aware.
 *
 * Renders a React Native <ActivityIndicator> centered inside a
 * full-height ThemedView so it fills whatever space it's placed in.
 * The spinner color matches the current theme's text color for
 * visibility in both light and dark modes.
 */

import { ActivityIndicator, useColorScheme } from "react-native";
import { Colors } from '../constants/Colors'
import ThemedView from "./ThemedView";

const ThemedLoader = () => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light

    return (
        <ThemedView style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        }}>
            <ActivityIndicator size="large" color={theme.text} />
        </ThemedView>
    )
}

export default ThemedLoader;