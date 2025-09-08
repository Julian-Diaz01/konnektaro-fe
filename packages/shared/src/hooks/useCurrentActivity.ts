import {useState, useEffect, useCallback, useRef, useMemo} from 'react'
import {toast} from 'sonner'
import useUserActivity from './useUserActivity'
import useActivity from './useActivity'
import {UserActivity} from '../types/models'
import { updateUserActivity as updateUserActivityApi, createUserActivity as createUserActivityApi } from '../services/userActivityService'

interface UseCurrentActivityProps {
	userId: string
	activityId: string | null | undefined
}

export default function useCurrentActivity({
	userId,
	activityId,
}: UseCurrentActivityProps) {
	const {
		activity,
		loading: activitiesLoading,
	} = useActivity({activityId: activityId || null})

	const {
		userActivity,
		loading: loadingUserActivity,
		error: errorUserActivity
	} = useUserActivity({userId, activityId})

	// Local state
	const [notes, setNotesState] = useState('')
	const [groupId] = useState(undefined)
	const [initialNotes, setInitialNotes] = useState('')

	// Prevent server override while user is typing
	const userHasTypedRef = useRef(false)

	// Persistent key per user/activity
	const storageKey = useMemo(() => {
		return userId && activityId ? `notes:${userId}:${activityId}` : null
	}, [userId, activityId])

	const readStoredNotes = useCallback(() => {
		if (!storageKey) return null
		try { return localStorage.getItem(storageKey) } catch { return null }
	}, [storageKey])

	const writeStoredNotes = useCallback((value: string) => {
		if (!storageKey) return
		try { localStorage.setItem(storageKey, value) } catch {}
	}, [storageKey])

	// Setter: updates state and storage
	const setNotes = useCallback((value: string) => {
		userHasTypedRef.current = true
		setNotesState(value)
		writeStoredNotes(value)
	}, [writeStoredNotes])

	// On activity change, prefer stored notes immediately
	useEffect(() => {
		userHasTypedRef.current = false
		const stored = readStoredNotes()
		if (stored !== null) {
			setNotesState(stored)
		} else {
			// Clear notes when switching to a new activity with no stored notes
			setNotesState('')
		}
	}, [activityId, readStoredNotes])

	// Server sync: update baseline; only override UI if safe and different
	useEffect(() => {
		if (userActivity && userActivity.activityId === activityId && userActivity.notes !== undefined) {
			const serverNotes = userActivity.notes
			setInitialNotes(serverNotes)
			const stored = readStoredNotes()
			// Only set from server if we have no stored notes and user hasn't typed recently
			if (!stored && !userHasTypedRef.current) {
				if (serverNotes !== notes) {
					setNotesState(serverNotes)
					writeStoredNotes(serverNotes)
				}
			}
		} else if (!userActivity || userActivity.activityId !== activityId) {
			// Reset initial notes when switching to a new activity
			setInitialNotes('')
		}
	}, [userActivity, userActivity?.notes, userActivity?.activityId, activityId, notes, readStoredNotes, writeStoredNotes])

	// Save or update current activity
	const saveOrUpdate = useCallback(async (targetActivityId: string, _targetUserActivity?: UserActivity | null, targetNotes?: string) => {
		const notesToSave = (targetNotes ?? notes ?? '').trim()
		if (!userId || !targetActivityId || !notesToSave) {
			// Silent no-op if missing data
			return
		}
		try {
			const response = await updateUserActivityApi(userId, targetActivityId, notesToSave, groupId)
			// Check if the response status is successful (2xx range)
			if (response.status >= 200 && response.status < 300) {
				setInitialNotes(notesToSave)
				writeStoredNotes(notesToSave)
				toast.success('✅ Saved')
			} else {
                console.log(`HTTP ${response.status}: ${response.statusText}`)
			}
		} catch (err: unknown) {
			const status = (err as { response?: { status?: number }, status?: number })?.response?.status ?? (err as { status?: number })?.status
			if (status === 404) {
				try {
					const response = await createUserActivityApi({ activityId: targetActivityId, userId, groupId, notes: notesToSave })
					if (response.status >= 200 && response.status < 300) {
						setInitialNotes(notesToSave)
						writeStoredNotes(notesToSave)
						toast.success('✅ Saved')
					} else {
						console.log(`HTTP ${response.status}: ${response.statusText}`)
					}
				} catch (createErr) {
					toast.error('❌ Save failed')
					throw createErr
				}
			} else {
				toast.error('❌ Save failed')
				throw err
			}
		}
	}, [userId, groupId, notes, writeStoredNotes])

	const handleSubmit = useCallback(async (e: React.FormEvent) => {
		e.preventDefault()
		if (!activityId) return
		await saveOrUpdate(activityId, userActivity, notes)
	}, [activityId, userActivity, notes, saveOrUpdate])

	return {
		activity,
		userActivity,
		notes,
		groupId,
		activitiesLoading,
		loadingUserActivity,
		errorUserActivity,
		setNotes,
		saveOrUpdate,
		handleSubmit,
		hasNotesChanged: () => (notes ?? '') !== (initialNotes ?? ''),
		initialNotes
	}
}
