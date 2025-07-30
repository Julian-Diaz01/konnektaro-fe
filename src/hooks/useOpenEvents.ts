'use client'

import { useEffect, useState } from 'react'
import { getAllEvents } from '@/services/eventService'
import { Event } from '@/types/models'
/**
 * This hook fetches all open events from the server and returns them along with a loading state.
 * **/
export default function useOpenEvents() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await getAllEvents()
                const openEvents = response.data.filter((event: Event) => event.open)
                setEvents(openEvents)
            } catch (err) {
                console.error('Failed to fetch events:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchEvents()
    }, [])

    return { events, loading }
}
