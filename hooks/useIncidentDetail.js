import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useIncidents } from './useIncidents'
import { useUser } from './useUser'

export function useIncidentDetail(id) {
    const { fetchIncidentById } = useIncidents()
    const { user, profile } = useUser()

    const [incident, setIncident] = useState(null)
    const [isFollowing, setIsFollowing] = useState(false)
    const [followLoading, setFollowLoading] = useState(false)

    const [userVote, setUserVote] = useState(null) // 'up' | 'down' | 'witnessed' | null
    const [voteLoading, setVoteLoading] = useState(false)

    const [actionLoading, setActionLoading] = useState(false)

    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)

    // ─── load incident ────────────────────────────────────────
    useEffect(() => {
        async function loadIncident() {
            if (!id) return
            const data = await fetchIncidentById(id)
            if (!data) return
            setIncident(data)
            setIsFollowing(data.followed_by?.includes(user?.id) ?? false)
        }
        loadIncident()
    }, [id])

    // ─── load user's existing vote ────────────────────────────
    useEffect(() => {
        async function loadUserVote() {
            if (!user?.id) return
            const { data } = await supabase
                .from('incident_votes')
                .select('vote')
                .eq('incident_id', id)
                .eq('user_id', user.id)
                .maybeSingle()
            if (data) setUserVote(data.vote)
        }
        loadUserVote()
    }, [id, user?.id])

    // ─── realtime: incident row ───────────────────────────────
    useEffect(() => {
        const channel = supabase
            .channel(`incident-${id}`)
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'incidents', filter: `id=eq.${id}` },
                (payload) => {
                    __DEV__ && console.log('[useIncidentDetail] realtime update')
                    setIncident(payload.new)
                }
            )
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [id])

    // ─── load + realtime: comments ────────────────────────────
    useEffect(() => {
        if (!id) return
        fetchComments()
    }, [id])

    useEffect(() => {
        const channel = supabase
            .channel(`comments-${id}`)
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'comments', filter: `incident_id=eq.${id}` },
                () => fetchComments()
            )
            .subscribe()
        return () => supabase.removeChannel(channel)
    }, [id])

    // ─── handlers ─────────────────────────────────────────────
    async function fetchComments() {
        const { data, error } = await supabase
            .from('comments')
            .select('id, content, created_at, user_id, profiles!comments_user_id_fkey(username)')
            .eq('incident_id', id)
            .order('created_at', { ascending: true })
        if (error) {
            __DEV__ && console.log('[useIncidentDetail] fetchComments error:', error.message)
            return
        }
        setComments(data ?? [])
    }

    async function handleVote(type) {
        if (voteLoading) return

        const isSameVote = userVote === type
        const col = type === 'up' ? 'upvotes' : 'downvotes'
        const oppositeCol = type === 'up' ? 'downvotes' : 'upvotes'

        const newCount = isSameVote
            ? Math.max(0, (incident[col] ?? 0) - 1)
            : (incident[col] ?? 0) + 1

        const newOppositeCount = userVote && !isSameVote
            ? Math.max(0, (incident[oppositeCol] ?? 0) - 1)
            : (incident[oppositeCol] ?? 0)

        setVoteLoading(true)
        const { error } = await supabase
            .from('incidents')
            .update({ [col]: newCount, [oppositeCol]: newOppositeCount })
            .eq('id', id)

        if (!error) {
            setIncident(prev => ({ ...prev, [col]: newCount, [oppositeCol]: newOppositeCount }))
            setUserVote(isSameVote ? null : type)
            if (isSameVote) {
                await supabase.from('incident_votes').delete()
                    .eq('incident_id', id).eq('user_id', user.id)
            } else {
                await supabase.from('incident_votes').upsert(
                    { incident_id: id, user_id: user.id, vote: type },
                    { onConflict: 'incident_id,user_id' }
                )
            }
        } else {
            __DEV__ && console.log('[useIncidentDetail] vote error:', error.message)
        }
        setVoteLoading(false)
    }

    async function handleWitnessed() {
        if (voteLoading || userVote === 'witnessed') return
        const newCount = (incident.witnessed ?? 0) + 1
        setVoteLoading(true)
        const { error } = await supabase
            .from('incidents')
            .update({ witnessed: newCount })
            .eq('id', id)
        if (!error) {
            setIncident(prev => ({ ...prev, witnessed: newCount }))
            setUserVote('witnessed')
            await supabase.from('incident_votes').upsert(
                { incident_id: id, user_id: user.id, vote: 'witnessed' },
                { onConflict: 'incident_id,user_id' }
            )
        } else {
            __DEV__ && console.log('[useIncidentDetail] witnessed error:', error.message)
        }
        setVoteLoading(false)
    }

    async function handleFollow() {
        if (followLoading) return
        setFollowLoading(true)
        const currentList = incident.followed_by ?? []
        const alreadyFollowing = currentList.includes(user.id)
        const newList = alreadyFollowing
            ? currentList.filter(uid => uid !== user.id)
            : [...currentList, user.id]
        const { error } = await supabase
            .from('incidents')
            .update({ followed_by: newList })
            .eq('id', id)
        if (!error) {
            setIncident(prev => ({ ...prev, followed_by: newList }))
            setIsFollowing(!alreadyFollowing)
        } else {
            __DEV__ && console.log('[useIncidentDetail] follow error:', error.message)
        }
        setFollowLoading(false)
    }

    async function handleVerify() {
        if (actionLoading) return
        setActionLoading(true)
        const newVerified = !incident.verified
        const { error } = await supabase
            .from('incidents')
            .update({
                verified: newVerified,
                verified_by: newVerified ? user.id : null,
                verification_status: newVerified ? 'verified_by_campus' : 'submitted'
            })
            .eq('id', id)
        if (!error) {
            setIncident(prev => ({
                ...prev,
                verified: newVerified,
                verification_status: newVerified ? 'verified_by_campus' : 'submitted'
            }))
        } else {
            __DEV__ && console.log('[useIncidentDetail] verify error:', error.message)
        }
        setActionLoading(false)
    }

    async function handleResolve() {
        if (actionLoading) return
        setActionLoading(true)
        const newStatus = incident.status === 'resolved' ? 'active' : 'resolved'
        const { error } = await supabase
            .from('incidents')
            .update({
                status: newStatus,
                verification_status: newStatus === 'resolved' ? 'resolved' : 'submitted',
                verified: newStatus === 'resolved' ? true : incident.verified,
                verified_by: newStatus === 'resolved' ? user.id : incident.verified_by,
            })
            .eq('id', id)
        if (!error) {
            setIncident(prev => ({
                ...prev,
                status: newStatus,
                verification_status: newStatus === 'resolved' ? 'resolved' : 'submitted',
                verified: newStatus === 'resolved' ? true : prev.verified,
                verified_by: newStatus === 'resolved' ? user.id : prev.verified_by,
            }))
        } else {
            __DEV__ && console.log('[useIncidentDetail] resolve error:', error.message)
        }
        setActionLoading(false)
    }

    async function handleComment() {
        const trimmed = commentText.trim()
        if (!trimmed || commentLoading) return
        setCommentLoading(true)
        const { error } = await supabase
            .from('comments')
            .insert({ incident_id: id, user_id: user.id, content: trimmed })
        if (!error) {
            setCommentText('')
            await fetchComments()
        } else {
            __DEV__ && console.log('[useIncidentDetail] comment error:', error.message)
        }
        setCommentLoading(false)
    }

    return {
        // data
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
        isStaff: profile?.role === 'staff',
        // handlers
        handleVote,
        handleWitnessed,
        handleFollow,
        handleVerify,
        handleResolve,
        handleComment,
    }
}