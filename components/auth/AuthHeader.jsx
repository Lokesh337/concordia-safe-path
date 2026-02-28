import { View, Text, StyleSheet, Image } from 'react-native'
import { Colors } from '../../constants/Colors'

const AuthHeader = () => {
    return (
        <View style={styles.topHalf}>
            <View style={styles.logoCard}>
                <Image
                    source={require('../../assets/img/concordia_logo_light.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
                <Text style={styles.logoText}>CONSAFE{'\n'}PATH</Text>
            </View>
        </View>
    )
}

export default AuthHeader

const styles = StyleSheet.create({
    topHalf: {
        height: 220,
        backgroundColor: Colors.primaryDark,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    logoCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        paddingHorizontal: 32,
        paddingVertical: 20,
        alignItems: 'center',
        marginBottom: -50,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
        zIndex: 10,
    },
    logo: {
        width: 72,
        height: 72,
        marginBottom: 8,
    },
    logoText: {
        color: Colors.primaryDark,
        fontWeight: '800',
        fontSize: 13,
        textAlign: 'center',
        letterSpacing: 1,
    },
})