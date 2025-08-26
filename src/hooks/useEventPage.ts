import {useRouter, useSearchParams} from "next/navigation"
import {useState, useMemo, useCallback} from "react"
import {ActivityType} from "@/types/models"
import {updateCurrentActivity} from "@/services/eventService"
import useGroupActivity from "@/hooks/useGroupActivity";
import { useEventContext } from "@/contexts/EventContext"
import useActivity from "@/hooks/useActivity";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";

export default function useEventPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const eventId = searchParams.get("id")

    // Use context instead of hook for event data
    const {event, loading: eventLoading, deleteCurrentEvent, updateCurrentActivityId, currentActivityId} = useEventContext()
    const {
        activities,
        loading: activitiesLoading,
        createNewActivity,
        deleteActivity,
        refresh: refreshActivities
    } = useActivity({activityIds: event?.activityIds || []})

    // Get the current activity to determine if we need to fetch group activity
    const currentActivity = activities.find(a => a.activityId === currentActivityId)
    
    // Use the hook to fetch group activity when current activity is of type 'partner'
    const { 
        groupActivity, 
        loading: groupActivityLoading,
        pairUsersInGroupActivity 
    } = useGroupActivity(
        eventId, 
        currentActivityId && currentActivity?.type === 'partner' ? currentActivity.activityId : undefined
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
            console.log('➕ Admin creating new activity:', { activityData, eventId: event.eventId })
            toast.info(`➕ Creating new activity: ${activityData.title}`)
            
            await createNewActivity({...activityData, eventId: event.eventId})
            console.log('✅ Activity created successfully on server')
            
            toast.success(`✅ Activity "${activityData.title}" created successfully!`)
            
            // Refresh the activities to get the updated list from the server
            refreshActivities()
            console.log('✅ Activities refreshed after creation')
            
            setShowForm(false)
        } catch (error) {
            console.error("Failed to create activity:", error)
            toast.error("❌ Failed to create activity. Please try again.")
            // Don't close the form if creation failed
        }
    }, [event, createNewActivity, refreshActivities])

    const handleCurrentActivityUpdate = useCallback(async (activityId: string) => {
        if (!event || !activityId) return
        try {
            const eventId = event.eventId
            const newActivity = activities.find(a => a.activityId === activityId)
            
            if (!newActivity) {
                toast.error("❌ Activity not found. Please refresh the page and try again.")
                return
            }
            
            console.log('🔄 Admin initiating activity:', { activityId, activityTitle: newActivity.title, eventId })
            toast.info(`🔄 Initiating activity: ${newActivity.title}`)
            
            await updateCurrentActivity(eventId, activityId)
            console.log('✅ Current activity updated successfully on server')
            
            // Update the event context with the new current activity ID
            // This ensures the UI shows the new current activity immediately without full refresh
            updateCurrentActivityId(activityId)
            console.log('✅ Event context updated with new current activity')
            
            // Check if the new activity is a partner activity and automatically create groups
            if (newActivity.type === 'partner') {
                console.log('🔄 New partner activity initiated, creating groups...')
                toast.success(`✅ Partner activity "${newActivity.title}" initiated! Users will be paired automatically.`)
                // The socket will handle group creation and notify users
                // Users will automatically see the partner activity when groups are ready
            } else {
                toast.success(`✅ Self-reflection activity "${newActivity.title}" initiated!`)
            }
            
            // Emit socket event to notify all connected users about the activity change
            try {
                const socket = await getSocket()
                if (socket && socket.connected) {
                    socket.emit('adminActivityUpdate', { eventId, activityId })
                    console.log('🔌 Emitted adminActivityUpdate event:', { eventId, activityId })
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

    const handlePairUsers = useCallback(async (activityId: string) => {
        if (!event || !activityId) return
        try {
            const activity = activities.find(a => a.activityId === activityId)
            if (!activity) {
                toast.error("❌ Activity not found. Please refresh the page and try again.")
                return
            }
            
            console.log('👥 Admin pairing users for activity:', { activityId, activityTitle: activity.title, eventId: event.eventId })
            toast.info(`👥 Pairing users for "${activity.title}"...`)
            
            await pairUsersInGroupActivity(activityId)
            console.log('✅ Users paired successfully on server')
            
            toast.success(`✅ Users paired successfully for "${activity.title}"!`)
            
            // Emit socket event to notify all connected users about the new groups
            try {
                const socket = await getSocket()
                if (socket && socket.connected) {
                    socket.emit('adminGroupsCreated', { eventId: event.eventId, activityId })
                    console.log('🔌 Emitted adminGroupsCreated event:', { eventId: event.eventId, activityId })
                } else {
                    console.warn('⚠️ Socket not connected, cannot emit adminGroupsCreated event')
                }
            } catch (socketError) {
                console.warn('⚠️ Failed to emit socket event:', socketError)
                // Don't fail the user pairing if socket emission fails
            }
        } catch (error) {
            console.error("Failed to pair users:", error)
            toast.error("❌ Failed to pair users. Please try again.")
        }
    }, [event, pairUsersInGroupActivity, activities])

    const handleDeleteActivity = useCallback(async (activityId: string) => {
        if (!event) return
        try {
            const activity = activities.find(a => a.activityId === activityId)
            if (!activity) {
                toast.error("❌ Activity not found. Please refresh the page and try again.")
                return
            }
            
            console.log('🗑️ Admin deleting activity:', { activityId, activityTitle: activity.title, eventId: event.eventId })
            toast.info(`🗑️ Deleting activity: ${activity.title}`)
            
            await deleteActivity(activityId)
            console.log('✅ Activity deleted successfully on server')
            
            toast.success(`✅ Activity "${activity.title}" deleted successfully!`)
            
            // Refresh the activities to get the updated list from the server
            refreshActivities()
            console.log('✅ Activities refreshed after deletion')
        } catch (error) {
            console.error("Failed to delete activity:", error)
            toast.error("❌ Failed to delete activity. Please try again.")
        }
    }, [event, deleteActivity, refreshActivities, activities])

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
