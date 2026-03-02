/**
 * OfflineBanner — a persistent bar shown across all dashboard screens
 * when the device has no internet connection.
 *
 * Uses useNetwork() to subscribe to connectivity changes.
 * Renders nothing when online.
 */

import { View, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useNetwork } from '../../hooks/useNetwork'
import ThemedText from '../ThemedText'
import {Colors} from "../../constants/Colors";

const OfflineBanner = () => {
    const { isOnline } = useNetwork()

    if (isOnline === null || isOnline) return null

    return (
        <View style={[styles.banner, {backgroundColor : Colors.attention}]}>
            <Ionicons name="cloud-offline-outline" size={16} color="#000" />
            <ThemedText style={styles.text}>You're offline — Lost connectivity</ThemedText>
        </View>
    )
}

export default OfflineBanner

const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#555',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 6,
    },
    text: {
        color: '#000',
        fontSize: 13,
    },
})