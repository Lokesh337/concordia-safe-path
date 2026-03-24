import {
    View,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Keyboard,
    TouchableOpacity,
    Alert
} from "react-native"
import { useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useRouter } from 'expo-router'

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

// hook — all state and handlers live here
import { useIncidentDetail } from "../../../hooks/useIncidentDetail"
import { useNotificationsContext } from '../../../contexts/NotificationsContext'

// helpers
import { timeAgo, getDistance, formatDistance } from '../../../lib/helpers'
import { Colors } from '../../../constants/Colors'

const IncidentDetails = () => {
    const { id } = useLocalSearchParams()

    const {
        incident,
        userId,
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
        handleDelete,
    } = useIncidentDetail(id)


    const { locationRef } = useNotificationsContext()
    const userLocation = locationRef?.current
    const router = useRouter()

    // wait for incident to load
    if (!incident) {
        return (
            <ThemedView safe style={styles.container}>
                <ThemedLoader />
            </ThemedView>
        )
    }

    // drives progress bar step 2 and the "reported by others" badge threshold
    const netVotes = (incident.upvotes ?? 0) - (incident.downvotes ?? 0)

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={110}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

                <ThemedView style={styles.container}>

                    {/* HEADER — icon, title, severity, follow button */}
                    <IncidentHeader
                        incident={incident}
                        isFollowing={isFollowing}
                        followLoading={followLoading}
                        onFollow={handleFollow}
                        userId={userId}
                        onDelete={() => {
                            Alert.alert(
                                'Delete Incident',
                                'Are you sure you want to delete this incident? This cannot be undone.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: async () => {
                                            await handleDelete()
                                            router.back()
                                        },
                                    },
                                ]
                            )
                        }}
                    />

                    <Spacer height={10} />

                    {/* LOCATION */}
                    <View style={styles.locationContainer}>
                        <View style={{ flex: 1 }}>
                            <View style={styles.location}>
                                <Ionicons name="location" size={16} color="#B74949" />
                                {userLocation && incident.latitude && incident.longitude && (
                                    <ThemedText>
                                        {formatDistance(getDistance(userLocation.latitude, userLocation.longitude, incident.latitude, incident.longitude))} away
                                    </ThemedText>
                                )}
                            </View>

                            <Spacer height={10} />

                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <View style={styles.activeDot} />
                                    <ThemedText style={styles.time}>
                                        {(incident.user_id === userId ? "You reported this " : "Reported ") + timeAgo(incident.created_at)}
                                    </ThemedText>
                                </View>
                        </View>

                        <TouchableOpacity
                            style={styles.mapLink}
                            onPress={() => router.push({ pathname: '/map', params: { alertIncidentId: incident.id } })}
                        >
                            <Ionicons name="map-outline" size={24} color={Colors.primary} />
                            <ThemedText style={styles.mapLinkText}>View on Map</ThemedText>
                        </TouchableOpacity>
                    </View>

                    {/*<Spacer height={10} />*/}

                    {/*/!* TIME — green dot + relative timestamp *!/*/}
                    {/*<View style={{ flexDirection: "row", alignItems: "center" }}>*/}
                    {/*    <View style={styles.activeDot} />*/}
                    {/*    <ThemedText style={styles.time}>{"Reported " + timeAgo(incident.created_at)}</ThemedText>*/}
                    {/*</View>*/}

                    {/*<Spacer height={20} />*/}
                    <View style={styles.separator} />

                    {/* PROGRESS BAR — submitted → reported → verified → resolved */}
                    <IncidentProgress incident={incident} netVotes={netVotes} />

                    <View style={styles.separator} />

                    {/* INTERACTIONS — votes, witnessed, staff actions */}
                    <IncidentInteractions
                        incident={incident}
                        userVote={userVote}
                        voteLoading={voteLoading}
                        actionLoading={actionLoading}
                        isStaff={isStaff}
                        userId={userId}
                        onVote={handleVote}
                        onWitnessed={handleWitnessed}
                        onVerify={handleVerify}
                        onResolve={handleResolve}
                        onDelete={() => {
                            Alert.alert(
                                'Delete Incident',
                                'Are you sure you want to delete this incident? This cannot be undone.',
                                [
                                    { text: 'Cancel', style: 'cancel' },
                                    {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: async () => {
                                            await handleDelete()
                                            router.back()
                                        },
                                    },
                                ]
                            )
                        }}
                    />

                    <View style={styles.separator} />

                    {/* COMMENTS — list + input, realtime updates handled in hook */}
                    <CommentsSection
                        comments={comments}
                        commentText={commentText}
                        commentLoading={commentLoading}
                        onChangeText={setCommentText}
                        onSubmit={handleComment}
                    />

                </ThemedView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
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
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    mapLink: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 70,
        // paddingVertical: 0,
        paddingHorizontal: 4,
        gap: 4,
        marginLeft: 10,
    },
    mapLinkText: {
        fontSize: 11,
        color: Colors.primary,
        fontWeight: '500',
        textAlign: 'center',
    },
})