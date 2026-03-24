import { View, ScrollView, TextInput, TouchableOpacity, StyleSheet, useWindowDimensions } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import ThemedText from "../ThemedText"
import Spacer from "../Spacer"
import { timeAgo } from "../../lib/helpers"
import { useTheme } from '../../contexts/ThemeContext'


// purely presentational — realtime subscription and fetch logic live in useIncidentDetail
const CommentsSection = ({ comments, commentText, commentLoading, onChangeText, onSubmit }) => {
    const { height } = useWindowDimensions()
    const { colorScheme } = useTheme()
    const isDark = colorScheme === 'dark'

    return (
        <View style={styles.container}>
            <ThemedText title>Comments</ThemedText>
            <Spacer height={10} />

            {/* scrollable comment list, capped at 30% of screen height */}
            <ScrollView
                keyboardShouldPersistTaps="handled"
                style={[styles.commentsContainer, { maxHeight: height * 0.3 }]}
            >
                {comments.length === 0 && (
                    <ThemedText style={styles.noComments}>No comments yet.</ThemedText>
                )}
                {comments.map((c) => (
                    <View key={c.id} style={[styles.commentItem, isDark && { borderBottomColor: '#3a3650' }]}>
                        <View style={styles.commentRow}>
                            <Ionicons name="person-circle" size={36} color={isDark ? '#9591a5' : '#6B7280'} style={styles.profileIcon} />
                            <View style={[styles.commentContentWrapper, isDark && { backgroundColor: '#2f2b3d' }]}>
                                {/* username joined from profiles via FK — falls back to 'Unknown' */}
                                <ThemedText style={styles.commentUser}>
                                    {c.profiles?.username ?? 'Unknown'}
                                </ThemedText>
                                <Spacer height={4} />
                                <ThemedText style={styles.commentContent}>{c.content}</ThemedText>
                                <ThemedText style={styles.commentTime}>{timeAgo(c.created_at)}</ThemedText>
                            </View>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* add comment — send on button press or keyboard return */}
            <View style={[styles.addCommentContainer, isDark && { backgroundColor: '#252231', borderTopColor: '#3a3650' }]}>
                <TextInput
                    style={[styles.commentInput, isDark && { backgroundColor: '#2f2b3d', borderColor: '#3a3650', color: '#d4d4d4' }]}
                    placeholder="Add a comment..."
                    placeholderTextColor={isDark ? '#9591a5' : '#999'}
                    value={commentText}
                    onChangeText={onChangeText}
                    returnKeyType="send"
                    onSubmitEditing={onSubmit}
                />
                <TouchableOpacity
                    style={[styles.commentButton, (!commentText.trim() || commentLoading) && styles.commentButtonDisabled]}
                    onPress={onSubmit}
                    disabled={!commentText.trim() || commentLoading}
                >
                    <Ionicons name="send" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default CommentsSection

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    commentsContainer: {
        marginBottom: 10,
    },
    noComments: {
        opacity: 0.5,
        fontSize: 13,
        textAlign: 'center',
        marginTop: 16,
    },
    commentItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E0E0E0",
        borderRadius: 7,
        paddingHorizontal: 12,
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
    commentUser: {
        fontWeight: "600",
        fontSize: 14,
    },
    commentContent: {
        fontSize: 14,
        marginBottom: 4,
    },
    commentTime: {
        fontSize: 12,
        opacity: 0.6,
    },
    addCommentContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: "#E0E0E0",
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        marginHorizontal: -20,
        paddingHorizontal: 20,
    },
    commentInput: {
        flex: 1,
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 20,
        paddingHorizontal: 12,
        backgroundColor: "#fff",
        color: "#000",
    },
    commentButton: {
        backgroundColor: "#59A7E7",
        padding: 10,
        borderRadius: 20,
    },
    commentButtonDisabled: {
        opacity: 0.4,
    },
})