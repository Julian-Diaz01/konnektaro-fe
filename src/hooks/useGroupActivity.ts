import {useState, useEffect, useCallback} from "react"
import {GroupActivity} from "@/types/models"
import {pairUsersInActivity, fetchGroupActivityByActivityId} from "@/services/groupActivityService";

export default function useGroupActivity(eventId: string | null, activityId?: string) {
    const [groupActivity, setGroupActivity] = useState<GroupActivity | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchGroupActivity = useCallback(async () => {
        if (!activityId) return

        setLoading(true)
        setError(null)

        try {
            const response = await fetchGroupActivityByActivityId(activityId)
            setGroupActivity(response.data)
        } catch (err) {
            console.error("Failed to fetch group activity:", err)
            setError("Failed to fetch group activity.")
        } finally {
            setLoading(false)
        }
    }, [activityId])

    // Fetch group activity by activityId when provided
    useEffect(() => {
        if (activityId) {
            fetchGroupActivity()
        } else {
            // Clear group activity when no activity is selected
            setGroupActivity(null)
            setLoading(false)
        }
    }, [fetchGroupActivity, activityId])

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

    const clearGroupActivity = useCallback(() => {
        setGroupActivity(null)
        setLoading(false)
        setError(null)
    }, [])

    return {
        groupActivity,
        loading,
        error,
        pairUsersInGroupActivity,
        fetchGroupActivity,
        clearGroupActivity
    }
}
