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
import {Link, useLocalSearchParams, useRouter} from "expo-router";

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
import EmailConfirmationModal from "../../components/modals/EmailConfirmationModal";

const Register = () => {
    const { role } = useLocalSearchParams()

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("")

    // error holds a human-readable string from Supabase, or null
    const [error, setError] = useState(null)
    // confirmation satte
    const [showConfirmation, setShowConfirmation] = useState(false)

    // register comes from UserContext, wraps supabase.auth.signUp()
    const { register, setPendingRedirect } = useUser();

    const router = useRouter()


    const handleSubmit = async () => {
        setError(null)

        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        if (!username.trim()) {
            setError("Username is required")
            return
        }

        try {
            setPendingRedirect(true)
            await register(email, password, { role, username })
            // Profile is created automatically by the DB trigger using user_metadata
            // No need to call updateProfile here regardless of email confirmation setting
            setShowConfirmation(true)
        } catch (e) {
            setPendingRedirect(false)
            setError(e.message)
        }
    }

    return (
        // Tapping outside inputs dismisses the keyboard
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ThemedView style={styles.container} safe={true}>
                <EmailConfirmationModal
                    visible={showConfirmation}
                    email={email}
                    onProceed={() => {
                        setPendingRedirect(false)
                        // If session exists, user is already logged in — go to app
                        // If no session, go to login to wait for verification
                        router.replace('/login')
                    }}
                />

                <Spacer />

                <ThemedText title={true} style={styles.title}>
                    {role === 'staff' ? 'Staff Sign Up' : 'Student Sign Up'}
                </ThemedText>

                <ThemedTextInput
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder="Username"
                    autoCapitalize="none"
                    onChangeText={setUsername}
                    value={username}
                />

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

                <ThemedTextInput
                    style={{ width: '80%', marginBottom: 20 }}
                    placeholder="Confirm Password"
                    autoCapitalize="none"
                    onChangeText={setConfirmPassword}
                    value={confirmPassword}
                    secureTextEntry
                />

                <ThemedButton style={{ width: '80%', marginBottom: 20 , alignItems: 'center', borderRadius: 30}} onPress={handleSubmit}>
                    <Text style={{ color: '#f2f2f2' }}>Sign Up</Text>
                </ThemedButton>

                <Spacer />

                {/* Error banner — only shown when registration fails */}
                {error && <Text style={styles.error}>{error}</Text>}

                <Spacer />

                {/* Link back to login for users who already have an account */}
                <Link href='/login'>
                    <ThemedText style={{ textAlign: 'center' }}>
                        Already have an account?{' '}
                        <ThemedText style={{ color: Colors.primary }}>Log in</ThemedText>
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
    },
    button: {
        width: '80%',
        marginBottom: 20 ,
        alignItems: 'center',
        borderRadius: 30
    }
})