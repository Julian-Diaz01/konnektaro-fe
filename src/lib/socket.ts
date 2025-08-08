import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const getSocket = () => {
    if (!socket) {
        socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8080', {
            transports: ['websocket', 'polling'], // Allow both transports
            withCredentials: true,
            timeout: 20000,
            forceNew: true
        })

        // Add error handling
        socket.on('connect_error', (error) => {
            console.error('🔌 Socket connection error:', error)
        })

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason)
        })
    }

    return socket
}

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect()
        socket = null
        console.log('🔌 Socket disconnected manually')
    }
}