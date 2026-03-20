import { View, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "../ThemedText"

// progress bar fills left to right: 25% → 50% → 75% → 100%
// step 2 threshold: netVotes >= 4 (4 upvotes + original reporter = 5 total)
const IncidentProgress = ({ incident, netVotes }) => (
    <View style={styles.progressWrapper}>

        {/* grey base track */}
        <View style={styles.progressLineBackground} />

        {/* green fill — width driven by verified/netVotes/status */}
        <View
            style={[
                styles.progressLineFill,
                {
                    width: `${
                        (incident.verified ? 75 : netVotes >= 4 ? 50 : 25) +
                        (incident.status === "resolved" ? 25 : 0)
                    }%`
                }
            ]}
        />

        <View style={styles.progressSteps}>

            {/* step 1: always complete — incident exists */}
            <View style={styles.step}>
                <View style={[styles.circle, styles.circleComplete]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <ThemedText style={styles.stepLabel}>Submitted</ThemedText>
            </View>

            {/* step 2: net votes >= 4 */}
            <View style={styles.step}>
                <View style={[styles.circle, netVotes >= 4 && styles.circleComplete]}>
                    {netVotes >= 4 && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <ThemedText style={styles.stepLabel}>Reported By Others</ThemedText>
            </View>

            {/* step 3: verified by staff */}
            <View style={styles.step}>
                <View style={[styles.circle, incident.verified && styles.circleComplete]}>
                    {incident.verified && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <ThemedText style={styles.stepLabel}>Verified</ThemedText>
            </View>

            {/* step 4: resolved by staff */}
            <View style={styles.step}>
                <View style={[styles.circle, incident.status === "resolved" && styles.circleComplete]}>
                    {incident.status === "resolved" && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <ThemedText style={styles.stepLabel}>Resolved</ThemedText>
            </View>

        </View>
    </View>
)

export default IncidentProgress

const styles = StyleSheet.create({
    progressWrapper: {
        position: "relative",
        marginVertical: 8,
    },
    progressLineBackground: {
        position: "absolute",
        top: 9,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: "#DADADA",
    },
    progressLineFill: {
        position: "absolute",
        top: 9,
        left: 0,
        height: 4,
        backgroundColor: "#24963F",
    },
    progressSteps: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    step: {
        alignItems: "center",
        width: 80,
    },
    circle: {
        width: 20,
        height: 20,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: "#DADADA",
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    circleComplete: {
        backgroundColor: "#24963F",
        borderColor: "#24963F",
    },
    stepLabel: {
        fontSize: 12,
        marginTop: 6,
        textAlign: "center",
    },
})