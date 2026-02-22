/**
 *
 * Login screen :  entry point for returning users.
 *
 *  - Collects email + password from the user.
 *  - Calls login() from UserContext, delegates to Supabase auth.
 *  - Displays error message if login fails
 *  - On success, UserContext updates  user state, triggers
 *    GuestOnly to redirect automatically to /incidents
 */

import { Keyboard, StyleSheet, Text, TouchableWithoutFeedback } from 'react-native'
import { useState } from "react";

import { Link } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useUser } from "../../hooks/useUser";

// Themed components (respect light/dark mode via ThemedView/ThemedText)
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";

const Login = () => {
    // state variables
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    // get the login function from user context
    const { login } = useUser()

    const handleSubmit = async () => {
        setError(null); // Clear any previous error before attempting login

        try {
            await login(email, password)
            // On success: UserContext sets user then GuestOnly detects it
            // and redirects to /incidents automatically.
        } catch (error) {
            // throws a Error with a message from Supabase
            setError(error.message);
        }
    }

    return (
        // Tapping anywhere outside inputs collapses the keyboard
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            {/* safe={true} adds padding for the device's safe area (notch, home bar) */}
            <ThemedView style={styles.container} safe={true}>
                <Spacer />

                <ThemedText title={true} style={styles.title}>
                    Login to Your Account
                </ThemedText>

                <ThemedTextInput
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder="Email"
                    keyboardType="email-address"
                    autoCapitalize="none"   // Prevent from capitalizing the first letter
                    onChangeText={setEmail}
                    value={email}
                />

                <ThemedTextInput
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder="Password"
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    value={password}
                    secureTextEntry   // Masks password characters
                />

                <Spacer />

                {/* Only rendered when there's an active error */}
                {error && <Text style={styles.error}>{error}</Text>}

                <ThemedButton onPress={handleSubmit}>
                    <Text style={{ color: '#f2f2f2' }}>Login</Text>
                </ThemedButton>

                <Spacer height={100} />

                {/* link to the register screen */}
                <Link href='/register'>
                    <ThemedText style={{ textAlign: 'center' }}>
                        Register instead
                    </ThemedText>
                </Link>
            </ThemedView>
        </TouchableWithoutFeedback>
    )
}

export default Login

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: 'center'
    },
    title: {
        textAlign: "center",
        fontSize: 25,
        marginBottom: 30,
    },
    // Red-tinted error banner shown below the inputs on failure
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