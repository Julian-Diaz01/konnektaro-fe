import {useState, useEffect} from 'react'
import {
    deleteUserActivity,
    createUserActivity,
    updateUserActivity,
    getUserActivity,
} from '@/services/userActivityService'
import {UserActivity} from '@/types/models'

interface UseUserActivityProps {
    userId?: string
    activityId?: string | null
}

interface updateUserActivity {
    groupId?: string | null
    notes: string | ""
    targetActivityId?: string // this is optional, used for saveOrUpdate logic
}

export default function useUserActivity({userId, activityId}: UseUserActivityProps) {
    const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!userId || !activityId) return

        const fetchUserActivity = async () => {
            try {
                setLoading(true)
                const response = await getUserActivity(userId, activityId)
                setUserActivity(response.data)
            } catch (err) {
                console.error('Failed to fetch user activity:', err)
                setError('Failed to fetch user activity.')
            } finally {
                setLoading(false)
            }
        }

        fetchUserActivity()
    }, [userId, activityId])

    const deleteCurrentUserActivity = async () => {
        if (!userId || !activityId) return
        try {
            await deleteUserActivity(userId, activityId)
            setUserActivity(null)
        } catch (error) {
            console.error('Failed to delete user activity:', error)
            setError('Failed to delete user activity.')
        }
    }

    const createNewUserActivity = async (newUserActivityData: {
        activityId: string
        groupId?: string
        notes: string
        userId: string
    }) => {
        try {
            const {data} = await createUserActivity(newUserActivityData)
            setUserActivity(data)
        } catch (error) {
            console.error('Failed to create user activity:', error)
            setError('Failed to create user activity.')
        }
    }

    const updateCurrentUserActivity = async ({groupId, notes, targetActivityId}: updateUserActivity) => {
        if (!userId || !targetActivityId) return
        try {
            await updateUserActivity(userId, targetActivityId, notes, groupId)
            // Optimistically update notes locally:
            setUserActivity((prev) => (prev ? {...prev, notes} : prev))
        } catch (error) {
            console.error('Failed to update user activity:', error)
            setError('Failed to update user activity.')
        }
    }

    return {
        userActivity,
        loading,
        error,
        deleteCurrentUserActivity,
        createNewUserActivity,
        updateCurrentUserActivity,
    }
}
