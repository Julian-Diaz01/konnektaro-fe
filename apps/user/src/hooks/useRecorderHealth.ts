import { useState, useEffect } from 'react'
import { testConnection } from '@konnektaro/speech-to-text'
import { useUserContext } from '@shared/contexts/UserContext'

interface UseRecorderHealthReturn {
    isHealthy: boolean
    isChecking: boolean
    lastChecked: Date | null
    checkHealth: () => Promise<void>
}

export default function useRecorderHealth(): UseRecorderHealthReturn {
    const [isHealthy, setIsHealthy] = useState(false)
    const [isChecking, setIsChecking] = useState(false)
    const [lastChecked, setLastChecked] = useState<Date | null>(null)
    const { firebaseUser } = useUserContext()

    const checkHealth = async () => {
        const apiUrl = process.env.NEXT_PUBLIC_RECORDER_API_URL
        
        if (!apiUrl) {
            setIsHealthy(false)
            setLastChecked(new Date())
            return
        }

        setIsChecking(true)
        
        try {
            let token: string | undefined
            if (firebaseUser) {
                token = await firebaseUser.getIdToken()
            }
            
            const healthy = await testConnection(apiUrl, token)
            setIsHealthy(healthy)
        } catch (error) {
            console.error('Health check failed:', error)
            setIsHealthy(false)
        } finally {
            setIsChecking(false)
            setLastChecked(new Date())
        }
    }

    // Check health on mount and when firebaseUser changes
    useEffect(() => {
        checkHealth()
    }, [firebaseUser])

    return {
        isHealthy,
        isChecking,
        lastChecked,
        checkHealth
    }
}
