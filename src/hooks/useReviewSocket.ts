import {useEffect, useCallback} from 'react'
import {getSocket} from '@/lib/socket'
import {toast} from 'sonner'
import {useEventContext} from '@/contexts/EventContext'

interface UseReviewSocketProps {
    eventId: string
}

export default function useReviewSocket({eventId}: UseReviewSocketProps) {
    const {updateReviewAccess} = useEventContext()

    useEffect(() => {
        if (!eventId) return
        
        const socket = getSocket()

        // Listen for review access changes
        socket.on('reviewOn', (data: { eventId: string }) => {
            console.log('🔌 Socket: Received reviewOn event for event:', data.eventId)
            if (data.eventId === eventId) {
                updateReviewAccess(true)
                toast.success('✅ Reviews are now enabled for this event!')
            }
        })

        socket.on('reviewOff', (data: { eventId: string }) => {
            console.log('🔌 Socket: Received reviewOff event for event:', data.eventId)
            if (data.eventId === eventId) {
                updateReviewAccess(false)
                toast.info('⏸️ Reviews are now disabled for this event')
            }
        })

        return () => {
            socket.off('reviewOn')
            socket.off('reviewOff')
        }
    }, [eventId, updateReviewAccess])

    const emitReviewOn = useCallback(() => {
        const socket = getSocket()
        socket.emit('reviewOn', { eventId })
    }, [eventId])

    const emitReviewOff = useCallback(() => {
        const socket = getSocket()
        socket.emit('reviewOff', { eventId })
    }, [eventId])

    return {
        emitReviewOn,
        emitReviewOff
    }
}
