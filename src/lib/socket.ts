import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null
let isConnecting = false

export const getSocket = () => {
    if (!socket || !socket.connected) {
        if (isConnecting) {
            // Wait for existing connection attempt
            return new Promise<Socket>((resolve) => {
                const checkConnection = () => {
                    if (socket && socket.connected) {
                        resolve(socket)
                    } else if (!isConnecting) {
                        // Connection attempt failed, try again
                        socket = null
                        resolve(getSocket())
                    } else {
                        setTimeout(checkConnection, 100)
                    }
                }
                checkConnection()
            })
        }

        isConnecting = true
        console.log('🔌 Creating new socket connection...')
        
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080', {
            transports: ['websocket', 'polling'],
            withCredentials: true,
            timeout: 20000,
            forceNew: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        })

        // Add comprehensive error handling
        socket.on('connect', () => {
            console.log('🔌 Socket connected successfully:', socket?.id)
            isConnecting = false
        })

        socket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error)
            isConnecting = false
        })

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason)
            isConnecting = false
            
            // Auto-reconnect for unexpected disconnections
            if (reason === 'io server disconnect' || reason === 'io client disconnect') {
                console.log('🔌 Attempting to reconnect...')
                setTimeout(() => {
                    if (socket) {
                        socket.connect()
                    }
                }, 1000)
            }
        })

        socket.on('reconnect', (attemptNumber) => {
            console.log('🔌 Socket reconnected after', attemptNumber, 'attempts')
            isConnecting = false
        })

        socket.on('reconnect_error', (error) => {
            console.error('🔌 Socket reconnection error:', error)
            isConnecting = false
        })

        socket.on('reconnect_failed', () => {
            console.error('🔌 Socket reconnection failed after all attempts')
            isConnecting = false
        })
    }

    return socket
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
        isConnecting = false
        console.log('🔌 Socket disconnected manually')
    }
}

export const isSocketConnected = () => {
    return socket?.connected || false
}