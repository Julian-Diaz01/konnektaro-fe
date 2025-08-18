import {useEffect, useState, useRef, useCallback} from "react";
import {toast} from "sonner";
import {getSocket} from "@/lib/socket";


export default function useEventSocket(eventId: string) {
    const [activeActivityId, setActiveActivityId] = useState<string | null>(null)
    const [shouldFetchGroups, setShouldFetchGroups] = useState(false)
    const [hasActivityChanged, setHasActivityChanged] = useState(false)
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

        socket.on('activityUpdate', ({eventId: socketEventId, activityId}: { eventId: string, activityId: string }) => {
            console.log('🔥 Received new activity ID:', activityId, 'for the event:', socketEventId)
            
           
                console.log('🔄 Starting 3-second delay before switching to:', activityId)
                toast.info('🔄 New activity detected! Switching in 3 seconds...')
                countdownRef.current = 3
                setHasActivityChanged(true)
                
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
            
            
            prevActivityId.current = activityId
        })

        // Listen for when groups are created
        socket.on('groupsCreated', (data: { eventId: string, activityId: string }) => {
            console.log('👥 Socket: Received groupsCreated event:', data)
            if (data.eventId === eventId) {
                console.log('🚀 Socket: Setting shouldFetchGroups to true for event:', eventId)
                setShouldFetchGroups(true)
                toast.success('👥 New partner groups created!')
            }
        })

        return () => {
            socket.off('activityUpdate')
            socket.off('groupsCreated')
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

    const resetShouldFetchGroups = useCallback(() => {
        setShouldFetchGroups(false)
    }, [])

    const resetActivityChanged = useCallback(() => {
        setHasActivityChanged(false)
    }, [])

    return {
        activeActivityId,
        shouldFetchGroups,
        hasActivityChanged,
        getCountdown,
        skipCountdown,
        resetShouldFetchGroups,
        resetActivityChanged
    }
}