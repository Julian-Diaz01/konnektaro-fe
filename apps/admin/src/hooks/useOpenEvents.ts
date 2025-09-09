'use client'

import { useState, useEffect, useRef } from 'react'
import { getAllEvents } from '@shared/services/eventService'
import { Event } from '@shared/types/models'
import { getSocket } from '@shared/lib/socket'
import { Socket } from 'socket.io-client'

/**
 * This hook fetches all open events from the server with real-time socket updates
 * Listens for user join/leave events to update event data in real-time
 */
export default function useOpenEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const lastFetchTime = useRef<number>(0)
  const lastFetchPromise = useRef<Promise<Event[]> | null>(null)

  const fetchEvents = async (force = false): Promise<Event[]> => {
    const now = Date.now()
    
    // Prevent duplicate calls within 1 second unless forced
    if (!force && now - lastFetchTime.current < 1000) {
      // If there's an ongoing fetch, return that promise
      if (lastFetchPromise.current) {
        return lastFetchPromise.current
      }
      // Otherwise, wait for the 1-second interval
      await new Promise(resolve => setTimeout(resolve, 1000 - (now - lastFetchTime.current)))
    }

    // Create new fetch promise
    const fetchPromise = (async () => {
      const response = await getAllEvents()
      return response.data.filter((event: Event) => event.open)
    })()
    
    lastFetchPromise.current = fetchPromise
    
    try {
      setLoading(true)
      setError(null)
      const result = await fetchPromise
      setEvents(result)
      lastFetchTime.current = Date.now()
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
      lastFetchPromise.current = null
    }
  }

  // Socket setup for real-time updates
  useEffect(() => {
    let socket: Socket | null = null
    let mounted = true

    const setupSocket = async () => {
      try {
        const socketInstance = await getSocket()
        socket = socketInstance
        
        if (!mounted || !socketInstance) return

        // Listen for user join events
        socketInstance.on('userJoinedEvent', async (data: { eventId: string, userId: string }) => {
          if (!mounted) return
          console.log('👤 User joined event:', data)
          
          // Refresh events data to get updated participant counts
          try {
            await fetchEvents(true)
          } catch (error) {
            console.error('Failed to refresh events after user join:', error)
          }
        })

        // Listen for user leave events
        socketInstance.on('userLeftEvent', async (data: { eventId: string, userId: string }) => {
          if (!mounted) return
          console.log('👤 User left event:', data)
          
          // Refresh events data to get updated participant counts
          try {
            await fetchEvents(true)
          } catch (error) {
            console.error('Failed to refresh events after user leave:', error)
          }
        })

        // Listen for event updates (when events are created, closed, etc.)
        socketInstance.on('eventUpdated', async (data: { eventId: string }) => {
          if (!mounted) return
          console.log('📅 Event updated:', data)
          
          // Refresh events data
          try {
            await fetchEvents(true)
          } catch (error) {
            console.error('Failed to refresh events after event update:', error)
          }
        })

        // Join a general events room to receive updates
        socketInstance.emit('joinEventsRoom')

      } catch (error) {
        console.error('🔌 Failed to setup events socket:', error)
      }
    }

    setupSocket()

    return () => {
      mounted = false
      if (socket) {
        socket.off('userJoinedEvent')
        socket.off('userLeftEvent')
        socket.off('eventUpdated')
      }
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchEvents()
  }, [])

  return { 
    events, 
    loading, 
    error, 
    refresh: () => fetchEvents(true) // Force refresh
  }
}