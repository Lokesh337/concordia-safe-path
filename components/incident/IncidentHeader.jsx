import { View, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "../ThemedText"
import { Colors } from "../../constants/Colors"
import { IncidentIconMap } from "../../constants/Icons"

// icon box color comes from Colors.type, falls back to grey for unknown types
const IncidentHeader = ({ incident, isFollowing, followLoading, onFollow, userId, onDelete }) => (
    <View style={styles.header}>

        {/* type icon */}
        <View style={[styles.iconBox,  { backgroundColor: Colors.severity[incident.severity] ?? Colors.primaryDark }]}>
            {IncidentIconMap[incident.type]
                ? IncidentIconMap[incident.type]({ size: 36, color: '#fff' })
                : <Ionicons name="alert-circle" size={36} color="#fff" />}
        </View>

        {/* severity badge + incident type title */}
        <View style={styles.textColumn}>
            <ThemedText style={styles.severityDisplay}>
                {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1) + " tension"}
            </ThemedText>
            <ThemedText style={styles.title}>
                {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
            </ThemedText>
        </View>

        {/* follow button — absolutely positioned to top right */}
        <View style={styles.followButtonAbsolute}>
            {/*{incident.user_id === userId && (*/}
            {/*    <TouchableOpacity*/}
            {/*        onPress={onDelete}*/}
            {/*        style={{ alignItems: "center" }}*/}
            {/*    >*/}
            {/*        <Ionicons name="trash-outline" size={22} color="#FF3B30" />*/}
            {/*        <ThemedText style={[styles.followText, { color: '#FF3B30' }]}>Delete</ThemedText>*/}
            {/*    </TouchableOpacity>*/}
            {/*)}*/}

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
        position: "relative", // needed for absolute follow button
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
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 16,
    },
    followText: {
        fontSize: 12,
        color: "#a3a3a3",
        fontWeight: "600",
        textAlign: "center",
        marginTop: 2,
    },
})