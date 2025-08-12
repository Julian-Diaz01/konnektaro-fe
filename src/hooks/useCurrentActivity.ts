import {useState, useEffect} from 'react'
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

    // Keep notes synced with fetched userActivity
    useEffect(() => {
        if (userActivity?.notes) {
            setNotes(userActivity.notes)
        }
    }, [userActivity])

    // Auto-save when countdown reaches 2 - save current notes to current activity
    useEffect(() => {
        if (countdown === 2 && activityId && notes.trim()) {
            // Save current notes to current activity before switching
            saveOrUpdate(activityId, userActivity, notes)
        }
    }, [countdown])

    async function saveOrUpdate(targetActivityId: string, targetUserActivity?: UserActivity | null, targetNotes?: string) {
        if (!userId || !targetActivityId || !targetNotes?.trim()) {
            console.log('❌ Save cancelled:', {userId, targetActivityId, targetNotes, hasNotes: !!targetNotes?.trim()})
            return
        }

        // Check if there's existing user activity for the target activity
        const hasExistingActivity = targetUserActivity && targetUserActivity.activityId === targetActivityId

        if (hasExistingActivity) {
            console.log('✅ Updating existing user activity')
            await updateCurrentUserActivity({
                targetActivityId: targetActivityId,
                groupId,
                notes: targetNotes
            })
        } else {
            console.log('🆕 Creating new user activity')
            await createNewUserActivity({
                activityId: targetActivityId,
                userId,
                groupId,
                notes: targetNotes
            })
        }
        console.log('✅ Save completed successfully')
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!activityId) return
        await saveOrUpdate(activityId, userActivity, notes)
    }

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
        handleSubmit
    }
}
