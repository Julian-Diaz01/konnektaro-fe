import {useCallback, useState} from 'react'
import {getAllUserByEvent} from '@shared/services/eventService'
import {getUser, deleteUser as deleteUserApi} from '@shared/services/userService'
import {PartialUser} from '@shared/types/models'


export function useAdminUser() {
    const [users, setUsers] = useState<PartialUser[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUsersByEvent = useCallback(async (eventId?: string) => {
        setError(null)
        if (!eventId) {
            setError('No eventId provided')
            return
        }
        try {
            setLoading(true)
            const response = await getAllUserByEvent(eventId)
            setUsers(Array.isArray(response.data) ? response.data : [])
        } catch (err) {
            console.error("Failed to fetch users:", err)
            setError("Failed to fetch users.")
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchUser = useCallback(async (userId?: string) => {
        setError(null)
        if (!userId) {
            setError('No userId provided')
            return
        }
        try {
            setLoading(true)
            const response = await getUser(userId)
            // Optionally update users state or return the user
            return response.data
        } catch (err) {
            console.error("Failed to fetch user:", err)
            setError("Failed to fetch user.")
        } finally {
            setLoading(false)
        }
    }, [])

    const deleteUser = useCallback(async (userId?: string) => {
        setError(null)
        if (!userId) {
            setError('No userId provided')
            return
        }
        try {
            setLoading(true)
            await deleteUserApi(userId)
            setUsers((prev) => prev.filter((user) => user.userId !== userId))
        } catch (err) {
            console.error("Failed to delete user:", err)
            setError("Failed to delete user.")
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        users,
        loading,
        error,
        fetchUsersByEvent,
        fetchUser,
        deleteUser,
    }
}
