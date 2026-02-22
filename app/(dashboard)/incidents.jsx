import {FlatList, Pressable, StyleSheet, View} from 'react-native'
import {useIncidents} from '../../hooks/useIncidents'
import {useRouter} from 'expo-router'
import {useEffect, useState} from 'react'
import {Colors} from '../../constants/Colors'
import * as Location from 'expo-location'


import Spacer from "../../components/Spacer"
import ThemedText from "../../components/ThemedText"
import ThemedView from "../../components/ThemedView"
import IncidentCard from "../../components/IncidentCard";
import {Ionicons} from "@expo/vector-icons";

const SEVERITIES = ['high', 'medium', 'low']

const SEVERITY_COLORS = {
    high: '#ff6b6b',
    medium: '#ffd93d',
    low: '#6bcb77',
}



const Incidents = () => {
    const { incidents } = useIncidents()
    const router = useRouter()
    const [filter, setFilter] = useState(null)
    const [sortBy, setSortBy] = useState('time') // 'time' or 'distance'
    const [filtersExpanded, setFiltersExpanded] = useState(false)
    const [userCoords, setUserCoords] = useState(null)



    const filtered = filter ? incidents.filter(i => i.severity === filter) : incidents
    const ongoing = filtered
        .filter(i => i.status === 'active')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))        // all active incidents

    const sortFn = (a, b) => {
        if (sortBy === 'distance' && userCoords) {
            return getDistance(userCoords.latitude, userCoords.longitude, a.latitude, a.longitude)
                - getDistance(userCoords.latitude, userCoords.longitude, b.latitude, b.longitude)
        }
        return new Date(b.created_at) - new Date(a.created_at)
    }

    const active = filtered.filter(i => i.status === 'active').sort(sortFn)
    const recent = filtered.filter(i => i.status === 'resolved').sort(sortFn)


    useEffect(() => {
        async function getLocation() {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') return
            const current = await Location.getCurrentPositionAsync({})
            setUserCoords(current.coords)
        }
        getLocation()
    }, [])

    function getDistance(lat1, lon1, lat2, lon2) {
        return Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lon2 - lon1, 2))
    }


    return (
        <ThemedView style={styles.container}>
            {/* Filter toggle button */}
            <Pressable
                style={styles.filterToggle}
                onPress={() => setFiltersExpanded(!filtersExpanded)}
            >
                <Ionicons name="options-outline" size={16} color={Colors.primary} />
                <ThemedText style={[styles.pillText, { color: Colors.primary }]}>Filters & Sort</ThemedText>
                <Ionicons
                    name={filtersExpanded ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={Colors.primary}
                    style={{ marginLeft: 'auto' }}
                />
            </Pressable>

            {/* Collapsible content */}
            {filtersExpanded && (
                <>
                    <View style={styles.filters}>
                        <ThemedText style={styles.filterLabel}>Filters:</ThemedText>
                        <View style={styles.pillGroup}>
                            {SEVERITIES.map((s) => (
                                <Pressable
                                    key={s}
                                    onPress={() => setFilter(filter === s ? null : s)}
                                    style={[
                                        styles.pill,
                                        { borderColor: SEVERITY_COLORS[s] },
                                        filter === s && { backgroundColor: SEVERITY_COLORS[s] }
                                    ]}
                                >
                                    <ThemedText style={[styles.pillText, filter === s && { color: '#000' }]}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    <View style={styles.filters}>
                        <ThemedText style={styles.filterLabel}>Sort by:</ThemedText>
                        <View style={styles.pillGroup}>
                            {['time', 'distance'].map((s) => (
                                <Pressable
                                    key={s}
                                    onPress={() => setSortBy(s)}
                                    style={[
                                        styles.pill,
                                        { borderColor: Colors.primary },
                                        sortBy === s && { backgroundColor: Colors.primary }
                                    ]}
                                >
                                    <Ionicons
                                        name={s === 'time' ? 'time-outline' : 'location-outline'}
                                        size={14}
                                        color={sortBy === s ? '#fff' : Colors.primary}
                                    />
                                    <ThemedText style={[styles.pillText, { color: sortBy === s ? '#fff' : Colors.primary }]}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </ThemedText>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                </>
            )}

            <FlatList
                data={recent}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <ThemedText style={styles.empty}>No incidents reported.</ThemedText>
                }
                ListHeaderComponent={
                    <>
                        {/* Ongoing section */}
                        {ongoing.length > 0 && (
                            <>
                                <View style={styles.sectionHeader}>
                                    <View style={styles.dot} />
                                    <ThemedText style={styles.sectionTitle}>ONGOING INCIDENTS</ThemedText>
                                </View>
                                {ongoing.map((item) => (
                                    <IncidentCard
                                        key={item.id}
                                        item={item}
                                        onPress={() => router.push(`/incidents/${item.id}`)}
                                    />
                                ))}
                                <Spacer height={10} />
                                <ThemedText style={styles.sectionTitle}>Recent Incidents</ThemedText>
                                <Spacer height={6} />
                            </>
                        )}
                    </>
                }
                renderItem={({ item }) => (
                    <IncidentCard
                        item={item}
                        onPress={() => router.push(`/incidents/${item.id}`)}
                    />
                )}
            />
        </ThemedView>
    )
}

export default Incidents

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    filterLabel: {
        fontSize: 14,
        opacity: 0.6,
        marginRight: 4,
    },
    filterPill: {
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    filterText: {
        fontSize: 13,
        fontWeight: '600',
    },
    list: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: Colors.primary,
    },
    sectionTitle: {
        fontWeight: 'bold',
        fontSize: 13,
        opacity: 0.7,
        letterSpacing: 0.5,
    },
    card: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 6,
        padding: 12,
        alignItems: 'flex-start',
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    cardContent: {
        flex: 1,
        gap: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTitle: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    cardTime: {
        fontSize: 12,
        opacity: 0.5,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    location: {
        fontSize: 12,
        opacity: 0.6,
    },
    description: {
        fontSize: 13,
        opacity: 0.7,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 2,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '500',
    },
    empty: {
        textAlign: 'center',
        marginTop: 60,
        opacity: 0.5,
    },
    filters: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 6,
        gap: 8,
    },
    pillGroup: {
        flex: 1,
        flexDirection: 'row',
        gap: 8,
    },
    pill: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1.5,
    },
    pillText: {
        fontSize: 13,
        fontWeight: '600',
    },
    filterToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#ffffff22',
    },
})