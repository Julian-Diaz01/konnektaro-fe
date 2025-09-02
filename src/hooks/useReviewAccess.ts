import {useState, useCallback} from 'react'
import {enableReviewAccess, disableReviewAccess} from '@/services/eventService'
import {toast} from 'sonner'

export default function useReviewAccess() {
    const [loading, setLoading] = useState(false)
    const [isEnabled, setIsEnabled] = useState(false)

    const handleEnableReviews = useCallback(async (eventId: string) => {
        if (!eventId) return

        setLoading(true)
        try {
            await enableReviewAccess(eventId)
            setIsEnabled(true)
            toast.success('Review access enabled')
        } catch (error) {
            console.error('Failed to enable review access:', error)
            toast.error('Failed to enable review access')
        } finally {
            setLoading(false)
        }
    }, [])

    const handleDisableReviews = useCallback(async (eventId: string) => {
        if (!eventId) return

        setLoading(true)
        try {
            await disableReviewAccess(eventId)
            setIsEnabled(false)
            toast.success('Review access disabled')
        } catch (error) {
            console.error('Failed to disable review access:', error)
            toast.error('Failed to disable review access')
        } finally {
            setLoading(false)
        }
    }, [])

    const setInitialState = useCallback((enabled: boolean) => {
        setIsEnabled(enabled)
    }, [])

    return {
        loading,
        isEnabled,
        enableReviews: handleEnableReviews,
        disableReviews: handleDisableReviews,
        setInitialState
    }
}
