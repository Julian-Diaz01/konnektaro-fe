'use client'

import { useState, useEffect, useRef } from 'react'
import { getUser, createUser, deleteUser as deleteUserApi } from '@/services/userService'
import { User } from '@/types/models'

export default function useUser(userId: string | null) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const lastFetchTime = useRef<number>(0)
  const lastFetchPromise = useRef<Promise<User> | null>(null)

  const fetchUser = async (id: string, force = false): Promise<User> => {
    const now = Date.now()
    
    // Prevent duplicate calls within 1 second unless forced
    if (!force && now - lastFetchTime.current < 1000) {
      if (lastFetchPromise.current) {
        return lastFetchPromise.current
      }
      await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastFetchTime.current)))
    }
  
    // Create a promise that resolves to User, not AxiosResponse<User>
    const fetchPromise = getUser(id).then(response => response.data)
    lastFetchPromise.current = fetchPromise

   try {
    setLoading(true)
    setError(null)
    const userData = await fetchPromise
    setUser(userData)
    lastFetchTime.current = Date.now()
    return userData
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user'
    setError(errorMessage)
    throw err
  } finally {
    setLoading(false)
    lastFetchPromise.current = null
  }
  }

  // Fetch user when userId changes
  useEffect(() => {
    if (userId) {
      fetchUser(userId)
    } else {
      setUser(null)
      setLoading(false)
      setError(null)
    }
  }, [userId])

  const createNewUser = async (newUserData: User) => {
    try {
      const userData = await createUser(newUserData)
      setUser(userData.data)
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
      setUser(null)
    } catch (error) {
      console.error("Failed to delete user:", error)
      throw error
    }
  }

  return {
    user: user || null,
    loading,
    error: error || null,
    createNewUser,
    deleteUser,
    refresh: () => userId ? fetchUser(userId, true) : Promise.reject('No userId')
  }
}
