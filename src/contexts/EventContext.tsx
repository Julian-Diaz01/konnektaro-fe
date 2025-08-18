'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Event } from '@/types/models'
import { getEventById, deleteEvent, createEvent } from '@/services/eventService'

interface EventContextType {
  event: Event | null
  loading: boolean
  error: string | null
  setEvent: (event: Event | null) => void
  deleteCurrentEvent: (eventId: string) => Promise<void>
  createNewEvent: (newEventData: Omit<Event, "eventId">) => Promise<void>
  refreshEvent: (eventId: string) => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

interface EventProviderProps {
  children: ReactNode
  eventId?: string
}

export function EventProvider({ children, eventId }: EventProviderProps) {
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = async (id: string) => {
    if (!id) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await getEventById(id)
      setEvent(response.data)
    } catch (err) {
      console.error("Failed to fetch event:", err)
      setError("Failed to fetch event.")
    } finally {
      setLoading(false)
    }
  }

  const refreshEvent = async (id: string) => {
    await fetchEvent(id)
  }

  const deleteCurrentEvent = async (id: string) => {
    if (!id) return
    try {
      await deleteEvent(id)
      setEvent(null)
    } catch (error) {
      console.error("Failed to delete event:", error)
      setError("Failed to delete event.")
    }
  }

  const createNewEvent = async (newEventData: Omit<Event, "eventId">) => {
    try {
      const { data } = await createEvent(newEventData)
      setEvent(data)
    } catch (error) {
      console.error("Failed to create event:", error)
      setError("Failed to create event.")
    }
  }

  useEffect(() => {
    if (eventId) {
      fetchEvent(eventId)
    } else {
      setEvent(null)
      setLoading(false)
      setError(null)
    }
  }, [eventId])

  const value: EventContextType = {
    event,
    loading,
    error,
    setEvent,
    deleteCurrentEvent,
    createNewEvent,
    refreshEvent
  }

  return (
    <EventContext.Provider value={value}>
      {children}
    </EventContext.Provider>
  )
}

export function useEventContext() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEventContext must be used within an EventProvider')
  }
  return context
}
