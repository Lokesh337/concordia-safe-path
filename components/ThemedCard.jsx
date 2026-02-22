/***
 * A theme-aware surface container with rounded corners and a subtle
 * background lift — used to visually group related content (incident
 * cards, menu items, info panels, etc.).
 *
 * Props:
 *  - style: Merged after base card styles
 *  - ...props": All other View props, including children.
 */

import { StyleSheet, View, useColorScheme } from "react-native";
import { Colors } from '../constants/Colors'

const ThemedCard = ({ style, ...props }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    // theme.uiBackground is slightly elevated from theme.background —
    // creates a visual layering effect between the screen and card surfaces
    return (
        <View
            style={[{ backgroundColor: theme.uiBackground }, styles.card, style]}
            {...props}
        />
    )
}

export default ThemedCard;

const styles = StyleSheet.create({
    card: {
        borderRadius: 5,
        padding: 20,
    }
})