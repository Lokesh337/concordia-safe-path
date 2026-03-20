import { View, StyleSheet } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

// themed
import ThemedView from "../../../components/ThemedView"
import ThemedLoader from "../../../components/ThemedLoader"
import Spacer from "../../../components/Spacer"
import ThemedText from "../../../components/ThemedText"

// incident components
import IncidentHeader from "../../../components/incident/IncidentHeader"
import IncidentProgress from "../../../components/incident/IncidentProgress"
import IncidentInteractions from "../../../components/incident/IncidentInteractions"
import CommentsSection from "../../../components/incident/CommentsSection"

// hook
import { useIncidentDetail } from "../../../hooks/useIncidentDetail"

// helpers
import { getNearestBuilding, timeAgo } from "../../../lib/helpers"

const IncidentDetails = () => {
    const { id } = useLocalSearchParams()

    const {
        incident,
        isFollowing,
        followLoading,
        userVote,
        voteLoading,
        actionLoading,
        comments,
        commentText,
        setCommentText,
        commentLoading,
        isStaff,
        handleVote,
        handleWitnessed,
        handleFollow,
        handleVerify,
        handleResolve,
        handleComment,
    } = useIncidentDetail(id)

    if (!incident) {
        return (
            <ThemedView safe style={styles.container}>
                <ThemedLoader />
            </ThemedView>
        )
    }

    const netVotes = (incident.upvotes ?? 0) - (incident.downvotes ?? 0)

    return (
        <ThemedView safe style={styles.container}>

            <IncidentHeader
                incident={incident}
                isFollowing={isFollowing}
                followLoading={followLoading}
                onFollow={handleFollow}
            />

            <Spacer height={10} />

            {/* LOCATION */}
            <View style={styles.location}>
                <Ionicons name="location" size={16} color="#B74949" />
                <ThemedText>
                    {incident.latitude && incident.longitude
                        ? getNearestBuilding(incident.latitude, incident.longitude)
                        : "Unknown location"}
                </ThemedText>
                <ThemedText>, 70m away</ThemedText>
            </View>

            <Spacer height={10} />

            {/* TIME */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View style={styles.activeDot} />
                <ThemedText style={styles.time}>{"Reported " + timeAgo(incident.created_at)}</ThemedText>
            </View>

            <Spacer height={20} />
            <View style={styles.separator} />

            <IncidentProgress incident={incident} netVotes={netVotes} />

            <View style={styles.separator} />

            <IncidentInteractions
                incident={incident}
                userVote={userVote}
                voteLoading={voteLoading}
                actionLoading={actionLoading}
                isStaff={isStaff}
                onVote={handleVote}
                onWitnessed={handleWitnessed}
                onVerify={handleVerify}
                onResolve={handleResolve}
            />

            <View style={styles.separator} />

            <CommentsSection
                comments={comments}
                commentText={commentText}
                commentLoading={commentLoading}
                onChangeText={setCommentText}
                onSubmit={handleComment}
            />

        </ThemedView>
    )
}

export default IncidentDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 15,
    },
    separator: {
        height: 1,
        backgroundColor: "#E0E0E0",
        marginVertical: 10,
    },
    location: {
        flexDirection: "row",
        gap: 6,
        alignItems: "center",
    },
    activeDot: {
        width: 15,
        height: 15,
        borderRadius: 10,
        backgroundColor: "#24963F",
    },
    time: {
        fontSize: 14,
        paddingLeft: 7,
    },
})