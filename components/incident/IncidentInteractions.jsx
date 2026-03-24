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


        {/* UPVOTE — highlights when active, locked + disabled for the reporter */}
        <TouchableOpacity style={styles.actionWrapper} onPress={() => onVote('up')} disabled={voteLoading || incident.user_id === userId}>
            <View style={styles.actionItem}>
                <Ionicons name="thumbs-up" size={22} color={userVote === 'up' ? Colors.primary : "#6B7280"} />
                <ThemedText>{incident.upvotes ?? 0}</ThemedText>
            </View>
            <ThemedText style={styles.actionLabel}>Upvotes</ThemedText>
        </TouchableOpacity>

        {/* DOWNVOTE — switching from upvote automatically removes the upvote */}
        <TouchableOpacity style={styles.actionWrapper} onPress={() => onVote('down')} disabled={voteLoading || incident.user_id === userId}>
            <View style={styles.actionItem}>
                <Ionicons name="thumbs-down" size={22} color={userVote === 'down' ? '#E53E3E' : "#6B7280"} />
                <ThemedText>{incident.downvotes ?? 0}</ThemedText>
            </View>
            <ThemedText style={styles.actionLabel}>Downvotes</ThemedText>
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