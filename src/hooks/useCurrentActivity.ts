import {useState, useEffect, useCallback, useRef} from 'react'
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
    } = useUserActivity({userId, activityId})

    const [notes, setNotesState] = useState('')
    const [groupId] = useState(undefined)
    
    // Track if user has typed locally to avoid overwriting with server value
    const userHasTypedRef = useRef(false)
    // Track the previous activityId to detect actual activity changes
    const prevActivityIdRef = useRef<string | null | undefined>(null)
    // Track if we're in the initial load phase
    const isInitialLoadRef = useRef(true)

    // Expose setter that marks notes as dirty
    const setNotes = useCallback((value: string) => {
        if (!isInitialLoadRef.current) {
            userHasTypedRef.current = true
        }
        setNotesState(value)
    }, [])
    
    // Track initial notes to detect changes
    const [initialNotes, setInitialNotes] = useState('')

    // Helper function to check if notes have changed - memoized with useCallback
    const hasNotesChanged = useCallback(() => {
        // If user hasn't typed anything, no changes
        if (!userHasTypedRef.current) return false
        // Compare current notes with initial notes
        return notes !== initialNotes
    }, [notes, initialNotes])

    // Only initialize notes when we actually switch to a different activity (not during countdown)
    useEffect(() => {
        // Check if this is a real activity change (not just countdown starting)
        if (prevActivityIdRef.current !== activityId) {
            // Save current notes if they've changed before switching
            if (prevActivityIdRef.current && notes.trim() && hasNotesChanged()) {
                console.log('Saving notes before activity switch:', notes)
            }
            
            // Clear notes and reset state for new activity
            userHasTypedRef.current = false
            isInitialLoadRef.current = true
            setNotesState(userActivity?.notes || '')
            setInitialNotes(userActivity?.notes || '')
            prevActivityIdRef.current = activityId
        }
    }, [activityId, userActivity?.notes, notes, hasNotesChanged])

    // Sync from server when userActivity changes for the same activity
    useEffect(() => {
        if (userActivity?.notes !== undefined) {
            if (isInitialLoadRef.current) {
                // Initial load - set notes without marking as user input
                setNotesState(userActivity.notes)
                setInitialNotes(userActivity.notes)
                isInitialLoadRef.current = false
                console.log('Initial load - notes:', userActivity.notes)
            } else if (!userHasTypedRef.current) {
                // User hasn't typed - sync from server
                setNotesState(userActivity.notes)
                setInitialNotes(userActivity.notes)
                console.log('Syncing notes from server:', userActivity.notes)
            }
            // If user has typed, don't overwrite their input
        }
    }, [userActivity?.notes])

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
        // After a successful save, reset dirty flag and baseline
        userHasTypedRef.current = false
        setInitialNotes(targetNotes)
        toast.success('✅ Save completed successfully')
    }, [userId, groupId, updateCurrentUserActivity, createNewUserActivity])

    // Auto-save when countdown reaches 2 - save current notes to current activity
    useEffect(() => {
        if (countdown === 2 && activityId && notes.trim()) {
            console.log('Countdown 2 - checking if notes changed:', {
                notes,
                initialNotes,
                userHasTyped: userHasTypedRef.current,
                hasNotesChanged: hasNotesChanged()
            })
            // Save if user has typed something (regardless of whether it's different from initial)
            if (userHasTypedRef.current) {
                console.log('Auto-saving notes on countdown 2:', notes)
                saveOrUpdate(activityId, userActivity, notes)
            }
        }
    }, [countdown, activityId, userActivity, notes, initialNotes, hasNotesChanged, saveOrUpdate])

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
