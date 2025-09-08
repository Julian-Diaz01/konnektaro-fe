import {useState, useEffect, useCallback, useMemo, useRef} from "react"
import {GroupActivity} from "../types/models"
import {pairUsersInActivity, fetchGroupActivityByActivityId} from "../services/groupActivityService";

export default function useGroupActivity(eventId: string | null, activityId?: string) {
    const [groupActivity, setGroupActivity] = useState<GroupActivity | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const previousActivityId = useRef<string | undefined>(undefined)

    // Memoize the fetch function to prevent unnecessary re-renders
    const fetchGroupActivity = useMemo(() => {
        return async (targetActivityId: string) => {
            if (!targetActivityId) return

            setLoading(true)
            setError(null)

            try {
                const response = await fetchGroupActivityByActivityId(targetActivityId)
                setGroupActivity(response.data)
            } catch (err) {
                console.error("Failed to fetch group activity:", err)
                setError("Failed to fetch group activity.")
            } finally {
                setLoading(false)
            }
        }
    }, [])

    // Fetch group activity by activityId when provided
    useEffect(() => {
        // Only fetch if activityId has actually changed
        if (activityId !== previousActivityId.current) {
            previousActivityId.current = activityId
            
            if (activityId) {
                // Only clear and fetch if we have a new activityId
                setGroupActivity(null)
                setLoading(true)
                fetchGroupActivity(activityId)
            } else {
                // Clear group activity when no activity is selected
                setGroupActivity(null)
                setLoading(false)
                setError(null)
            }
        }
    }, [activityId, fetchGroupActivity])

    const pairUsersInGroupActivity = useCallback(async (activityId: string) => {
        if (!eventId || !activityId) return
        try {
            const response = await pairUsersInActivity(eventId, activityId)
            setGroupActivity(response.data)
        } catch (err) {
            console.error("Failed to pair users in activity:", err)
            setError("Failed to pair users in activity.")
        }
    }, [eventId])

    const clearGroupActivity = useCallback(() => {
        setGroupActivity(null)
        setLoading(false)
        setError(null)
        previousActivityId.current = undefined
    }, [])

    // Cleanup effect to clear data when component unmounts
    useEffect(() => {
        return () => {
            setGroupActivity(null)
            setLoading(false)
            setError(null)
            previousActivityId.current = undefined
        }
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
