import {useRouter, useSearchParams} from "next/navigation"
import {useState, useMemo} from "react"
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
        deleteActivity
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

    const handleAddActivity = async (activityData: {
        title: string
        question: string
        type: ActivityType
    }) => {
        if (!event) return
        await createNewActivity({...activityData, eventId: event.eventId})
        setShowForm(false)
    }

    const handleCurrentActivityUpdate = async (activityId: string) => {
        if (!event || !activityId) return
        const eventId = event.eventId
        await updateCurrentActivity(eventId, activityId)
    }

    const handleDeleteEvent = async () => {
        if (eventId) {
            await deleteCurrentEvent(eventId)
        }
        router.push("/admin")
    }

    const handlePairUsers = async (activityId: string) => {
        if (!event || !activityId) return
        await pairUsersInGroupActivity(activityId)
    }

    return {
        event,
        eventId,
        activities,
        loading,
        showForm,
        setShowForm,
        handleAddActivity,
        handleCurrentActivityUpdate,
        handleDeleteEvent,
        handlePairUsers,
        deleteActivity,
        groupActivity,
        currentActivity,
    }
}
