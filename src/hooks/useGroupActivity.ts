import {useState,} from "react"
import {pairUsersInActivity,} from "@/services/eventService"
import {GroupActivity} from "@/types/models"

export default function useGroupActivity(eventId: string | null) {
    const [groupActivity, setGroupActivity] = useState<GroupActivity | null>(null)
    // const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const pairUsersInGroupActivity = async (activityId: string) => {
        if (!eventId || !activityId) return
        try {
            const response = await pairUsersInActivity(eventId, activityId)
            setGroupActivity(response.data)
        } catch (err) {
            console.error("Failed to pair users in activity:", err)
            setError("Failed to pair users in activity.")
        }
    }

    return {
        groupActivity,
        // loading,
        error,
        pairUsersInGroupActivity
    }
}
