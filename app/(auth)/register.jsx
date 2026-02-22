/**\ * Registration screen — allows new users to create an account.
 *
 *  - Collects email + password and calls register() from UserContext.
 *  - register() calls Supabase signUp
 *  - Displays a styled error banner on failure
 *  - On success, Supabase auto-sign-in the user, triggering the GuestOnly redirect.
 * *
 * TODO (Goal 1):
 *  - Add account type selection (Student vs Security Staff)
 *  - Add accessibility preferences step
 *  - Add privacy consent for location tracking
 */

import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
import { useState } from "react";
import { Link } from "expo-router";

// hooks
import { useUser } from "../../hooks/useUser";

//constants
import { Colors } from "../../constants/Colors";

// Themed components
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";

const Register = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // error holds a human-readable string from Supabase, or null
    const [error, setError] = useState(null);

    // register comes from UserContext, wraps supabase.auth.signUp()
    const { register } = useUser();

    const handleSubmit = async () => {
        setError(null); // Clear previous errors

        try {
            await register(email, password)
            // On success: if Supabase auto-confirms the session, UserContext
            // updates user state → GuestOnly redirects to /incidents.
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        // Tapping outside inputs dismisses the keyboard
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container} safe={true}>
                <Spacer />

                <ThemedText title={true} style={styles.title}>
                    Register for an Account
                </ThemedText>

                <ThemedTextInput
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    onChangeText={setEmail}
                    value={email}
                />

                <ThemedTextInput
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder="Password"
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry
                />

                <ThemedButton onPress={handleSubmit}>
                    <Text style={{ color: '#f2f2f2' }}>Register</Text>
                </ThemedButton>

                <Spacer />

                {/* Error banner — only shown when registration fails */}
                {error && <Text style={styles.error}>{error}</Text>}

                <Spacer height={100} />

                {/* Link back to login for users who already have an account */}
                <Link href='/login'>
                    <ThemedText style={{ textAlign: 'center' }}>
                        Login instead
                    </ThemedText>
                </Link>
            </ThemedView>
        </TouchableWithoutFeedback>
    )
}

export default Register

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        textAlign: "center",
        fontSize: 25,
        marginBottom: 30,
    },
    // Red-tinted error banner consistent with login.jsx
    error: {
        color: Colors.warning,
        padding: 10,
        backgroundColor: '#f5c1c8',
        borderColor: Colors.warning,
        borderWidth: 1,
        borderRadius: 6,
        marginHorizontal: 10,
    }
})