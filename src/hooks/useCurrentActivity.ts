import {useState, useEffect, useCallback} from 'react'
import {toast} from 'sonner'
import useUserActivity from './useUserActivity'
import useActivity from './useActivity'
import {UserActivity} from '@/types/models'

interface UseCurrentActivityProps {
    userId: string
    activityId: string | null | undefined
    countdown: number
}

export default function useCurrentActivity({
    userId,
    activityId,
    countdown,
}: UseCurrentActivityProps) {
    const {
        activity,
        loading: activitiesLoading,
    } = useActivity({activityId: activityId || null})

    const {
        userActivity,
        createNewUserActivity,
        updateCurrentUserActivity,
        loading: loadingUserActivity,
        error: errorUserActivity
    } = useUserActivity({userId, activityId: activityId})

    const [notes, setNotes] = useState(userActivity?.notes || '')
    const [groupId] = useState(undefined)
    
    // Track initial notes to detect changes
    const [initialNotes, setInitialNotes] = useState(userActivity?.notes || '')

    // Helper function to check if notes have changed - memoized with useCallback
    const hasNotesChanged = useCallback(() => {
        return notes !== initialNotes
    }, [notes, initialNotes])

    // Keep notes synced with fetched userActivity
    useEffect(() => {
        if (userActivity?.notes) {
            setNotes(userActivity.notes)
            setInitialNotes(userActivity.notes)
        }
    }, [userActivity])

    // Memoize saveOrUpdate function to prevent unnecessary re-renders
    const saveOrUpdate = useCallback(async (targetActivityId: string, targetUserActivity?: UserActivity | null, targetNotes?: string) => {
        if (!userId || !targetActivityId || !targetNotes?.trim()) {
            toast.error('❌ Save cancelled - missing required data')
            return
        }

        // Check if there's existing user activity for the target activity
        const hasExistingActivity = targetUserActivity && targetUserActivity.activityId === targetActivityId

        if (hasExistingActivity) {
            await updateCurrentUserActivity({
                targetActivityId: targetActivityId,
                groupId,
                notes: targetNotes
            })
        } else {
            await createNewUserActivity({
                activityId: targetActivityId,
                userId,
                groupId,
                notes: targetNotes
            })
        }
        toast.success('✅ Save completed successfully')
    }, [userId, groupId, updateCurrentUserActivity, createNewUserActivity])

    // Auto-save when countdown reaches 2 - save current notes to current activity
    useEffect(() => {
        if (countdown === 2 && activityId && notes.trim()) {
            // Only save if notes have actually changed
            if (hasNotesChanged()) {
                saveOrUpdate(activityId, userActivity, notes)
            }
        }
    }, [countdown, activityId, userActivity, notes, hasNotesChanged, saveOrUpdate])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activityId) return
        await saveOrUpdate(activityId, userActivity, notes)
    }, [activityId, userActivity, notes, saveOrUpdate])

    return {
        // Data
        activity,
        userActivity,
        notes,
        groupId,
        
        // Loading states
        activitiesLoading,
        loadingUserActivity,
        errorUserActivity,
        
        // Actions
        setNotes,
        saveOrUpdate,
        handleSubmit,
        
        // Utilities
        hasNotesChanged
    }
}
