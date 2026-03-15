import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { useEffect, useState } from "react"
import { Ionicons } from "@expo/vector-icons"
import { supabase } from "../../../lib/supabase"

// themed
import ThemedText from "../../../components/ThemedText"
import ThemedView from "../../../components/ThemedView"
import Spacer from "../../../components/Spacer"
import ThemedLoader from "../../../components/ThemedLoader"

// constants
import { Colors } from "../../../constants/Colors"
import { Icons } from "../../../constants/Icons"

// hooks + helpers
import { useIncidents } from "../../../hooks/useIncidents"
import { getNearestBuilding, timeAgo } from "../../../lib/helpers"

const IncidentDetails = () => {

    const [incident, setIncident] = useState(null)
    const { id } = useLocalSearchParams()
    const { fetchIncidentById } = useIncidents()
    const [isFollowing, setIsFollowing] = useState(false); // track follow state

    useEffect(() => {
        async function loadIncident() {
            const data = await fetchIncidentById(id)
            setIncident(data)
        }
        loadIncident()
    }, [id])

    const handleUpvote = async () => {
        // TODO: Implement upvote logic using the incident_upvotes table in Supabase
        // - Check if the current user has already upvoted
        // - If not, insert { incident_id, user_id, upvoted: true } into incident_upvotes
        // - If yes, optionally toggle to remove their upvote
        // - Then fetch the total number of upvotes and update state
        console.log("Upvote clicked — TODO: connect to Supabase incident_upvotes table")
    }

        

    if (!incident) {
        return (
            <ThemedView safe style={styles.container}>
                <ThemedLoader />
            </ThemedView>
        )
    }

    return (
        <ThemedView safe style={styles.container}>

            {/* ICON */}
            {/* HEADER */}
            <View style={styles.header}>
            {/* ICON */}
            <View
                style={[
                styles.iconBox,
                { backgroundColor: Colors.type[incident.type] ?? "#888" },
                ]}
            >
                <Ionicons
                name={Icons.type[incident.type] ?? "alert-circle"}
                size={36}
                color="#fff"
                />
            </View>

            {/* TEXT COLUMN */}
            <View style={styles.textColumn}>
                {/* SEVERITY */}
                <ThemedText style={styles.severityDisplay}>
                {incident.severity.charAt(0).toUpperCase() +
                    incident.severity.slice(1) +
                    " tension"}
                </ThemedText>

                {/* TITLE */}
                <ThemedText style={styles.title}>
                {incident.type.charAt(0).toUpperCase() + incident.type.slice(1)}
                </ThemedText>
            </View>

            {/* FOLLOW BUTTON - absolutely positioned */}
            <View style={styles.followButtonAbsolute}>
            <TouchableOpacity
                onPress={() => {
                setIsFollowing(!isFollowing);
                // TODO: implement follow logic in Supabase
                console.log(isFollowing ? "Unfollow clicked!" : "Follow clicked!");
                }}
                style={{ alignItems: "center" }} // keep icon + text centered
            >
                {/* Star icon stays fixed */}
                <Ionicons
                name="star"
                size={24}
                color={isFollowing ? "#FFD700" : "#6B7280"}
                />
                {/* Text below the star */}
                <ThemedText style={styles.followText}>
                {isFollowing ? "Following" : "Follow"}
                </ThemedText>
            </TouchableOpacity>
            </View>
            </View>
             <Spacer height={10} />


            {/* LOCATION */}
            <View style={styles.location}>
                <Ionicons name="location" size={16} color="B74949"/>
                <ThemedText>
                    {incident.latitude && incident.longitude
                        ? getNearestBuilding(incident.latitude, incident.longitude)
                        : "Unknown location"}
                </ThemedText>
                <ThemedText> 
                    {/* TODO: Calculate the actual distance from the user's location */}
                    , 70m away
                </ThemedText>
            </View>


             <Spacer height={10} />

            {/* TIME */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
                {/* Green circle */}
                <View style={{
                    width: 15,
                    height: 15,
                    borderRadius: 10,
                    backgroundColor: "#24963F"
                }} />

                {/* Reported text */}
                <ThemedText style={styles.time}>
                    {"Reported " + timeAgo(incident.created_at)}
                </ThemedText>
            </View>

            <Spacer height={20} />


            {/* DESCRIPTION OPTIONAL */}
            {/*
            <ThemedText title>
                Description
            </ThemedText>

            <ThemedText style={styles.description}>
                {incident.description}
            </ThemedText>
            */}
            <View style={styles.separator} />

            {/* INCIDENT PROGRESS */}


            <View style={styles.progressWrapper}>

                {/* Grey base line */}
                <View style={styles.progressLineBackground} />

                {/* Green progress line */}
                <View
                    style={[
                        styles.progressLineFill,
                        {
                            width: `${
                                (incident.verified ? 75 : incident.upvotes > 0 ? 50 : 25) +
                                (incident.status === "resolved" ? 25 : 0)
                            }%`
                        }
                    ]}
                />

                {/* Steps */}
                <View style={styles.progressSteps}>

                    {/* STEP 1 */}
                    <View style={styles.step}>
                        <View style={[styles.circle, styles.circleComplete]}>
                            <Ionicons name="checkmark" size={14} color="#fff" />
                        </View>
                        <ThemedText style={styles.stepLabel}>Submitted</ThemedText>
                    </View>

                    {/* STEP 2 */}
                    <View style={styles.step}>
                        <View style={[
                            styles.circle,
                            incident.upvotes > 0 && styles.circleComplete
                        ]}>
                            {incident.upvotes > 0 &&
                                <Ionicons name="checkmark" size={14} color="#fff" />
                            }
                        </View>
                        <ThemedText style={styles.stepLabel}>Reported By Others</ThemedText>
                    </View>

                    {/* STEP 3 */}
                    <View style={styles.step}>
                        <View style={[
                            styles.circle,
                            incident.verified === true && styles.circleComplete
                        ]}>
                            {incident.verified === true &&
                                <Ionicons name="checkmark" size={14} color="#fff" />
                            }
                        </View>
                        <ThemedText style={styles.stepLabel}>Verified</ThemedText>
                    </View>

                    {/* STEP 4 */}
                    <View style={styles.step}>
                        <View style={[
                            styles.circle,
                            incident.status === "resolved" && styles.circleComplete
                        ]}>
                            {incident.status === "resolved" &&
                                <Ionicons name="checkmark" size={14} color="#fff" />
                            }
                        </View>
                        <ThemedText style={styles.stepLabel}>Resolved</ThemedText>
                    </View>

                </View>

            </View>

            <View style={styles.separator} />


           {/* INCIDENT INTERACTIONS */}

            <View style={styles.interactionRow}>

                {/* UPVOTES */}
                <View style={styles.actionWrapper}>
                    <View style={styles.actionItem}>
                        <Ionicons
                            name="thumbs-up"
                            size={22}
                            color="#6B7280"
                            onPress={() => {
                                // TODO: handle upvote logic using the incident_upvotes table in Supabase
                            }}
                        />
                        <ThemedText>{incident.upvotes}</ThemedText>
                    </View>
                    <ThemedText style={styles.actionLabel}> Upvotes</ThemedText>
                </View>

                {/* DOWNVOTES */}
                <View style={styles.actionWrapper}>
                    <View style={styles.actionItem}>
                        <Ionicons
                            name="thumbs-down"
                            size={22}
                            color="#6B7280"
                            onPress={() => {
                                // TODO: update downvotes in Supabase
                            }}
                        />
                        <ThemedText>{incident.downvotes}</ThemedText> // TODO add downvotes to Supabase and fetch it in API
                    </View>
                    <ThemedText style={styles.actionLabel}> Downvotes</ThemedText>
                </View>

                {/* WITNESSED */}
                <View style={styles.actionWrapper}>
                    <View style={styles.actionItem}>
                        <Ionicons
                            name="eye"
                            size={22}
                            color="#6B7280"
                            onPress={() => {
                                // TODO: add user id to followed_by array in Supabase
                            }}
                        />
                        <ThemedText>{incident.followed_by?.length ?? 0}</ThemedText>
                    </View>
                    
                    <ThemedText style={styles.actionLabel}> Witnessed It</ThemedText>
                </View>

                {/* STAFF ACTIONS */}
                
                
                <View style={styles.staffButton}>
                    <ThemedText style={styles.staffButtonText}>
                        Verify
                    </ThemedText>
                    <View style={[styles.circleStaffButton]}>
                            <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                </View>

                <View style={styles.staffButton}>
                    <ThemedText style={styles.staffButtonText}>
                        Resolve
                    </ThemedText>
                    <View style={[styles.circleStaffButton]}>
                            <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                </View>

            </View>

            <View style={styles.separator} />

          {/* --- COMMENTS SECTION --- */}
            <ThemedText title>Comments</ThemedText>
            <Spacer height={10} />


            <ScrollView style={styles.commentsContainer}>
                <View style={styles.commentItem}>
                    <View style={styles.commentRow}>
                        <Ionicons name="person-circle" size={36} color="#6B7280" style={styles.profileIcon} />
                        <View>
                            <View style={styles.commentContentWrapper}>
                                <ThemedText style={styles.commentUser}>Alice P</ThemedText>
                                <Spacer height={4} />
                                <ThemedText style={styles.commentContent}>
                                    I saw this too! Be careful around this area.
                                </ThemedText>
                                <ThemedText style={styles.commentTime}>1 hours ago</ThemedText>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.commentItem}>
                    <View style={styles.commentRow}>
                        <Ionicons name="person-circle" size={36} color="#6B7280" style={styles.profileIcon} />
                        <View>
                            <View style={styles.commentContentWrapper}>
                                <ThemedText style={styles.commentUser}>Liam M</ThemedText>
                                <Spacer height={4} />
                                <ThemedText style={styles.commentContent}>
                                    I saw this too! 
                                </ThemedText>
                                <ThemedText style={styles.commentTime}>2 hours ago</ThemedText>
                            </View>
                           
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* ADD COMMENT INPUT (just UI) */}
            <View style={styles.addCommentContainer}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment..."
                    value={""} // just UI, no state yet
                    editable={false} // optional: shows input but doesn't allow typing yet
                />
                <TouchableOpacity style={styles.commentButton}>
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>


        </ThemedView>
    )
}

