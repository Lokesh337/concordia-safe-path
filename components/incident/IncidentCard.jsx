/**
 * Displays a single incident as a pressable card in the incidents list.
 *
 * Props:
 *  - item    {object}   — Incident row from Supabase.
 *  - onPress {function} — Called when the card is tapped.
 *
 * Verification badge logic (Goal 3):
 *  - item.verified = true  → "Verified by Campus" (green, checkmark icon)
 *  - item.verified = false → "Reported by X" where X = upvotes + 1
 *                            (+1 counts the original reporter)
 **
 * TODO (Goal 3): Add upvote button directly on the card
 * TODO (Goal 4): Add the verification progress stages
 *                (Submitted → Reviewing → Verified by users → Verified by campus)
 */

import { StyleSheet, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons"

// Constants
import { Colors } from "../../constants/Colors";
import { Icons } from "../../constants/Icons";

// Themed components
import ThemedText from "../ThemedText";
import ThemedCard from "../ThemedCard";

// Helpers
import { getNearestBuilding, timeAgo } from "../../lib/helpers";

const IncidentCard = ({ item, onPress }) => (
    <Pressable onPress={onPress}>
        {/* Left border color = severity level (red / orange / green) */}
        <ThemedCard style={[styles.card, { borderLeftWidth: 4, borderLeftColor: Colors.severity[item.severity] }]}>

            {/* Icon box — background color encodes incident type */}
            <View style={[styles.iconBox, { backgroundColor: Colors.type[item.type] ?? '#888' }]}>
                {/* Falls back to 'alert-circle' icon if the type isn't in Icons.type */}
                <Ionicons name={Icons.type[item.type] ?? 'alert-circle'} size={28} color="#fff" />
            </View>

            <View style={styles.cardContent}>

                {/* Row: incident type (title) + relative timestamp */}
                <View style={styles.cardHeader}>
                    <ThemedText style={styles.cardTitle}>
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                    </ThemedText>
                    <ThemedText style={styles.cardTime}>{timeAgo(item.created_at)}</ThemedText>
                </View>

                {/* Nearest building derived from coordinates (approximate) */}
                <View style={styles.locationRow}>
                    <Ionicons name="location" size={12} color={Colors.primary} />
                    <ThemedText style={styles.location}>
                        {item.latitude && item.longitude
                            ? getNearestBuilding(item.latitude, item.longitude)
                            : 'Unknown location'}
                    </ThemedText>
                </View>

                {/* Description — clamped to 2 lines to keep cards uniform height */}
                <ThemedText style={styles.description} numberOfLines={2}>
                    {item.description}
                </ThemedText>

                <View style={styles.bottomRow}>
                    <View style={{ flex: 1 }} />

                    {/* reported by — shown when upvotes >= 4, regardless of verified/resolved status */}
                    {((item.upvotes ?? 0) >= 4) && (
                        <View style={[styles.badgePill, { backgroundColor: Colors.badge.reportedBg }]}>
                            <Ionicons name="time-outline" size={14} color={Colors.badge.reported} />
                            <ThemedText style={[styles.badgeText, { color: Colors.badge.reported }]}>
                                {`Reported by ${item.upvotes ?? 0}`}
                            </ThemedText>
                        </View>
                    )}

                    {/* resolved supersedes verified */}
                    {item.status === 'resolved' ? (
                        <View style={[styles.badgePill, { backgroundColor: Colors.badge.resolvedBg }]}>
                            <Ionicons name="checkmark-done-outline" size={14} color={Colors.badge.resolved} />
                            <ThemedText style={[styles.badgeText, { color: Colors.badge.resolved }]}>Resolved</ThemedText>
                        </View>
                    ) : item.verified ? (
                        <View style={[styles.badgePill, { backgroundColor: Colors.badge.verifiedBg }]}>
                            <Ionicons name="checkmark-circle" size={14} color={Colors.badge.verified} />
                            <ThemedText style={[styles.badgeText, { color: Colors.badge.verified }]}>Verified by Campus</ThemedText>
                        </View>
                    ) : null}

                </View>

            </View>
        </ThemedCard>
    </Pressable>
)

export default IncidentCard

const styles = StyleSheet.create({
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
        flexShrink: 0, // don't shrink if description text is long
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
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: 4,
    },
    badgePill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 20,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
})