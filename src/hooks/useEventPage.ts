import {useRouter, useSearchParams} from "next/navigation"
import {useState, useMemo, useCallback} from "react"
import {ActivityType} from "@/types/models"
import {updateCurrentActivity} from "@/services/eventService"
import useGroupActivity from "@/hooks/useGroupActivity";
import { useEventContext } from "@/contexts/EventContext"
import useActivity from "@/hooks/useActivity";

export default function useEventPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const eventId = searchParams.get("id")

    // Use context instead of hook for event data
    const {event, loading: eventLoading, deleteCurrentEvent} = useEventContext()
    const {
        activities,
        loading: activitiesLoading,
        createNewActivity,
        deleteActivity,
        refresh: refreshActivities
    } = useActivity({activityIds: event?.activityIds || []})

    // Get the current activity to determine if we need to fetch group activity
    const currentActivityId = event?.currentActivityId || null
    const currentActivity = activities.find(a => a.activityId === currentActivityId)
    
    // Use the hook to fetch group activity when current activity is of type 'partner'
    const { 
        groupActivity, 
        loading: groupActivityLoading,
        pairUsersInGroupActivity 
    } = useGroupActivity(
        eventId, 
        currentActivity?.type === 'partner' ? currentActivity.activityId : undefined
    )

    const [showForm, setShowForm] = useState(false)

    const loading = useMemo(() => 
        eventLoading || activitiesLoading || groupActivityLoading, 
        [eventLoading, activitiesLoading, groupActivityLoading]
    )

    const handleAddActivity = useCallback(async (activityData: {
        title: string
        question: string
        type: ActivityType
    }) => {
        if (!event) return
        try {
            await createNewActivity({...activityData, eventId: event.eventId})
            
            // Refresh the activities to get the updated list from the server
            refreshActivities()
            
            setShowForm(false)
        } catch (error) {
            console.error("Failed to create activity:", error)
            // Don't close the form if creation failed
        }
    }, [event, createNewActivity, refreshActivities])

    const handleCurrentActivityUpdate = useCallback(async (activityId: string) => {
        if (!event || !activityId) return
        const eventId = event.eventId
        await updateCurrentActivity(eventId, activityId)
    }, [event])

    const handleDeleteEvent = useCallback(async () => {
        if (eventId) {
            await deleteCurrentEvent(eventId)
        }
        router.push("/admin")
    }, [eventId, deleteCurrentEvent, router])

    const handlePairUsers = useCallback(async (activityId: string) => {
        if (!event || !activityId) return
        await pairUsersInGroupActivity(activityId)
    }, [event, pairUsersInGroupActivity])

    const handleDeleteActivity = useCallback(async (activityId: string) => {
        if (!event) return
        try {
            await deleteActivity(activityId)
            
            // Refresh the activities to get the updated list from the server
            refreshActivities()
        } catch (error) {
            console.error("Failed to delete activity:", error)
        }
    }, [event, deleteActivity, refreshActivities])

    const handleShowForm = useCallback(() => setShowForm(true), [])
    const handleHideForm = useCallback(() => setShowForm(false), [])

    return {
        event,
        eventId,
        activities,
        loading,
        showForm,
        setShowForm: handleShowForm,
        hideForm: handleHideForm,
        handleAddActivity,
        handleCurrentActivityUpdate,
        handleDeleteEvent,
        handlePairUsers,
        deleteActivity: handleDeleteActivity,
        groupActivity,
        currentActivity,
    }
}
