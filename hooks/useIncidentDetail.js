import { useEffect, useState } from 'react'
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

    const [actionLoading, setActionLoading] = useState(false) // guards verify/resolve

    const [comments, setComments] = useState([])
    const [commentText, setCommentText] = useState('')
    const [commentLoading, setCommentLoading] = useState(false)

    // ─── load incident ────────────────────────────────────────
    // seeds isFollowing from followed_by array on first load
    useEffect(() => {
        async function loadIncident() {
            if (!id) return
            const data = await fetchIncidentById(id)
            if (!data) return
            setIncident(data)
            setIsFollowing(data.followed_by?.includes(user?.id) ?? false)
            // reporter's upvote is locked on
            if (data.user_id === user?.id) setUserVote('up')
        }
        loadIncident()
    }, [id])

    // ─── load user's existing vote ────────────────────────────
    // re-runs when user changes (e.g. login/logout) to avoid stale vote state
    useEffect(() => {
        async function loadUserVote() {
            if (!user?.id) return
            // skip fetch if user is the reporter — vote is already locked to 'up'
            if (incident?.user_id === user.id) return
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
    // listens for UPDATE events so votes, verify, resolve reflect immediately
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

    // re-fetch on INSERT so username join is included (payload alone won't have it)
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

    // ─── fetchComments ────────────────────────────────────────
    // joins profiles via FK so username displays correctly
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

    // ─── handleVote ───────────────────────────────────────────
    // reddit-style: tapping same button undoes the vote,
    // switching sides removes the old vote and adds the new one in one DB write
    async function handleVote(type) {
        if (voteLoading) return

        const isSameVote = userVote === type
        const col = type === 'up' ? 'upvotes' : 'downvotes'
        const oppositeCol = type === 'up' ? 'downvotes' : 'upvotes'

        const newCount = isSameVote
            ? Math.max(0, (incident[col] ?? 0) - 1)         // undo
            : (incident[col] ?? 0) + 1                       // vote

        const newOppositeCount = userVote && !isSameVote
            ? Math.max(0, (incident[oppositeCol] ?? 0) - 1)  // remove opposite when switching
            : (incident[oppositeCol] ?? 0)                   // unchanged

        setVoteLoading(true)
        const { error } = await supabase
            .from('incidents')
            .update({ [col]: newCount, [oppositeCol]: newOppositeCount })
            .eq('id', id)

        if (!error) {
            setIncident(prev => ({ ...prev, [col]: newCount, [oppositeCol]: newOppositeCount }))
            setUserVote(isSameVote ? null : type)
            // persist to incident_votes so vote survives logout
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

    // ─── handleWitnessed ─────────────────────────────────────
    // one-way — no undo once witnessed
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

    // ─── handleFollow ─────────────────────────────────────────
    // appends/removes user.id from followed_by array on the incident row
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

    // ─── handleVerify ─────────────────────────────────────────
    // staff only — toggles verified flag, disabled once incident is resolved
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

    // ─── handleResolve ────────────────────────────────────────
    // staff only — toggles resolved/active
    // resolving also auto-verifies the incident
    // reopening leaves verified as-is
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

    // ─── handleComment ────────────────────────────────────────
    // inserts then re-fetches so the username join is fresh
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
        userId: user?.id,
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