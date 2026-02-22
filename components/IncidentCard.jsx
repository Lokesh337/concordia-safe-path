import { StyleSheet } from "react-native";
import {Pressable, View} from "react-native";
import {Ionicons} from "@expo/vector-icons"

// Constants
import {Colors} from "../constants/Colors";
import {Icons} from "../constants/Icons";
// Themed components
import ThemedText from "./ThemedText";
import ThemedCard from "./ThemedCard";
//functions
import {getNearestBuilding} from "../lib/helpers";
import {timeAgo} from "../lib/helpers";

const IncidentCard = ({ item, onPress }) => (
    <Pressable onPress={onPress}>
        <ThemedCard style={[styles.card, { borderLeftWidth: 4, borderLeftColor: Colors.severity[item.severity] }]}>
            <View style={[styles.iconBox, { backgroundColor: Colors.type[item.type] ?? '#888' }]}>
                <Ionicons name={Icons.type[item.type] ?? 'alert-circle'} size={28} color="#fff" />
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


                <View style={styles.bottomRow}>
                    <View style={{ flex: 1 }} />
                    {item.status === 'resolved' && (
                        <View style={[styles.badgePill, { backgroundColor: Colors.badge.resolvedBg }]}>
                            <Ionicons name="checkmark-done-outline" size={14} color={Colors.badge.resolved} />
                            <ThemedText style={[styles.badgeText, { color: Colors.badge.resolved }]}>Resolved</ThemedText>
                        </View>
                    )}
                    <View style={[styles.badgePill, { backgroundColor: item.verified ? Colors.badge.verifiedBg : Colors.badge.reportedBg }]}>
                        {item.verified
                            ? <Ionicons name="checkmark-circle" size={14} color={Colors.badge.verified} />
                            : <Ionicons name="time-outline" size={14} color={Colors.badge.reported} />
                        }
                        <ThemedText style={[styles.badgeText, { color: item.verified ? Colors.badge.verified : Colors.badge.reported }]}>
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

    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
})