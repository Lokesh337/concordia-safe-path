/**
 * A styled primary action button used throughout the app.
 *
 * Built on <Pressable> (rather than TouchableOpacity) to allow the style
 * prop to receive the pressed state as a function, enabling inline press
 * feedback without extra state.
 *
 * Props:
 *  - disabled {boolean} : When true, grays out the button and suppresses the press feedback and onPress handler.
 *  - style : Merged last, so callers can override size, margin, alignment.
 *  - ...props : All other Pressable props (onPress, children, etc.) passed through.
 *
 * Visual states:
 *  - Default: Colors.primary background
 *  - Pressed: 50% opacity (only when not disabled)
 *  - Disabled: Gray (#aaa) background, no press feedback
 */

import { Pressable, StyleSheet } from "react-native"
import { Colors } from "../constants/Colors"

const ThemedButton = ({ style, disabled, ...props }) => {
    return (
        <Pressable
            disabled={disabled}
            style={({ pressed }) => [
                styles.btn,
                pressed && !disabled && styles.pressed,  // only show press state when enabled
                disabled && styles.disabled,
                style,
            ]}
            {...props}
        />
    )
}

export default ThemedButton

const styles = StyleSheet.create({
    btn: {
        backgroundColor: Colors.primary,
        padding: 18,
        borderRadius: 6,
        marginVertical: 10,
    },
    pressed: {
        opacity: 0.5,
    },
    disabled: {
        backgroundColor: '#aaa',
    },
})