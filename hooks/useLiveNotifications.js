import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useUser } from './useUser'

export const useNotifications = () => {
    const { user } = useUser()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                incidents (
                    id, type, severity, latitude, longitude, verified, verification_status, description
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
            .eq('read', false) // only update unread ones

        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    }, [user])

    const unreadCount = notifications.filter(n => !n.read).length

    useEffect(() => {
        fetchNotifications()
    }, [fetchNotifications])

    // Realtime subscription
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
                    // Fetch the full notification with incident data
                    supabase
                        .from('notifications')
                        .select(`
                            *,
                            incidents (
                                id, type, severity, latitude, longitude, verified, verification_status, description
                            )
                        `)
                        .eq('id', payload.new.id)
                        .single()
                        .then(({ data }) => {
                            if (data) setNotifications(prev => [data, ...prev])
                        })
                }
            )
            .subscribe()

        return () => supabase.removeChannel(channel)
    }, [user])

    return { notifications, loading, unreadCount, markAsRead, markAllAsRead, fetchNotifications }
}