import {useEffect, useState, useRef, useCallback} from "react";
import {toast} from "sonner";
import {getSocket} from "@/lib/socket";


export default function useEventSocket(eventId: string) {
    const [activeActivityId, setActiveActivityId] = useState<string | null>(null)
    const countdownRef = useRef<number>(0)
    const prevActivityId = useRef<string | null>(null)

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
            
            if (prevActivityId.current && prevActivityId.current !== activityId) {
                console.log('🔄 Starting 3-second delay before switching to:', activityId)
                toast.info('🔄 New activity detected! Switching in 3 seconds...')
                countdownRef.current = 3
                
                // Start countdown timer
                const timer = setInterval(() => {
                    countdownRef.current = countdownRef.current - 1
                    if (countdownRef.current <= 0) {
                        clearInterval(timer)
                        setActiveActivityId(activityId)
                        countdownRef.current = 0
                        toast.success('✅ Switched to new activity')
                    }
                }, 1000)
            } else {
                // First time or same activity, set immediately
                setActiveActivityId(activityId)
            }
            
            prevActivityId.current = activityId
        })

        return () => {
            socket.off('activityUpdate')
            socket.off('connect')
        }
    }, [eventId])

    const skipCountdown = useCallback(() => {
        if (countdownRef.current > 0) {
            countdownRef.current = 0
            // The next activityId will be set immediately
        }
    }, [])

    const getCountdown = useCallback(() => countdownRef.current, [])

    return {
        activeActivityId,
        getCountdown,
        skipCountdown
    }
}