/**
 * A theme-aware text input with built-in show/hide toggle for password fields.
 *
 * Renders in two modes depending on the `secureTextEntry` prop:
 *
 *  1. Regular input (secureTextEntry = false/undefined):
 *     Returns a plain <TextInput> with theme colors applied.
 *
 *  2. Password input (secureTextEntry = true):
 *     Returns a <View> wrapping the input + an eye icon toggle button.
 *     The icon toggles between 'eye' and 'eye-off' to show/hide the text.
 *
 * Props:
 *  - secureTextEntry {boolean} — Activates password mode with the eye toggle.
 *  - style — Applied to the outer container (View in password mode,
 *            TextInput directly in regular mode).
 *  - ...props — All other TextInput props (placeholder, value, onChangeText, etc.)
 *
 * TODO (Goal 13): Ensure this component is accessible — verify that the show/hide toggle button has an accessible label for screen readers.
 */

import { useState } from 'react';
import { TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

const ThemedTextInput = ({ style, secureTextEntry, ...props }) => {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme] ?? Colors.light;

    // Controls whether the password characters are visible or masked
    const [hidden, setHidden] = useState(true);

    // The inner TextInput — shared definition for the password mode
    const input = (
        <TextInput
            placeholderTextColor={theme.text}
            secureTextEntry={secureTextEntry && hidden} // mask only when hidden=true
            autoCapitalize="none"
            style={{
                flex: secureTextEntry ? 1 : undefined, // flex: 1 so it fills the row, leaving room for the eye icon
                backgroundColor: theme.uiBackground,
                color: theme.text,
                padding: 20,
                borderRadius: 6,
            }}
            {...props}
        />
    );

    // Regular input — returned early, no eye icon needed
    if (!secureTextEntry) return (
        <TextInput
            {...{
                placeholderTextColor: theme.text,
                style: [{ backgroundColor: theme.uiBackground, color: theme.text, padding: 20, borderRadius: 6 }, style],
                ...props
            }}
        />
    );

    // Password input — wraps input + toggle in a row container
    // The outer View provides the shared background/border-radius so the
    // input and the eye icon appear as one unified field
    return (
        <View style={[{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: theme.uiBackground,
            borderRadius: 6,
        }, style]}>
            {input}
            {/* Eye icon toggles password visibility */}
            <TouchableOpacity
                onPress={() => setHidden(prev => !prev)}
                style={{ paddingRight: 16 }}
                // TODO (Goal 13): add accessibilityLabel="Show password" / "Hide password"
            >
                <Ionicons
                    name={hidden ? 'eye-off' : 'eye'}
                    size={20}
                    color={theme.text}
                />
            </TouchableOpacity>
        </View>
    );
};

export default ThemedTextInput;