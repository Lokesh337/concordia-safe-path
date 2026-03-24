import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useUser } from '../../../hooks/useUser';
import { Colors } from '../../../constants/Colors';
import ThemedView from '../../../components/ThemedView';
import ThemedText from '../../../components/ThemedText';
import ThemedButton from '../../../components/ThemedButton';
import {useTheme} from "../../../contexts/ThemeContext";

const Profile = () => {
    const { user, profile, logout } = useUser();
    const router = useRouter();
    const { colorScheme } = useTheme()
    const theme = Colors[colorScheme] ?? Colors.light;

    const handleLogout = () => {
        Alert.alert('Log Out', 'Are you sure you want to log out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Log Out', style: 'destructive', onPress: logout },
        ]);
    };

    const displayName = profile?.username ?? user?.email ?? 'Student';
    const email = user?.email ?? '';
    const username = profile?.username ?? '—';

    return (
        <ThemedView style={styles.screen}>
            <ScrollView
                contentContainerStyle={styles.body}
                showsVerticalScrollIndicator={false}
            >
                {/* ── avatar ─────────────────────────────────────── */}
                <View style={styles.avatarWrapper}>
                    <View style={[styles.avatarCircle, { backgroundColor: theme.uiBackground }]}>
                        <Ionicons name="person" size={48} color={theme.iconColor} />
                    </View>
                    <TouchableOpacity
                        style={styles.cameraBadge}
                        onPress={() => Alert.alert('Not implemented', 'Profile photo upload is not available yet.')}
                    >
                        <Ionicons name="camera" size={13} color="#fff" />
                    </TouchableOpacity>
                </View>

                <ThemedText style={styles.displayName}>{displayName}</ThemedText>

                {/* ── info card ──────────────────────────────────── */}
                <View style={[styles.card, { backgroundColor: theme.uiBackground }]}>
                    <InfoRow
                        label="Username"
                        value={username}
                        theme={theme}
                        onEdit={() => Alert.alert('Not implemented', 'Editing username is not available yet.')}
                    />
                    <View style={[styles.divider, { backgroundColor: Colors.divider }]} />
                    <InfoRow
                        label="Email"
                        value={email}
                        theme={theme}
                        onEdit={() => Alert.alert('Not implemented', 'Editing email is not available yet.')}
                    />

                    <View style={[styles.divider, { backgroundColor: Colors.divider }]} />
                    <InfoRow
                        label="Password"
                        value="••••••••"
                        theme={theme}
                        onEdit={() => Alert.alert('Not implemented', 'Changing password is not available yet.')}
                    />

                </View>

                {/* ── settings ───────────────────────────────────── */}
                <ThemedText style={styles.sectionLabel}>Settings</ThemedText>

                <View style={[styles.card, { backgroundColor: theme.uiBackground }]}>
                    <NavRow
                        label="User Preferences"
                        onPress={() => router.push('/menu/preferences')}
                        theme={theme}
                    />
                    <View style={[styles.divider, { backgroundColor: Colors.divider }]} />
                    <NavRow
                        label="Emergency Resources"
                        onPress={() => router.push('/menu/resources')}
                        theme={theme}
                    />
                </View>

                {/* ── log out ────────────────────────────────────── */}
                <ThemedButton
                    onPress={handleLogout}
                    style={styles.logoutBtn}
                >
                    <Ionicons name="log-out-outline" size={18} color={Colors.warning} />
                    <Text style={styles.logoutText}>Log Out</Text>
                </ThemedButton>
            </ScrollView>
        </ThemedView>
    );
};

export default Profile;

// ─── sub-components ──────────────────────────────────────────────────────────

function InfoRow({ label, value, theme, onEdit }) {
    return (
        <View style={styles.row}>
            <ThemedText style={styles.rowLabel}>{label}</ThemedText>
            <View style={styles.rowRight}>
                <ThemedText style={[styles.rowValue, { color: theme.text }]}>
                    {value}
                </ThemedText>
                <TouchableOpacity onPress={onEdit}>
                    <Ionicons name="pencil-outline" size={22} color={theme.iconColor} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

function NavRow({ label, onPress, theme }) {
    return (
        <TouchableOpacity style={styles.row} onPress={onPress}>
            <ThemedText style={styles.rowLabel}>{label}</ThemedText>
            <Ionicons name="chevron-forward" size={18} color={theme.iconColor} />
        </TouchableOpacity>
    );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    body: {
        alignItems: 'center',
        paddingTop: 28,
        paddingBottom: 40,
        paddingHorizontal: 20,
    },

    // avatar
    avatarWrapper: {
        position: 'relative',
        marginBottom: 10,
    },
    avatarCircle: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 2,
        right: 2,
        backgroundColor: Colors.primary,
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    displayName: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 24,
    },

    // card
    card: {
        width: '100%',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    divider: {
        height: 1,
    },

    // rows
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    rowLabel: {
        fontSize: 15,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rowValue: {
        fontSize: 15,
    },

    // section label
    sectionLabel: {
        alignSelf: 'flex-start',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 10,
    },

    // logout
    logoutBtn: {
        width: '100%',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.warning,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 8,
    },
    logoutText: {
        color: Colors.warning,
        fontSize: 15,
        fontWeight: '600',
    },
});