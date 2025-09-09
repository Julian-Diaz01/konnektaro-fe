import {useRouter, useSearchParams} from "next/navigation"
import {useState, useMemo, useCallback} from "react"
import {ActivityType} from "@shared/types/models"
import {updateCurrentActivity} from "@shared/services/eventService"
import { useEventContext } from "@shared/contexts/EventContext"
import useActivity from "@shared/hooks/useActivity";
import { getSocket } from "@shared/lib/socket";
import { toast } from "sonner";

export default function useEventPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const eventId = searchParams.get("id")

    // Use context instead of hook for event data
    const {event, loading: eventLoading, deleteCurrentEvent,
        updateCurrentActivityId, currentActivityId, closeEventById} = useEventContext()
    const {
        activities,
        loading: activitiesLoading,
        deleteActivity,
        createNewActivity,
    } = useActivity({activityIds: event?.activityIds || []})

    // Get the current activity
    const currentActivity = activities.find(a => a.activityId === currentActivityId)

    const [showForm, setShowForm] = useState(false)

    const loading = useMemo(() => 
        eventLoading || activitiesLoading, 
        [eventLoading, activitiesLoading]
    )

    const handleAddActivity = useCallback(async (activityData: {
        title: string
        question: string
        type: ActivityType
    }) => {
        if (!event) return
        try {
            toast.info(`➕ Creating new activity: ${activityData.title}`)
            await createNewActivity({ ...activityData, eventId: event.eventId })
            toast.success(`✅ Activity "${activityData.title}" created successfully!`)

            setShowForm(false)
        } catch (error) {
            console.error("Failed to create activity:", error)
            toast.error("❌ Failed to create activity. Please try again.")
            // Don't close the form if creation failed
        }
    }, [createNewActivity, event])

    const handleCurrentActivityUpdate = useCallback(async (activityId: string) => {
        if (!event || !activityId) return
        try {
            const eventId = event.eventId
            const newActivity = activities.find(a => a.activityId === activityId)
            
            if (!newActivity) {
                toast.error("❌ Activity not found. Please refresh the page and try again.")
                return
            }
            
            toast.info(`🔄 Initiating activity: ${newActivity.title}`)
            
            await updateCurrentActivity(eventId, activityId)
            updateCurrentActivityId(activityId)
            // Emit socket event to notify all connected users about the activity change
            try {
                const socket = await getSocket()
                if (socket && socket.connected) {
                    socket.emit('adminActivityUpdate', { eventId, activityId })
                } else {
                    console.warn('⚠️ Socket not connected, cannot emit adminActivityUpdate event')
                }
            } catch (socketError) {
                console.warn('⚠️ Failed to emit socket event:', socketError)
                // Don't fail the activity update if socket emission fails
            }
        } catch (error) {
            console.error("Failed to update current activity:", error)
            toast.error("❌ Failed to initiate activity. Please try again.")
        }
    }, [event, updateCurrentActivityId, activities])

    const handleDeleteEvent = useCallback(async () => {
        if (eventId) {
            await deleteCurrentEvent(eventId)
        }
        router.push("/admin")
    }, [eventId, deleteCurrentEvent, router])

    const handleCloseEvent = useCallback(async () => {
        if (eventId) {
            await closeEventById(eventId).then(()=> {
                toast.success("✅ Event closed successfully.")
                router.push("/admin")
            })
        }
    }, [eventId, closeEventById, router])

    const handleDeleteActivity = useCallback(async (activityId: string) => {
        if (!event) return
        try {
            const activity = activities.find(a => a.activityId === activityId)
            if (!activity) {
                toast.error("❌ Activity not found. Please refresh the page and try again.")
                return
            }
            await deleteActivity(activityId)
            toast.success(`✅ Activity "${activity.title}" deleted successfully!`)
        } catch (error) {
            toast.error("❌ Failed to delete activity. Please try again.")
        }
    }, [event, deleteActivity, activities])

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
        deleteActivity: handleDeleteActivity,
        currentActivity,
        handleCloseEvent,
    }
}
