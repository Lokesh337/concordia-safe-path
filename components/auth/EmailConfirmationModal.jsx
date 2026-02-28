import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'
import { Colors } from '../../constants/Colors'
import ThemedText from '../ThemedText'
import ThemedView from '../ThemedView'
import { supabase } from '../../lib/supabase'

// shown after signup, waits for user to verify email
const EmailConfirmationModal = ({ visible, email, onProceed }) => {

    // resend confirmation email via supabase
    const handleResend = async () => {
        await supabase.auth.resend({ type: 'signup', email })
    }

    return (
        // fade modal, transparent so overlay colour shows thru
        <Modal visible={visible} transparent animationType="fade">
            {/* dark overlay behind card */}
            <View style={styles.overlay}>
                <ThemedView style={styles.card}>

                    <ThemedText title={true} style={styles.title}>
                        Check Your Email
                    </ThemedText>

                    <ThemedText style={styles.subtitle}>
                        To verify your identity, we've sent a confirmation link to your email address.
                    </ThemedText>

                    {/* triggers another confirmation email */}
                    <TouchableOpacity style={styles.resendButton} onPress={handleResend}>
                        <ThemedText style={styles.resendText}>Resend email</ThemedText>
                    </TouchableOpacity>

                    {/* if already verifed, let them proceed to login */}
                    <View style={styles.loginRow}>
                        <ThemedText style={styles.loginText}>Already verified? </ThemedText>
                        <TouchableOpacity onPress={onProceed}>
                            <ThemedText style={styles.loginLink}>Log in</ThemedText>
                        </TouchableOpacity>
                    </View>

                </ThemedView>
            </View>
        </Modal>
    )
}

export default EmailConfirmationModal

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)', // dimmed bg
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    card: {
        width: '100%',
        borderRadius: 24,
        paddingVertical: 36,
        paddingHorizontal: 28,
        alignItems: 'center',
        gap: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 15,
        lineHeight: 22,
        opacity: 0.7, // de-emphasize vs title
        marginBottom: 8,
    },
    resendButton: {
        backgroundColor: Colors.primary,
        borderRadius: 30, // pill shape
        paddingVertical: 16,
        width: '100%',
        alignItems: 'center',
    },
    resendText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 15,
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 4,
    },
    loginText: {
        fontSize: 14,
        opacity: 0.7,
    },
    loginLink: {
        fontSize: 14,
        color: Colors.primary,
        fontWeight: '600',
    },
})