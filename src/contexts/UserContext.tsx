'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { User } from '@/types/models'
import { createUser, deleteUser as deleteUserApi, getUser } from '@/services/userService'

interface UserContextType {
    user: User | null
    loading: boolean
    error: string | null
    setUser: (user: User | null) => void
    createNewUser: (newUserData: User) => Promise<void>
    deleteUser: (userId: string) => Promise<void>
    refreshUser: (userId: string) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
    children: ReactNode
    userId?: string | null
}

export function UserProvider({ children, userId }: UserProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const lastFetchedUserId = useRef<string | null>(null)
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const fetchUser = async (id: string) => {
        if (!id) return

        try {
            setLoading(true)
            setError(null)
            const response = await getUser(id)
            setUser(response.data)
        } catch (err: unknown) {
            console.error("Failed to fetch user:", err)
            // If user doesn't exist (404), don't treat it as an error
            // This is normal for users who haven't created an account yet
            if (typeof err === 'object' && err !== null && 'response' in err) {
                const errorResponse = err as { response?: { status?: number } }
                if (errorResponse.response?.status === 404) {
                    setUser(null)
                    setError(null)
                } else {
                    setError("Failed to fetch user.")
                }
            } else {
                setError("Failed to fetch user.")
            }
        } finally {
            setLoading(false)
        }
    }

    const refreshUser = async (id: string) => {
        await fetchUser(id)
    }

    const createNewUser = async (newUserData: User) => {
        try {
            const userData = await createUser(newUserData)
            setUser(userData.data)
            console.log('done creating user')
        } catch (error) {
            console.error("Failed to create user:", error)
            setError("Failed to create user.")
        }
    }

    const deleteUser = async (id: string) => {
        if (!id) return
        try {
            await deleteUserApi(id)
            setUser(null)
        } catch (error) {
            console.error("Failed to delete user:", error)
            setError("Failed to delete user.")
        }
    }

    useEffect(() => {
        // Clear any pending fetch timeout
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current)
            fetchTimeoutRef.current = null
        }

        if (userId) {
            // Only fetch if this is a different user than we last fetched
            if (lastFetchedUserId.current !== userId) {
                lastFetchedUserId.current = userId
                fetchUser(userId)
            }
        } else {
            setUser(null)
            setLoading(false)
            setError(null)
            lastFetchedUserId.current = null
        }
    }, [userId])

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (fetchTimeoutRef.current) {
                clearTimeout(fetchTimeoutRef.current)
            }
        }
    }, [])

    const value: UserContextType = {
        user,
        loading,
        error,
        setUser,
        createNewUser,
        deleteUser,
        refreshUser
    }

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    )
}

export function useUserContext() {
    const context = useContext(UserContext)
    if (context === undefined) {
        throw new Error('useUserContext must be used within a UserProvider')
    }
    return context
}
