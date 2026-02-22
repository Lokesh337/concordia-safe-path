import { StyleSheet } from "react-native";
import {useIncidents} from "../hooks/useIncidents";
import {useRouter} from "expo-router";
import {useState} from "react";
import {Pressable, View} from "react-native";
import ThemedText from "./ThemedText";
import {Ionicons} from "@expo/vector-icons";
import ThemedCard from "./ThemedCard";
import {Colors} from "../constants/Colors";
import {getNearestBuilding} from "../lib/getNearestBuilding";

const TYPE_COLORS = {
    protest: '#e74c3c',
    construction: '#f39c12',
    blockade: '#27ae60',
    vandalism: '#8e44ad',
    emergency: '#cc475a',
}

const TYPE_ICONS = {
    protest: 'megaphone',
    construction: 'construct',
    blockade: 'ban',
    vandalism: 'hammer',
    emergency: 'alert-circle',
}

function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins} min ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}hr ago`
    return `${Math.floor(hrs / 24)}d ago`
}

const IncidentCard = ({ item, onPress }) => (
    <Pressable onPress={onPress}>
        <ThemedCard style={[styles.card, { borderLeftWidth: 4, borderLeftColor: Colors.SEVERITY_COLORS[item.severity] }]}>
            <View style={[styles.iconBox, { backgroundColor: TYPE_COLORS[item.type] ?? '#888' }]}>
                <Ionicons name={TYPE_ICONS[item.type] ?? 'alert-circle'} size={28} color="#fff" />
            </View>

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <ThemedText style={styles.cardTitle}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </ThemedText>
                    <ThemedText style={styles.cardTime}>{timeAgo(item.created_at)}</ThemedText>
                </View>

                <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color={Colors.primary} />
                    <ThemedText style={styles.location}>
                        {item.latitude && item.longitude
                            ? getNearestBuilding(item.latitude, item.longitude)
                            : 'Unknown location'}
                    </ThemedText>
                </View>

                <ThemedText style={styles.description} numberOfLines={2}>
                    {item.description}
                </ThemedText>


                {/* Bottom row with badge on right */}
                <View style={styles.bottomRow}>
                    <View style={{ flex: 1 }} />
                    <View style={[styles.badgePill, { backgroundColor: item.verified ? '#27ae6022' : '#4a90e222' }]}>
                        {item.status === 'resolved' && (
                            <View style={[styles.badgePill, { backgroundColor: '#62626222' }]}>
                                <Ionicons name="checkmark-done-outline" size={14} color="#626262" />
                                <ThemedText style={[styles.badgeText, { color: '#626262' }]}>Resolved</ThemedText>
                            </View>
                        )}
                        {item.verified
                            ? <Ionicons name="checkmark-circle" size={14} color="#27ae60" />
                            : <Ionicons name="time-outline" size={14} color="#4a90e2" />
                        }
                        <ThemedText style={[styles.badgeText, { color: item.verified ? '#27ae60' : '#4a90e2' }]}>
                            {item.verified ? 'Verified by Campus' : `Reported by ${item.upvotes + 1}`}
                        </ThemedText>
                    </View>
                </View>
            </View>
        </ThemedCard>
    </Pressable>
)
export default IncidentCard

const styles = StyleSheet.create({
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
    },
    filters: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        gap: 8,
    },
    filterLabel: {
        fontSize: 14,
        opacity: 0.6,
        marginRight: 4,
    },
    filterPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 13,
        opacity: 0.7,
        letterSpacing: 0.5,
    },
    card: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 6,
        padding: 12,
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    cardTime: {
        fontSize: 12,
        opacity: 0.5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 12,
        opacity: 0.6,
    },
    description: {
        fontSize: 13,
        opacity: 0.7,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    empty: {
        textAlign: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
})