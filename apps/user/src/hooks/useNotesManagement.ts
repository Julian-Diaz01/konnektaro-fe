import {useCallback, useEffect, useMemo, useRef, useState} from 'react'

interface UseNotesManagementParams {
    userId: string
    activityId: string | null | undefined
    userActivityNotes: string | undefined
    setNotes: (notes: string) => void
}

export function useNotesManagement({userId, activityId, userActivityNotes, setNotes}: UseNotesManagementParams) {
    const [isEditing, setIsEditing] = useState(false)
    const [displayedNotes, setDisplayedNotes] = useState<string | null>(null)
    const [isUserTyping, setIsUserTyping] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const notesToDisplay = useMemo(() => {
        return displayedNotes || userActivityNotes || null
    }, [displayedNotes, userActivityNotes])

    useEffect(() => {
        setDisplayedNotes(userActivityNotes || null)
    }, [userActivityNotes, activityId])

    useEffect(() => {
        if (activityId && !isEditing && !isUserTyping && textareaRef.current) {
            const stored = localStorage.getItem(`notes:${userId}:${activityId}`)
            if (stored) {
                textareaRef.current.value = stored
            } else if (userActivityNotes) {
                textareaRef.current.value = userActivityNotes
            } else {
                textareaRef.current.value = ''
            }
        }
    }, [activityId, userId, userActivityNotes, isEditing, isUserTyping])

    const handleEditClick = useCallback(() => {
        setIsEditing(true)
        setIsUserTyping(false)

        let notesToEdit = ''
        if (activityId) {
            const stored = localStorage.getItem(`notes:${userId}:${activityId}`)
            if (stored) {
                notesToEdit = stored
            } else if (notesToDisplay) {
                notesToEdit = notesToDisplay
            }
        }

        if (textareaRef.current) {
            textareaRef.current.value = notesToEdit
        }
        setNotes(notesToEdit)
    }, [notesToDisplay, setNotes, activityId, userId])

    const handleTextareaChange = useCallback(() => {
        setIsUserTyping(true)
    }, [])

    return {
        isEditing,
        setIsEditing,
        displayedNotes,
        setDisplayedNotes,
        isUserTyping,
        setIsUserTyping,
        notesToDisplay,
        textareaRef,
        handleEditClick,
        handleTextareaChange
    }
}

