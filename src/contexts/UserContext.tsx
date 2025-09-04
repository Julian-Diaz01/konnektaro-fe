'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react'
import { User } from '@/types/models'
import { createUser, deleteUser as deleteUserApi, getUser } from '@/services/userService'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { auth } from '@/utils/firebase'
import { getSocket } from '@/lib/socket'

interface UserContextType {
    user: User | null
    firebaseUser: FirebaseUser | null
    loading: boolean
    authLoading: boolean
    error: string | null
    setUser: (user: User | null) => void
    createNewUser: (newUserData: User) => Promise<void>
    deleteUser: (userId: string) => Promise<void>
    refreshUser: (userId: string) => Promise<void>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
    children: ReactNode
 //   userId?: string | null
}

export function UserProvider({ children }: UserProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
    const [loading, setLoading] = useState(false)
    const [authLoading, setAuthLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const lastFetchedUserId = useRef<string | null>(null)
    const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    // Firebase auth state management
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setFirebaseUser(firebaseUser)
            setAuthLoading(false)
        })

        return () => unsubscribe()
    }, [])

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
            
            // Force a fresh fetch of user data to ensure we have the complete user object
            // This is important because the user was just created and we need to fetch
            // any additional data that might not be in the creation response
            if (firebaseUser?.uid && firebaseUser?.uid === newUserData.userId) {
                // Reset the last fetched ID so the useEffect will trigger a refetch
                lastFetchedUserId.current = null
                // Trigger immediate refetch
                fetchUser(firebaseUser?.uid)
            }
        } catch (error) {
            console.error("Failed to create user:", error)
            setError("Failed to create user.")
        }
    }

    const deleteUser = async (id: string) => {
        if (!id) return
        try {
            // Store eventId before deleting user for socket event
            const eventId = user?.eventId
            
            await deleteUserApi(id)
            setUser(null)
            
            // Emit socket event to notify other users that someone left the event
            if (eventId) {
                try {
                    const socket = await getSocket()
                    if (socket && socket.connected) {
                        socket.emit('userLeftEvent', { 
                            eventId, 
                            userId: id,
                            userName: user?.name 
                        })
                        console.log('🔌 Emitted userLeftEvent:', { eventId, userId: id })
                    }
                } catch (socketError) {
                    console.warn('⚠️ Failed to emit userLeftEvent socket event:', socketError)
                }
            }
        } catch (error) {
            console.error("Failed to delete user:", error)
            setError("Failed to delete user.")
        }
    }

// ... existing code ...

    useEffect(() => {
        // Clear any pending fetch timeout
        if (fetchTimeoutRef.current) {
            clearTimeout(fetchTimeoutRef.current)
            fetchTimeoutRef.current = null
        }

        if (firebaseUser?.uid) {
            // Only fetch if this is a different user than we last fetched
            if (lastFetchedUserId.current !== firebaseUser?.uid) {
                lastFetchedUserId.current = firebaseUser?.uid
                fetchUser(firebaseUser?.uid)
            }
        } else {
            setUser(null)
            setLoading(false)
            setError(null)
            lastFetchedUserId.current = null
        }
    }, [firebaseUser?.uid])

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
        firebaseUser,
        loading,
        authLoading,
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
