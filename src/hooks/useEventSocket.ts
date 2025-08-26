import {useEffect, useState, useRef, useCallback} from "react";
import {toast} from "sonner";
import {getSocket} from "@/lib/socket";
import {Socket} from "socket.io-client";

export default function useEventSocket(eventId: string) {
    const [activeActivityId, setActiveActivityId] = useState<string | null>(null)
    const [shouldFetchGroups, setShouldFetchGroups] = useState(false)
    const [hasActivityChanged, setHasActivityChanged] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const countdownRef = useRef<number>(0)
    const prevActivityId = useRef<string | null>(null)

    useEffect(() => {
        if (!eventId) return

        let socket: Socket | null = null
        let mounted = true

        const setupSocket = async () => {
            try {
                const socketInstance = await getSocket()
                socket = socketInstance
                
                if (!mounted || !socketInstance) return

                // Check if already connected
                if (socketInstance.connected) {
                    setIsConnected(true)
                    socketInstance.emit('joinEvent', eventId)
                }

                socketInstance.on('connect', () => {
                    console.log('🔌 Connected to WebSocket:', socketInstance.id)
                    if (mounted) {
                        setIsConnected(true)
                        socketInstance.emit('joinEvent', eventId)
                    }
                })

                socketInstance.on('activityUpdate', ({eventId: socketEventId, activityId}: { eventId: string, activityId: string }) => {
                    if (!mounted) return
                    
                    console.log('🔥 Received new activity ID:', activityId, 'for the event:', socketEventId)
                    
                    if (socketEventId === eventId && activityId !== prevActivityId.current) {
                        console.log('🔄 Starting 3-second delay before switching to:', activityId)
                        toast.info('🔄 New activity detected! Switching in 3 seconds...')
                        countdownRef.current = 3
                        setHasActivityChanged(true)
                        
                        // Start countdown timer
                        const timer = setInterval(() => {
                            if (!mounted) {
                                clearInterval(timer)
                                return
                            }
                            countdownRef.current = countdownRef.current - 1
                            if (countdownRef.current <= 0) {
                                clearInterval(timer)
                                setActiveActivityId(activityId)
                                countdownRef.current = 0
                                toast.success('✅ Switched to new activity')
                            }
                        }, 1000)
                    }
                    
                    prevActivityId.current = activityId
                })

                // Listen for when groups are created
                socketInstance.on('groupsCreated', (data: { eventId: string, activityId: string }) => {
                    if (!mounted) return
                    
                    console.log('👥 Socket: Received groupsCreated event:', data)
                    if (data.eventId === eventId) {
                        console.log('🚀 Socket: Setting shouldFetchGroups to true for event:', eventId)
                        setShouldFetchGroups(true)
                        toast.success('👥 New partner groups created!')
                    }
                })

                socketInstance.on('disconnect', () => {
                    if (mounted) {
                        setIsConnected(false)
                    }
                })

            } catch (error) {
                console.error('🔌 Failed to setup socket:', error)
                if (mounted) {
                    setIsConnected(false)
                }
            }
        }

        setupSocket()

        return () => {
            mounted = false
            if (socket) {
                socket.off('activityUpdate')
                socket.off('groupsCreated')
                socket.off('connect')
                socket.off('disconnect')
            }
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
        isConnected,
        getCountdown,
        skipCountdown,
        resetShouldFetchGroups,
        resetActivityChanged
    }
}