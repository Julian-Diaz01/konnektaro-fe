'use client'

import { useEffect } from 'react'
import { mutate } from 'swr'

export default function EventsInitializer() {
    useEffect(() => {
        // Force fresh events data when the app first loads
        // This ensures we always have the latest events, not stale cache
        // Clear any existing events cache first, then force fresh fetch
        mutate('open-events', undefined, { revalidate: false })
        mutate('open-events', undefined, { revalidate: true })
    }, [])
    
    return null // This component doesn't render anything
}
