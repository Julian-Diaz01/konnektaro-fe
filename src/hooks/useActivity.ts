import {useState, useEffect} from "react"
import {
    createActivity,
    deleteActivity as deleteActivityApi, getActivityById,
} from "@/services/activityService"
import {Activity, ActivityType} from "@/types/models"
import axios from "@/utils/axiosInstance"

interface ActivityOptions {
    activityId?: string | null;
    activityIds?: string[];
}

export default function useActivity({activityId = null, activityIds = []}: ActivityOptions) {
    const [activities, setActivities] = useState<Activity[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activity, setActivity] = useState<Activity | null>(null)

    useEffect(() => {
        if (!activityIds.length) {
            setLoading(false)
            return
        }

        const fetchActivities = async () => {
            try {
                setLoading(true)
                const responses = await Promise.all(
                    activityIds.map((id) => axios.get<Activity>(`/activity/${id}`))
                )
                setActivities(responses.map((res) => res.data))
            } catch (err) {
                console.error("Failed to fetch activities:", err)
                setError("Failed to fetch activities.")
            } finally {
                setLoading(false)
            }
        }

        fetchActivities()
    }, [activityIds])

    useEffect(() => {
        if (!activityId) return

        const fetchEvent = async () => {
            try {
                setLoading(true)
                const response = await getActivityById(activityId)
                setActivity(response.data)
            } catch (err) {
                console.error("Failed to fetch activity:", err)
                setError("Failed to fetch activity.")
            } finally {
                setLoading(false)
            }
        }

        fetchEvent()
    }, [activityId])

    const createNewActivity = async (activityData: {
        title: string
        question: string
        type: ActivityType
        eventId: string
    }) => {
        try {
            const createdActivity = await createActivity(activityData)
            setActivities((prev) => [...prev, createdActivity])
        } catch (error) {
            console.error("Failed to create activity:", error)
            setError("Failed to create activity.")
        }
    }

    const deleteActivity = async (activityId: string) => {
        try {
            await deleteActivityApi(activityId)
            setActivities((prev) =>
                prev.filter((activity) => activity.activityId !== activityId)
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
    }
}
