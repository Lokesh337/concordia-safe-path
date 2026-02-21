import {ActivityIndicator, Keyboard, StyleSheet, Text, TouchableWithoutFeedback} from 'react-native'
import {useState} from "react";

import {Link} from "expo-router";
import { Colors } from "../../constants/Colors";
import {useUser} from "../../hooks/useUser";

//themed components
import ThemedView from "../../components/ThemedView";
import Spacer from "../../components/Spacer";
import ThemedText from "../../components/ThemedText";
import ThemedButton from "../../components/ThemedButton";
import ThemedTextInput from "../../components/ThemedTextInput";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const { login } = useUser()

    const handleSubmit = async () => {
        setError(null);
        try {
            await login(email, password)
        } catch (error) {
            setError(error.message);
        }
    }


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

            <ThemedView style={styles.container} safe={true}>
                <Spacer/>
                <ThemedText title={true} style={styles.title}>
                    Login to Your Account
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

                <Spacer />
                {error && <Text style={styles.error}>{error}</Text>}


                <ThemedButton onPress={handleSubmit}>
                    <Text style={{color: '#f2f2f2' }}>Login</Text>
                </ThemedButton>

                <Spacer height={100}/>
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
    btn: {
        backgroundColor: Colors.primary,
        padding:15,
        borderRadius: 5,
    },
    pressed: {
        opacity: 0.5
    },
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