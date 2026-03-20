import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "../ThemedText"
import { Colors } from "../../constants/Colors"
import { Icons } from "../../constants/Icons"

const IncidentHeader = ({ incident, isFollowing, followLoading, onFollow }) => (
    <View style={styles.header}>
        <View style={[styles.iconBox, { backgroundColor: Colors.type[incident.type] ?? "#888" }]}>
            <Ionicons name={Icons.type[incident.type] ?? "alert-circle"} size={36} color="#fff" />
        </View>

        <View style={styles.textColumn}>
            <ThemedText style={styles.severityDisplay}>
                {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1) + " tension"}
            </ThemedText>
            <ThemedText style={styles.title}>
                {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
            </ThemedText>
        </View>

        <View style={styles.followButtonAbsolute}>
            <TouchableOpacity onPress={onFollow} disabled={followLoading} style={{ alignItems: "center" }}>
                <Ionicons name="star" size={24} color={isFollowing ? "#FFD700" : "#6B7280"} />
                <ThemedText style={styles.followText}>
                    {isFollowing ? "Following" : "Follow"}
                </ThemedText>
            </TouchableOpacity>
        </View>
    </View>
)

export default IncidentHeader

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 15,
        position: "relative",
    },
    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center",
    },
    textColumn: {
        flexDirection: "column",
        justifyContent: "flex-start",
        flex: 1,
    },
    severityDisplay: {
        backgroundColor: "#E7E7E7",
        fontSize: 14,
        fontWeight: "600",
        color: "#4D4D4D",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 9,
        alignSelf: "flex-start",
        marginBottom: 15,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
    },
    followButtonAbsolute: {
        position: "absolute",
        right: 10,
        top: 5,
        width: 60,
        alignItems: "center",
    },
    followText: {
        fontSize: 12,
        color: "#a3a3a3",
        fontWeight: "600",
        textAlign: "center",
        marginTop: 2,
    },
})