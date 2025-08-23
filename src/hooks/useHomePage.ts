import {useRouter} from "next/navigation";
import {useEffect, useMemo, useRef} from "react";
import useOpenEvents from "@/hooks/useOpenEvents";
import useEventSocket from "@/hooks/useEventSocket";
import useGroupActivity from "@/hooks/useGroupActivity";
import { useEventContext } from "@/contexts/EventContext";
import { useUserContext } from "@/contexts/UserContext";
import {ParticipantUser} from "@/types/models";
import useAuthUser from "@/hooks/useAuthUser";

// This hook handles the logic for the home page, including user checks, event loading, socket management, and group activity

export default function useHomePage() {
    const router = useRouter()
    const {events, loading: eventsLoading} = useOpenEvents()

    // Use contexts instead of hooks for static data
    const {user, loading: loadingUser} = useUserContext()
    const {event, refreshEvent} = useEventContext()
    const name = user?.name || '👋'
    const { firebaseUser } = useAuthUser()
console.log(event, "event")
    useEffect(() => {
        if(!event && user?.eventId) {
            refreshEvent(user?.eventId)
        }
    }, [event, user?.eventId, refreshEvent]);
    const isAdmin = !firebaseUser?.isAnonymous


    // Refs to prevent duplicate API calls and unnecessary re-renders
    const fetchTriggeredRef = useRef(false)
    const lastActivityIdRef = useRef<string | undefined>(undefined)
    const lastEventIdRef = useRef<string | undefined>(undefined)

    const userId = user?.userId || ''
    // Event management - only fetch if user has an eventId
    const eventId = user?.eventId || ''

    // Socket management - only connect if we have an eventId
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

    // Group activity management - only fetch if we have both eventId and activityId
    const {
        groupActivity,
        loading: groupLoading,
        fetchGroupActivity,
        clearGroupActivity,
    } = useGroupActivity(eventId || null, activityId)

    // Trigger group activity fetch when socket indicates groups are created
    useEffect(() => {
        
        if (shouldFetchGroups && activityId) {
            
            // Fetch immediately when socket triggers - no delay needed
            fetchGroupActivity()
            
            // Reset the flag after triggering
            resetShouldFetchGroups()
        }
    }, [shouldFetchGroups, activityId, resetShouldFetchGroups, fetchGroupActivity])

    // Reset activity changed flag when activity changes
    useEffect(() => {
        if (hasActivityChanged) {
            resetActivityChanged()
        }
    }, [hasActivityChanged, resetActivityChanged])

    // Reset fetch trigger and clear old group activity when activity changes
    useEffect(() => {
        if (activityId !== lastActivityIdRef.current) {
            fetchTriggeredRef.current = false
            lastActivityIdRef.current = activityId
            // Clear old group activity immediately when activity changes
            clearGroupActivity()
        }
    }, [activityId, clearGroupActivity])

    // Also reset fetch trigger when eventId changes (user switches events)
    useEffect(() => {
        if (eventId !== lastEventIdRef.current) {
            fetchTriggeredRef.current = false
            lastEventIdRef.current = eventId
        }
    }, [eventId])

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
    const loading = eventsLoading && loadingUser

    // Partner activity render conditions
    const shouldRenderPartnerActivity = useMemo(() => {
        // Only render PartnerActivity if:
        // 1. We have an activity ID AND
        // 2. Groups are not loading AND
        // 3. We have group activity data AND
        // 4. We have a partner AND
        // 5. The group activity corresponds to the current activity (extra safety check)
        return Boolean(
            activityId &&
            !groupLoading &&
            groupActivity &&
            groupActivity.activityId === activityId && // Ensure group activity matches current activity
            currentUserPartner
        )
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
        clearGroupActivity,

        // Partner activity rendering
        shouldRenderPartnerActivity,

        // Event handlers
        handleJoinEvent,
        //fix for prod
        isAdmin,
        firebaseUser
    }
}