export default IncidentDetails

const styles = StyleSheet.create({
        header: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10
    },

    textColumn: {
        flexDirection: "column",
        justifyContent: "flex-start",


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
        marginBottom: 15
    },

    separator: {
        height: 1,
        backgroundColor: "#E0E0E0", // light grey
        marginVertical: 10,          // spacing above and below the line
    },

    header: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 15,
        position: "relative", // needed for absolute child
    },

    followButtonAbsolute: {
       position: "absolute",
        right: 10,          // fixed distance from right
        top: 5,
        width: 60,          // fixed width so text stays centered
        height: 55,         // enough height for icon + text including descenders
        alignItems: "center",
        justifyContent: "flex-start", // icon starts at top, text below
    },

    followText: {
        fontSize: 12,
        color: "#a3a3a3",
        fontWeight: "600",
        textAlign: "center",   // ensure text is always centered
        marginTop: 2,          // small spacing below icon
    },

    actionWrapper: {
        alignItems: "center",
        gap: 4
    },



    container: {
        flex: 1,
        paddingHorizontal: 20, // only left/right
        paddingTop: 15,          // remove top padding
    },

    iconBox: {
        width: 80,
        height: 80,
        borderRadius: 20,
        justifyContent: "center",
        alignItems: "center"
    },

    title: {
        fontSize: 24,
        fontWeight: "bold"
    },

    time: {
        fontSize: 14,
        paddingLeft: 7,
    },

    location: {
        flexDirection: "row",
        fontSize: 14,
        gap: 6,
        alignItems: "center",
    },

    description: {
        fontSize: 16,
        lineHeight: 24
    },


    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 20,
        alignSelf: "flex-start"
    },

    progressWrapper: {
    position: "relative",
    },

    progressLineBackground: {
        position: "absolute",
        top: 9,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: "#DADADA"
    },

    progressLineFill: {
        position: "absolute",
        top: 9,
        left: 0,
        height: 4,
        backgroundColor: "#24963F"
    },

    progressSteps: {
        flexDirection: "row",
        justifyContent: "space-between"
    },

    step: {
        alignItems: "center",
        width: 80
    },

    circle: {
        width: 20,
        height: 20,
        borderRadius: 14,
        borderWidth: 2,
        borderColor: "#DADADA",
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center"
    },

    circleComplete: {
        backgroundColor: "#24963F",
        borderColor: "#24963F"
    },

    stepLabel: {
        fontSize: 12,
        marginTop: 6,
        textAlign: "center"
    },

    interactionRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6
    },

    actionItem: {
        flexDirection: "row", 
        alignItems: "center", 
        gap: 4

    },

    actionLabel: {
        fontSize: 12,
        color: "#67686a"
    },

    circleStaffButton: {
        width: 20,
        height: 20,
        left: 3,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#fff",
        alignItems: "center"
    },

    staffButton: {
        paddingHorizontal: 10,
        paddingVertical: 12,
        borderRadius: 8,
        backgroundColor: "#59A7E7",
        flexDirection: "row",
        alignContent: "center",
        alignItems: "center",
    },

    staffButtonText: {
        color: "#fff",
        fontWeight: "400",
        fontSize: 13
    },

    commentsContainer: {
        maxHeight: 200,   // scrollable area
        marginBottom: 10,
    },

    commentItem: {        
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        borderRadius: 7,
        paddingHorizontal: 12,
        flexDirection: "row",
    },

    commentUser: {
        fontWeight: "600",
        fontSize: 14,
    },

    commentContent: {
        fontSize: 14,
        marginBottom: 4,
        width: 275,

    },

    commentTime: {
        fontSize: 12,
    },

    addCommentContainer: {
        position: "absolute",
        bottom: 5,
        left: 10,
        right: 10,
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",

    },

    commentInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
    },

    commentButton: {
        backgroundColor: "#59A7E7",
        padding: 10,
        borderRadius: 20,
    },

    commentRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        gap: 10,

    },

    profileIcon: {
        marginTop: 5,
    },

    commentContentWrapper: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 8,
    },
})