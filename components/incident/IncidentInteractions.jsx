import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "../ThemedText"
import { Colors } from "../../constants/Colors"

const IncidentInteractions = ({
                                  incident,
                                  userVote,
                                  voteLoading,
                                  actionLoading,
                                  isStaff,
                                  userId,
                                  onVote,
                                  onWitnessed,
                                  onVerify,
                                  onResolve,
                                  onDelete,
                              }) => (
    <View style={styles.interactionRow}>

        {/* UPVOTE */}
        <TouchableOpacity
            style={[styles.actionWrapper, incident.user_id === userId && { flex: 0.65 }]}
            onPress={() => onVote('up')}
            disabled={voteLoading || incident.user_id === userId}
            accessibilityLabel={`Upvote, ${incident.upvotes ?? 0} upvotes`}
            accessibilityRole="button"
        >
            <View style={styles.actionItem}>
                <Ionicons name="thumbs-up" size={22} color={userVote === 'up' ? Colors.primary : "#6B7280"} />
                <ThemedText>{incident.upvotes ?? 0}</ThemedText>
            </View>
        </TouchableOpacity>

        {/* DOWNVOTE */}
        <TouchableOpacity
            style={[styles.actionWrapper, incident.user_id === userId && { flex: 0.65 }]}
            onPress={() => onVote('down')}
            disabled={voteLoading || incident.user_id === userId}
            accessibilityLabel={`Downvote, ${incident.downvotes ?? 0} downvotes`}
            accessibilityRole="button"
        >
            <View style={styles.actionItem}>
                <Ionicons name="thumbs-down" size={22} color={userVote === 'down' ? '#E53E3E' : "#6B7280"} />
                <ThemedText>{incident.downvotes ?? 0}</ThemedText>
            </View>
        </TouchableOpacity>


        {/* STAFF ONLY — verify and resolve, hidden for students */}
        {isStaff && (
            <View style={styles.staffActions}>

                {/* verify — disabled once incident is resolved */}
                <TouchableOpacity
                    style={[
                        styles.staffButton,
                        incident.verified && styles.staffButtonDone,
                        incident.status === 'resolved' && styles.staffButtonDisabled,
                    ]}
                    onPress={onVerify}
                    disabled={actionLoading || incident.status === 'resolved'}
                >
                    <ThemedText style={styles.staffButtonText}>
                        {incident.verified ? "Unverify" : "Verify"}
                    </ThemedText>
                    <View style={styles.circleStaffButton}>
                        <Ionicons name={incident.verified ? "close" : "checkmark"} size={14} color="#fff" />
                    </View>
                </TouchableOpacity>

                {/* resolve — also auto-verifies, see handleResolve in useIncidentDetail */}
                <TouchableOpacity
                    style={[styles.staffButton, incident.status === 'resolved' && styles.staffButtonDone]}
                    onPress={onResolve}
                    disabled={actionLoading}
                >
                    <ThemedText style={styles.staffButtonText}>
                        {incident.status === 'resolved' ? "Reopen" : "Resolve"}
                    </ThemedText>
                    <View style={styles.circleStaffButton}>
                        <Ionicons name={incident.status === 'resolved' ? "close" : "checkmark"} size={14} color="#fff" />
                    </View>
                </TouchableOpacity>

            </View>
        )}
        {/* DELETE — only visible to the reporter */}
        {incident.user_id === userId && (
            <TouchableOpacity style={styles.actionWrapper} onPress={onDelete}>
                <View style={styles.actionItem}>
                    <Ionicons name="trash-outline" size={22} color="#FF3B30" />
                </View>
                <ThemedText style={[styles.actionLabel, { color: '#FF3B30' }]}>Delete</ThemedText>
            </TouchableOpacity>
        )}

    </View>
)

export default IncidentInteractions

const styles = StyleSheet.create({
    interactionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    actionWrapper: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    actionItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    actionLabel: {
        fontSize: 12,
        color: "#67686a",
    },
    // staff section takes flex: 2 so verify + resolve share the same space as 2 action buttons
    staffActions: {
        flex: 2,
        flexDirection: 'row',
        gap: 6,
    },
    staffButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#59A7E7",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
    },
    staffButtonDone: {
        backgroundColor: "#24963F",
    },
    staffButtonDisabled: {
        backgroundColor: "#9CA3AF",
        opacity: 0.5,
    },
    staffButtonText: {
        color: "#fff",
        fontWeight: "400",
        fontSize: 13,
    },
    circleStaffButton: {
        width: 20,
        height: 20,
        left: 3,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
})