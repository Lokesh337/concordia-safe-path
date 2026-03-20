import { View, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "../ThemedText"

const IncidentProgress = ({ incident, netVotes }) => (
    <View style={styles.progressWrapper}>

        <View style={styles.progressLineBackground} />

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

            <View style={styles.step}>
                <View style={[styles.circle, styles.circleComplete]}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
                <ThemedText style={styles.stepLabel}>Submitted</ThemedText>
            </View>

            <View style={styles.step}>
                <View style={[styles.circle, netVotes >= 4 && styles.circleComplete]}>
                    {netVotes >= 4 && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <ThemedText style={styles.stepLabel}>Reported By Others</ThemedText>
            </View>

            <View style={styles.step}>
                <View style={[styles.circle, incident.verified && styles.circleComplete]}>
                    {incident.verified && <Ionicons name="checkmark" size={14} color="#fff" />}
                </View>
                <ThemedText style={styles.stepLabel}>Verified</ThemedText>
            </View>

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