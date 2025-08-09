import {useState, useEffect} from "react"
import {
    createUser,
    deleteUser as deleteUserApi,
    getUser,
} from "@/services/userService"
import {User} from "@/types/models"

export default function useUser(userId: string | null) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!userId) return

        const fetchEvent = async () => {
            try {
                setLoading(true)
                const response = await getUser(userId)
                setUser(response.data)
            } catch (err) {
                console.error("Failed to fetch user:", err)
                setError("Failed to fetch user.")
            } finally {
                setLoading(false)
            }
        }

        fetchEvent()
    }, [userId])


    const createNewUser = async (newUserData: User) => {
        try {
            const userData = await createUser(newUserData)
            setUser(userData.data)
        } catch (error) {
            console.error("Failed to create user:", error)
            setError("Failed to create user.")
        }
    }

    const deleteUser = async (userId: string) => {
        if (!userId) return
        try {
            await deleteUserApi(userId)
        } catch (error) {
            console.error("Failed to delete user:", error)
            setError("Failed to delete user.")
        }
    }

    return {
        user,
        loading,
        error,
        createNewUser,
        deleteUser,
    }
}
