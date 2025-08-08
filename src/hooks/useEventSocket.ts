import {useEffect, useState} from "react";
import {getSocket} from "@/lib/socket";


export default function useEventSocket(eventId: string) {
    const [activeActivityId, setActiveActivityId] = useState<string | null>(null)

    useEffect(() => {
        if (!eventId) return
        const socket = getSocket()

        socket.on('connect', () => {
            console.log('🔌 Connected to WebSocket:', socket.id)
            if (eventId) {
                socket.emit('joinEvent', eventId)
            }
        })

        socket.on('activityUpdate', ({eventId, activityId}: { eventId: string, activityId: string }) => {
            console.log('🔥 Received new activity ID:', activityId, 'for the event:', eventId)
            setActiveActivityId(activityId)
            // You can now trigger refetch or update local state
        })

        return () => {
            socket.off('activityUpdate')
            socket.off('connect')
            // Don't disconnect here - let the socket stay connected
            // socket.disconnect() // Remove this line
        }
    }, [eventId])

    return {activeActivityId}
}