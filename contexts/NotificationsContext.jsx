import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { Animated, TouchableOpacity, View, StyleSheet, Text, Platform } from 'react-native'
import { supabase } from '../lib/supabase'
import { useUser } from '../hooks/useUser'
import { useRouter } from 'expo-router'
import { Colors } from '../constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
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
    const router = useRouter()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState(null)

    const fetchNotifications = useCallback(async () => {
        if (!user) return
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
    }, [user])

    const markAsRead = useCallback(async (notificationId) => {
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId)
        setNotifications(prev =>
            prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
        )
    }, [])

    const markAllAsRead = useCallback(async () => {
        if (!user) return
        await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', user.id)
            .eq('read', false)
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }, [user])

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
                                setNotifications(prev => [data, ...prev])

                                // check user preference for this incident type
                                const prefKey = {
                                    protest: 'notif_protest',
                                    blockade: 'notif_road',
                                    construction: 'notif_construction',
                                    vandalism: 'notif_vandalism',
                                }[data.incidents?.type]
                                const pref = profile?.[prefKey] ?? 'normal'

                                if (pref === 'normal') {
                                    setToast(data)

                                    // Fire local notification (works in Expo Go)
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
    top: 100,  // ← increase from 60 to push below the header
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 10,
},
    toastInner: {
    backgroundColor: '#1a1a2e',  // ← darker, distinct from header
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderLeftWidth: 4,           // ← add accent border
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