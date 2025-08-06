import {useCallback, useState} from 'react'
import {getAllUserByEvent} from '@/services/eventService'
import {PartialUser} from '@/types/models'


export function useUser() {
    const [users, setUsers] = useState<PartialUser[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchUsersByEvent = useCallback(async (eventId?: string) => {
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

    // Placeholder for fetching a single user by userId if needed in the future
    const fetchUser = async (userId: string) => {
        if (!userId) {
            setError('No userId provided')
            return
        }
        // TODO: Implement fetch single user by userId if needed
    }

    const deleteUser = (userId: string) => {
        if (!userId) {
            setError('No userId provided')
            return
        }
        setUsers((prev) => prev.filter((user) => user.userId !== userId))
    }

    return {
        users,
        loading,
        error,
        fetchUsersByEvent,
        fetchUser,
        deleteUser,
    }
}
