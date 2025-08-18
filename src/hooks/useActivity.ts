import {useState} from "react"
import useSWR from "swr"
import {
    createActivity,
    deleteActivity as deleteActivityApi,
    getActivityById,
} from "@/services/activityService"
import {Activity, ActivityType} from "@/types/models"
import { swrConfigFrequent } from '@/lib/swr-config'

interface ActivityOptions {
    activityId?: string | null;
    activityIds?: string[];
}

// Fetcher function for single activity (array key form)
const fetcherSingle = async (key: unknown) => {
    const arr = Array.isArray(key) ? key : [key]
    const [, activityId] = arr as [string, string]
    if (!activityId) throw new Error('Missing activityId')
    const response = await getActivityById(activityId)
    return response.data
}

// Fetcher function for multiple activities using service API (array key form)
const fetcherMultiple = async (key: unknown) => {
    const arr = Array.isArray(key) ? key : [key]
    const [, joinedIds] = arr as [string, string]
    if (!joinedIds) return []
    const ids = joinedIds.split(',')
    const responses = await Promise.all(ids.map((id) => getActivityById(id)))
    return responses.map((res) => res.data)
}

export default function useActivity({activityId = null, activityIds = []}: ActivityOptions) {
    const [error, setError] = useState<string | null>(null)

    // Stable SWR keys - only create when we have valid data
    const singleKey = activityId ? ['activity', activityId] : null
    const sortedIds = activityIds && activityIds.length > 0 ? [...activityIds].sort() : []
    const listKey = sortedIds.length > 0 ? ['activities', sortedIds.join(',')] : null

    // Use SWR for single activity - only when we have a valid activityId
    const { 
        data: activity, 
        isLoading: loadingSingle 
    } = useSWR<Activity>(
        singleKey,
        fetcherSingle,
        swrConfigFrequent
    )

    // Use SWR for multiple activities - only when we have valid activityIds
    const { 
        data: activities = [], 
        isLoading: loadingMultiple,
        mutate: mutateActivities
    } = useSWR<Activity[]>(
        listKey,
        fetcherMultiple,
        swrConfigFrequent
    )

    // Combined loading state
    const loading = Boolean(loadingSingle || loadingMultiple)

    const createNewActivity = async (activityData: {
        title: string
        question: string
        type: ActivityType
        eventId: string
    }) => {
        try {
            const createdActivity = await createActivity(activityData)
            // Update the cache with new activity
            mutateActivities((prev) => [...(prev || []), createdActivity], false)
        } catch (error) {
            console.error("Failed to create activity:", error)
            setError("Failed to create activity.")
        }
    }

    const deleteActivity = async (activityId: string) => {
        try {
            await deleteActivityApi(activityId)
            // Update the cache by removing the deleted activity
            mutateActivities((prev) => 
                (prev || []).filter((activity) => activity.activityId !== activityId), 
                false
            )
        } catch (error) {
            console.error("Failed to delete activity:", error)
            setError("Failed to delete activity.")
        }
    }

    return {
        activity,
        activities,
        loading,
        error,
        createNewActivity,
        deleteActivity,
        refresh: mutateActivities, // Expose refresh function for manual updates
    }
}
