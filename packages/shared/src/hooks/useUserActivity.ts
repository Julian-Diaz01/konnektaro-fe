import {useState} from 'react'
import useSWR from 'swr'
import {
    deleteUserActivity,
    createUserActivity,
    updateUserActivity,
    getUserActivity,
} from '../services/userActivityService'
import {UserActivity} from '../types/models'
import { swrConfigFrequent } from '../lib/swr-config'

interface UseUserActivityProps {
    userId?: string
    activityId?: string | null
}

interface updateUserActivity {
    groupId?: string | null
    notes: string | ""
    targetActivityId?: string // this is optional, used for saveOrUpdate logic
}

// Fetcher function for SWR (handles array key)
const fetcher = async (key: unknown) => {
    const arr = Array.isArray(key) ? key : [key]
    const [, userId, activityId] = arr as [string, string, string]
    if (!userId || !activityId) {
        throw new Error('Missing userId or activityId')
    }
    const response = await getUserActivity(userId, activityId)
    return response.data
}

export default function useUserActivity({userId, activityId}: UseUserActivityProps) {
    const [error, setError] = useState<string | null>(null)

    // Stable array key - only create when we have valid data
    const swrKey = userId && activityId ? ['user-activity', userId, activityId] : null

    // Use SWR for data fetching with caching - only when we have valid keys
    const {
        data: userActivity,
        isLoading: loading,
        mutate
    } = useSWR<UserActivity>(
        swrKey,
        fetcher,
        {
            ...swrConfigFrequent,
            onErrorRetry: (
                err: Error & { status?: number },
                _key,
                config,
                revalidate,
                { retryCount }
            ) => {
                // For 404, retry once then stop
                if (err?.status === 404) {
                    if (retryCount >= 1) return
                    setTimeout(() => revalidate({ retryCount: retryCount + 1 }), 500)
                    return
                }
                // Default behavior for other errors: up to 3 retries
                if (retryCount >= 3) return
                setTimeout(() => revalidate({ retryCount: retryCount + 1 }), config.errorRetryInterval ?? 5000)
            }
        }
    )

    const deleteCurrentUserActivity = async () => {
        if (!userId || !activityId) return
        try {
            await deleteUserActivity(userId, activityId)
            // Optimistically update the cache
            mutate(undefined, false)
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
            // Update the cache with new data
            mutate(data, false)
        } catch (error) {
            console.error('Failed to create user activity:', error)
            setError('Failed to create user activity.')
        }
    }

    const updateCurrentUserActivity = async ({groupId, notes, targetActivityId}: updateUserActivity) => {
        if (!userId || !targetActivityId) return
        try {
            await updateUserActivity(userId, targetActivityId, notes, groupId)
            // Optimistically update the cache
            mutate((prev) => (prev ? {...prev, notes} : prev), false)
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
        refresh: mutate, // Expose refresh function for manual updates
    }
}
