import useSWR from 'swr'
import {
    createUser,
    deleteUser as deleteUserApi,
    getUser,
} from "@/services/userService"
import {User} from "@/types/models"
import { swrConfigStatic } from '@/lib/swr-config'

// Fetcher function for SWR
const fetcher = async (userId: string) => {
    const response = await getUser(userId)
    return response.data
}

export default function useUser(userId: string | null) {
    // Use SWR for data fetching with automatic caching and deduplication
    const { data: user, error, isLoading, mutate } = useSWR<User>(
        userId ? `user-${userId}` : null, // Only fetch when userId exists
        () => fetcher(userId!), // userId is guaranteed to exist when this runs
        {
            ...swrConfigStatic,
            // Don't revalidate on focus for user data to reduce unnecessary calls
            revalidateOnFocus: false,
            // Keep data in cache for 5 minutes
            dedupingInterval: 5 * 60 * 1000,
        }
    )

    const createNewUser = async (newUserData: User) => {
        try {
            const userData = await createUser(newUserData)
            // Update the SWR cache with the new user data
            mutate(userData.data, false)
            return userData
        } catch (error) {
            console.error("Failed to create user:", error)
            throw error
        }
    }

    const deleteUser = async (userIdToDelete: string) => {
        if (!userIdToDelete) return
        try {
            await deleteUserApi(userIdToDelete)
            // Remove the user from SWR cache
            mutate(undefined, false)
        } catch (error) {
            console.error("Failed to delete user:", error)
            throw error
        }
    }

    return {
        user: user || null,
        loading: isLoading,
        error: error?.message || null,
        createNewUser,
        deleteUser,
        refresh: mutate,
    }
}
