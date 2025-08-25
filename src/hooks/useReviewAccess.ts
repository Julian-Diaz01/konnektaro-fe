import {useState, useCallback} from 'react'
import {enableReviewAccess, disableReviewAccess} from '@/services/eventService'
import {toast} from 'sonner'

interface UseReviewAccessProps {
    eventId: string
}

export default function useReviewAccess({eventId}: UseReviewAccessProps) {
    const [loading, setLoading] = useState(false)

    const handleEnableReviews = useCallback(async () => {
        if (!eventId) return
        
        setLoading(true)
        try {
            await enableReviewAccess(eventId)
            // The socket event will handle the state update and toast
        } catch (error) {
            console.error('Failed to enable review access:', error)
            toast.error('Failed to enable review access')
        } finally {
            setLoading(false)
        }
    }, [eventId])

    const handleDisableReviews = useCallback(async () => {
        if (!eventId) return
        
        setLoading(true)
        try {
            await disableReviewAccess(eventId)
            // The socket event will handle the state update and toast
        } catch (error) {
            console.error('Failed to disable review access:', error)
            toast.error('Failed to disable review access')
        } finally {
            setLoading(false)
        }
    }, [eventId])

    return {
        loading,
        enableReviews: handleEnableReviews,
        disableReviews: handleDisableReviews
    }
}
