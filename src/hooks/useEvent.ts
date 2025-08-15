import {useState, useEffect} from "react"
import {
    getEventById,
    deleteEvent,
    createEvent, pairUsersInActivity,
} from "@/services/eventService"
import {Event} from "@/types/models"

export default function useEvent(eventId: string) {
    const [event, setEvent] = useState<Event | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!eventId) return

        const fetchEvent = async () => {
            try {
                setLoading(true)
                const response = await getEventById(eventId)
                setEvent(response.data)
            } catch (err) {
                console.error("Failed to fetch event:", err)
                setError("Failed to fetch event.")
            } finally {
                setLoading(false)
            }
        }

        fetchEvent()
    }, [eventId])

    const deleteCurrentEvent = async () => {
        if (!eventId) return
        try {
            await deleteEvent(eventId)
        } catch (error) {
            console.error("Failed to delete event:", error)
            setError("Failed to delete event.")
        }
    }

    const createNewEvent = async (newEventData: Omit<Event, "eventId">) => {
        try {
            const {data} = await createEvent(newEventData)
            setEvent(data)
        } catch (error) {
            console.error("Failed to create event:", error)
            setError("Failed to create event.")
        }
    }

    const pairUsersEvent = async (activityId: string) => {
        if (!eventId || !activityId) return
            const {data} = await pairUsersInActivity(eventId, activityId)
        console.log(data)
        return data
    }

    return {
        event,
        loading,
        error,
        deleteCurrentEvent,
        createNewEvent,
        pairUsersEvent
    }
}
