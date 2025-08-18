'use client'

import React, { ReactNode } from 'react'
import { EventProvider } from './EventContext'
import { UserProvider } from './UserContext'

interface AppContextProps {
  children: ReactNode
  eventId?: string
  userId?: string | null
}

export function AppContext({ children, eventId, userId }: AppContextProps) {
  return (
    <UserProvider userId={userId}>
      <EventProvider eventId={eventId}>
        {children}
      </EventProvider>
    </UserProvider>
  )
}
