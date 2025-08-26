import {useEffect, useCallback, useState} from 'react'
import {getSocket} from '@/lib/socket'
import {toast} from 'sonner'
import {useEventContext} from '@/contexts/EventContext'

interface UseReviewSocketProps {
    eventId: string
}

export default function useReviewSocket({eventId}: UseReviewSocketProps) {
    const {updateReviewAccess} = useEventContext()
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        if (!eventId) return
        
        let socket: any = null
        let mounted = true

        const setupSocket = async () => {
            try {
                socket = await getSocket()
                
                if (!mounted) return

                // Check if already connected
                if (socket.connected) {
                    setIsConnected(true)
                }

                socket.on('connect', () => {
                    if (mounted) {
                        setIsConnected(true)
                    }
                })

                // Listen for review access changes
                socket.on('reviewOn', (data: { eventId: string }) => {
                    if (!mounted) return
                    
                    console.log('🔌 Socket: Received reviewOn event for event:', data.eventId)
                    if (data.eventId === eventId) {
                        updateReviewAccess(true)
                        toast.success('✅ Reviews are now enabled for this event!')
                    }
                })

                socket.on('reviewOff', (data: { eventId: string }) => {
                    if (!mounted) return
                    
                    console.log('🔌 Socket: Received reviewOff event for event:', data.eventId)
                    if (data.eventId === eventId) {
                        updateReviewAccess(false)
                        toast.info('⏸️ Reviews are now disabled for this event')
                    }
                })

                socket.on('disconnect', () => {
                    if (mounted) {
                        setIsConnected(false)
                    }
                })

            } catch (error) {
                console.error('🔌 Failed to setup review socket:', error)
                if (mounted) {
                    setIsConnected(false)
                }
            }
        }

        setupSocket()

        return () => {
            mounted = false
            if (socket) {
                socket.off('reviewOn')
                socket.off('reviewOff')
                socket.off('connect')
                socket.off('disconnect')
            }
        }
    }, [eventId, updateReviewAccess])

    const emitReviewOn = useCallback(async () => {
        try {
            const socket = await getSocket()
            socket.emit('reviewOn', { eventId })
        } catch (error) {
            console.error('🔌 Failed to emit reviewOn:', error)
            toast.error('Failed to enable reviews')
        }
    }, [eventId])

    const emitReviewOff = useCallback(async () => {
        try {
            const socket = await getSocket()
            socket.emit('reviewOff', { eventId })
        } catch (error) {
            console.error('🔌 Failed to emit reviewOff:', error)
            toast.error('Failed to disable reviews')
        }
    }, [eventId])

    return {
        emitReviewOn,
        emitReviewOff,
        isConnected
    }
}
