'use client'

import { useState, useEffect, useRef } from 'react'
import { getAllEvents } from '@/services/eventService'
import { Event } from '@/types/models'

/**
 * This hook fetches all open events from the server with simple 1-second deduplication
 * No caching - always fresh data for live events
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

  // Initial fetch
  useEffect(() => {
    fetchEvents()
  }, [])

  // TODO: Auto-refresh functionality for future implementation
  // Uncomment when you want live data updates
  /*
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents()
    }, 5000)

    return () => clearInterval(interval)
  }, [])
  */

  return { 
    events, 
    loading, 
    error, 
    refresh: () => fetchEvents(true) // Force refresh
  }
}