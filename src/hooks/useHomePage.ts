import {useRouter} from "next/navigation";
import {useEffect, useMemo} from "react";
import useOpenEvents from "@/hooks/useOpenEvents";
import useUser from "@/hooks/useUser";
import useAuthUser from "@/hooks/useAuthUser";
import useEvent from "@/hooks/useEvent";
import useEventSocket from "@/hooks/useEventSocket";
import useGroupActivity from "@/hooks/useGroupActivity";
import {ParticipantUser} from "@/types/models";

// This hook handles the logic for the home page, including user checks, event loading, socket management, and group activity

export default function useHomePage() {
    const router = useRouter()
    const {events, loading: eventsLoading} = useOpenEvents()
    const {user: firebaseUser, loading: firebaseLoading} = useAuthUser()
    const {user, loading: loadingUser} = useUser(firebaseUser?.uid || null)
    const name = user?.name || '👋'

    const userId = user?.userId || ''
    // Event management
    const {event} = useEvent(userId)

    const eventId = event?.eventId || ''
    // Socket management
    const {
        activeActivityId,
        shouldFetchGroups,
        hasActivityChanged,
        getCountdown,
        skipCountdown,
        resetShouldFetchGroups,
        resetActivityChanged
    } = useEventSocket(eventId)

    // Activity ID management
    const activityId = activeActivityId || event?.currentActivityId || undefined

    // Group activity management
    const {
        groupActivity,
        loading: groupLoading,
        fetchGroupActivity,
        clearGroupActivity
    } = useGroupActivity(eventId, activityId)

    // Trigger group activity fetch when socket indicates groups are created
    useEffect(() => {
        console.log('🔍 useHomePage useEffect: shouldFetchGroups:', shouldFetchGroups, 'activityId:', activityId)
        if (shouldFetchGroups && activityId) {
            console.log('🚀 useHomePage: Triggering group activity refresh for activityId:', activityId)
            // Manually refresh the group activity data
            fetchGroupActivity()
            // Reset the flag after triggering
            resetShouldFetchGroups()
        }
    }, [shouldFetchGroups, activityId, resetShouldFetchGroups, fetchGroupActivity])

    // Clear group activity when activity changes to stop rendering PartnerActivity
    useEffect(() => {
        console.log('🔍 useHomePage useEffect: hasActivityChanged:', hasActivityChanged)
        if (hasActivityChanged) {
            console.log('🔄 useHomePage: Clearing group activity due to activity change')
            clearGroupActivity()
            resetActivityChanged()
        }
    }, [hasActivityChanged, clearGroupActivity, resetActivityChanged])

    // Find the current user's group and partner
    const currentUserGroup = useMemo(() => {
        if (!groupActivity || !user) return null

        return groupActivity.groups.find(group =>
            group.participants.some(participant => participant.userId === userId)
        )
    }, [groupActivity, user, userId])

    const currentUserPartner: ParticipantUser | null = useMemo(() => {
        if (!currentUserGroup || !user) return null

        return currentUserGroup.participants.find(participant =>
            participant.userId !== userId
        ) || null
    }, [currentUserGroup, user, userId])

    // Event handling
    const handleJoinEvent = (eventId: string) => {
        router.push(`/create-user?eventId=${eventId}`)
    }

    // Loading state
    const loading = eventsLoading && firebaseLoading && loadingUser

    // Partner activity render conditions
    const shouldRenderPartnerActivity = useMemo(() => {
        return Boolean(activityId && !groupLoading && groupActivity && currentUserPartner)
    }, [activityId, groupLoading, groupActivity, currentUserPartner])

    return {
        // User data
        user,
        name,

        // Events
        events,
        event,

        // Loading states
        loading,
        groupLoading,

        // Activity data
        activityId,
        activeActivityId,

        // Socket functions
        getCountdown,
        skipCountdown,

        // Group activity data
        groupActivity,
        currentUserGroup,
        currentUserPartner,

        // Partner activity rendering
        shouldRenderPartnerActivity,

        // Event handlers
        handleJoinEvent
    }
}