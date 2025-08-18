import {useState, useEffect, useCallback, useRef, useMemo} from 'react'
import {toast} from 'sonner'
import useUserActivity from './useUserActivity'
import useActivity from './useActivity'
import {UserActivity} from '@/types/models'
import { updateUserActivity as updateUserActivityApi, createUserActivity as createUserActivityApi } from '@/services/userActivityService'

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
		loading: loadingUserActivity,
		error: errorUserActivity
	} = useUserActivity({userId, activityId})

	// Local state
	const [notes, setNotesState] = useState('')
	const [groupId] = useState(undefined)
	const [initialNotes, setInitialNotes] = useState('')

	// Autosave guard
	const lastAutoSavedActivityIdRef = useRef<string | null>(null)
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
		}
	}, [readStoredNotes])

	// Server sync: update baseline; only override UI if safe and different
	useEffect(() => {
		if (userActivity && userActivity.activityId === activityId && userActivity.notes !== undefined) {
			const serverNotes = userActivity.notes
			setInitialNotes(serverNotes)
			const stored = readStoredNotes()
			// If nothing stored and safe to show, set from server when different
			if (!stored && (!userHasTypedRef.current || countdown <= 1)) {
				if (serverNotes !== notes) {
					setNotesState(serverNotes)
					writeStoredNotes(serverNotes)
				}
			}
		}
	}, [userActivity, userActivity?.notes, userActivity?.activityId, activityId, countdown, notes, readStoredNotes, writeStoredNotes])

	// Save or update current activity
	const saveOrUpdate = useCallback(async (targetActivityId: string, _targetUserActivity?: UserActivity | null, targetNotes?: string) => {
		const notesToSave = (targetNotes ?? notes ?? '').trim()
		if (!userId || !targetActivityId || !notesToSave) {
			// Silent no-op if missing data
			return
		}
		try {
			await updateUserActivityApi(userId, targetActivityId, notesToSave, groupId)
			setInitialNotes(notesToSave)
			writeStoredNotes(notesToSave)
			toast.success('✅ Saved')
		} catch (err: unknown) {
			const status = (err as { response?: { status?: number }, status?: number })?.response?.status ?? (err as { status?: number })?.status
			if (status === 404) {
				await createUserActivityApi({ activityId: targetActivityId, userId, groupId, notes: notesToSave })
				setInitialNotes(notesToSave)
				writeStoredNotes(notesToSave)
				toast.success('✅ Saved')
			} else {
				toast.error('❌ Save failed')
			}
		}
	}, [userId, groupId, notes, writeStoredNotes])

	// Autosave once per activity at countdown 2 if notes changed
	useEffect(() => {
		if (!activityId) return
		if (countdown === 2 && (notes ?? '') !== (initialNotes ?? '')) {
			if (lastAutoSavedActivityIdRef.current !== activityId) {
				void saveOrUpdate(activityId, userActivity, notes)
				lastAutoSavedActivityIdRef.current = activityId
			}
		}
	}, [countdown, activityId, notes, initialNotes, saveOrUpdate, userActivity])

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
		hasNotesChanged: () => (notes ?? '') !== (initialNotes ?? '')
	}
}
