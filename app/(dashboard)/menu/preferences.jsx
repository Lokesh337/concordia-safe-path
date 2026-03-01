import { StyleSheet, TouchableOpacity, Text } from 'react-native'
import { useRouter } from 'expo-router'

import { useUser } from '../../../hooks/useUser'
import { Colors } from '../../../constants/Colors'
import ThemedView from '../../../components/ThemedView'
import ThemedText from '../../../components/ThemedText'
import ThemedButton from '../../../components/ThemedButton'

const Preferences = () => {
    const { user, profile, updateProfile } = useUser()
    const router = useRouter()

    // true only on the first visit — used to decide whether to redirect after saving
    const isFirstTime = !profile?.preferences_completed

    const handleDone = async () => {
        await updateProfile(user.id, { preferences_completed: true })
        // only redirect on first-time onboarding; returning users stay on this screen
        if (isFirstTime) router.replace('/incidents')
    }

    return (
        <ThemedView style={styles.container} safe={true}>

            <ThemedText title={true}>Preferences</ThemedText>
            <ThemedText style={styles.placeholder}>Preferences content coming soon.</ThemedText>

            <ThemedButton style={styles.button} onPress={handleDone}>
                <Text style={{ color: '#fff' }}>Done</Text>
            </ThemedButton>
            {isFirstTime &&
                <TouchableOpacity onPress={handleDone} style={styles.skip}>
                    <ThemedText style={{ color: Colors.primary, textAlign: 'center' }}>Skip for now</ThemedText>
                </TouchableOpacity>
            }


        </ThemedView>
    )
}

export default Preferences

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 28,
    },
    placeholder: {
        opacity: 0.5,
        marginVertical: 32,
        textAlign: 'center',
    },
    button: {
        width: '100%',
        alignItems: 'center',
        borderRadius: 30,
        marginBottom: 16,
    },
    skip: {
        paddingVertical: 8,
    },
})