import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useColorScheme } from 'react-native'
import { Colors } from '../../constants/Colors'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'
import { useRouter } from 'expo-router'
import { supabase } from '../../lib/supabase'

const EmailConfirmationModal = ({ visible, email }) => {
    const colorScheme = useColorScheme()
    const theme = Colors[colorScheme] ?? Colors.light
    const router = useRouter()

    const handleResend = async () => {
        await supabase.auth.resend({ type: 'signup', email })
    }

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <ThemedView style={styles.card}>

                    <ThemedText title={true} style={styles.title}>
                        Check Your Email
                    </ThemedText>

                    <ThemedText style={styles.subtitle}>
                        To verify your identity, we've sent a confirmation link to your email address.
                    </ThemedText>

                    <TouchableOpacity
                        style={[styles.button, { backgroundColor: theme.tint }]}
                        onPress={handleResend}
                    >
                        <ThemedText style={styles.buttonText}>Resend email</ThemedText>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => router.replace('/login')}>
                        <ThemedText style={[styles.loginLink, { color: theme.tint }]}>
                            Already verified? Log in
                        </ThemedText>
                    </TouchableOpacity>

                </ThemedView>
            </View>
        </Modal>
    )
}

export default EmailConfirmationModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    card: {
        width: '100%',
        borderRadius: 16,
        padding: 28,
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        opacity: 0.7,
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        width: '100%',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    loginLink: {
        fontSize: 13,
        marginTop: 4,
    },
})