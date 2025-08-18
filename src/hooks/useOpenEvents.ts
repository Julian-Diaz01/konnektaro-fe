'use client'

import useSWR from 'swr'
import { getAllEvents } from '@/services/eventService'
import { Event } from '@/types/models'
import { swrConfigStatic } from '@/lib/swr-config'

// Fetcher function for SWR
const fetcher = async () => {
  const response = await getAllEvents()
  return response.data.filter((event: Event) => event.open)
}

/**
 * This hook fetches all open events from the server using SWR for caching
 * and returns them along with a loading state.
 */
export default function useOpenEvents() {
  const { data: events = [], error, isLoading, mutate } = useSWR<Event[]>(
    'open-events',
    fetcher,
    swrConfigStatic
  )

  const loading = isLoading

  return { 
    events, 
    loading, 
    error, 
    refresh: mutate 
  }
}
