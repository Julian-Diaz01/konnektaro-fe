'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
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

    const fetchUser = async (id: string) => {
        if (!id) return

        try {
            setLoading(true)
            setError(null)
            const response = await getUser(id)
            setUser(response.data)
        } catch (err) {
            console.error("Failed to fetch user:", err)
            setError("Failed to fetch user.")
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
        if (userId) {
            fetchUser(userId)
        } else {
            setUser(null)
            setLoading(false)
            setError(null)
        }
    }, [userId])

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
