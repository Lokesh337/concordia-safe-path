import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { Animated, TouchableOpacity, View, StyleSheet, Text, Platform } from 'react-native'
import { supabase } from '../lib/supabase'
import { useUser } from '../hooks/useUser'
import { useNetwork } from '../hooks/useNetwork'
import { useRouter } from 'expo-router'
import { Colors } from '../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { getDistance } from '../lib/helpers'
import * as Notifications from 'expo-notifications'
import * as Location from 'expo-location'
import Constants from 'expo-constants'

const isExpoGo = Constants.appOwnership === 'expo'

const NotificationsContext = createContext(null)

// ── Toast Banner ───────────────────────────────────────────────
const ToastBanner = ({ toast, onPress, onDismiss }) => {
    const translateY = useRef(new Animated.Value(-100)).current
    const opacity = useRef(new Animated.Value(0)).current

    useEffect(() => {
        if (!toast) return
        Animated.parallel([
            Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start()

        const timer = setTimeout(() => {
            Animated.parallel([
                Animated.timing(translateY, { toValue: -100, duration: 300, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]).start(() => onDismiss())
        }, 4000)

        return () => clearTimeout(timer)
    }, [toast])

    if (!toast) return null

    return (
        <Animated.View style={[styles.toast, { transform: [{ translateY }], opacity }]}>
            <TouchableOpacity style={styles.toastInner} onPress={onPress} activeOpacity={0.9}>
                <View style={styles.toastIcon}>
                    <Ionicons name="notifications" size={18} color="#fff" />
                </View>
                <View style={styles.toastContent}>
                    <Text style={styles.toastTitle}>New Notification</Text>
                    <Text style={styles.toastMessage} numberOfLines={1}>
                        {toast.message}
                    </Text>
                </View>
                <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
            </TouchableOpacity>
        </Animated.View>
    )
}

// ── Provider ───────────────────────────────────────────────────
export const NotificationsProvider = ({ children }) => {
    const { user, profile } = useUser()
    const { isOnline } = useNetwork()
    const router = useRouter()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState(null)

    useEffect(() => { profileRef.current = profile }, [profile])

    // track user location for distance-based filtering
    const locationRef = useRef(null)
    const profileRef = useRef(profile)

    useEffect(() => {
        let watcher
        ;(async () => {
            const { status } = await Location.requestForegroundPermissionsAsync()
            if (status !== 'granted') return
            watcher = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.Balanced, distanceInterval: 50 },
                (pos) => { locationRef.current = pos.coords }
            )
        })()
        return () => watcher?.remove()
    }, [])

    const fetchNotifications = useCallback(async () => {
        if (!user) return
        // skip fetch when offline — notifications list stays as-is from last session
        if (!isOnline) { setLoading(false); return }
        setLoading(true)
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                incidents (
                    id, type, severity, latitude, longitude,
                    verified, verification_status, description
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (!error) setNotifications(data || [])
        setLoading(false)
    }, [user, isOnline])

    const markAsRead = useCallback(async (notificationId) => {
        // optimistic update — skip the DB write if offline
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
        if (!isOnline) return
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
    }, [isOnline])

    const markAllAsRead = useCallback(async () => {
        if (!user) return
        // optimistic update — skip the DB write if offline
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        if (!isOnline) return
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)
    }, [user, isOnline])

    const unreadCount = notifications.filter(n => !n.read).length

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Realtime subscription + toast + local push
    useEffect(() => {
        if (!user) return
        const channel = supabase
            .channel('notifications-realtime')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${user.id}`,
                },
                (payload) => {
                    supabase
                        .from('notifications')
                        .select(`
                            *,
                            incidents (
                                id, type, severity, latitude, longitude,
                                verified, verification_status, description
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single()
                        .then(({ data }) => {
                            if (data) {
                                const incident = data.incidents

                                // ── distance-based pref ──
                                let distancePref = 'normal'
                                const userLoc = locationRef.current
                                if (userLoc && incident?.latitude && incident?.longitude) {
                                    const dist = getDistance(
                                        userLoc.latitude, userLoc.longitude,
                                        incident.latitude, incident.longitude
                                    )
                                    const normalRadius = profileRef.current?.distance_normal ?? 500
                                    const silentRadius = profileRef.current?.distance_silent ?? 1000

                                    if (dist > silentRadius) distancePref = 'muted'
                                    else if (dist > normalRadius) distancePref = 'silent'
                                }

                                // ── type-based pref ──
                                const prefKey = {
                                    protest: 'notif_protest',
                                    blockade: 'notif_road',
                                    construction: 'notif_construction',
                                    vandalism: 'notif_vandalism',
                                }[incident?.type]
                                const typePref = profileRef.current?.[prefKey] ?? 'normal'
                                const finalPref = typePref !== 'normal' ? typePref : distancePref

                                // distance muted — don't even show in list
                                if (distancePref === 'muted') return

                                // add to list (silent and normal both show in tray)
                                setNotifications(prev => [data, ...prev])

                                // only toast/push for normal
                                if (finalPref !== 'normal') return

                                setToast(data)

                                Notifications.scheduleNotificationAsync({
                                    content: {
                                        title: '🔔 New Incident Alert',
                                        body: data.message,
                                        data: { notificationId: data.id },
                                        ...(Platform.OS === 'android'
                                            ? { channelId: 'proximity-alerts' }
                                            : {}),
                                    },
                                    trigger: null,
                                }).catch(() => {})
                            }
                        })
                }
            )
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [user])

    return (
        <NotificationsContext.Provider value={{
            notifications,
            loading,
            unreadCount,
            markAsRead,
            markAllAsRead,
            fetchNotifications,
            locationRef
        }}>
            {children}

            <ToastBanner
                toast={toast}
                onPress={() => {
                    setToast(null)
                    router.push('/notifications')
                }}
                onDismiss={() => setToast(null)}
            />
        </NotificationsContext.Provider>
    )
}

export const useNotificationsContext = () => {
    const ctx = useContext(NotificationsContext)
    if (!ctx) throw new Error('useNotificationsContext must be used inside NotificationsProvider')
    return ctx
}

const styles = StyleSheet.create({
    toast: {
        position: 'absolute',
        top: 100,
        left: 16,
        right: 16,
        zIndex: 9999,
        elevation: 10,
    },
    toastInner: {
        backgroundColor: '#1a1a2e',
        borderRadius: 12,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderLeftWidth: 4,
        borderLeftColor: Colors.primary,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
    },
    toastIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: Colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    toastContent: {
        flex: 1,
    },
    toastTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
    toastMessage: {
        color: '#ffffffcc',
        fontSize: 12,
        marginTop: 2,
    },
})