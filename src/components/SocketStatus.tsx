'use client'

import { useEffect, useState } from 'react'
import { isSocketConnected } from '@/lib/socket'

export default function SocketStatus() {
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        const checkConnection = () => {
            setIsConnected(isSocketConnected())
        }

        // Check immediately
        checkConnection()

        // Check every 2 seconds
        const interval = setInterval(checkConnection, 2000)

        return () => clearInterval(interval)
    }, [])

    if (process.env.NODE_ENV === 'production') {
        return null // Don't show in production
    }

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <div className={`px-3 py-2 rounded-lg text-white text-sm font-mono ${
                isConnected ? 'bg-green-600' : 'bg-red-600'
            }`}>
                🔌 {isConnected ? 'Connected' : 'Disconnected'}
            </div>
        </div>
    )
}
