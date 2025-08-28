'use client'

import React, {ReactNode} from 'react'
import {EventProvider} from './EventContext'

interface AppContextProps {
    children: ReactNode
    eventId?: string
}

export function AppContext({children, eventId}: AppContextProps) {
    return (
        <EventProvider eventId={eventId}>
            {children}
        </EventProvider>
    )
}
