import {useCallback} from 'react'

interface UseTranscriptionParams {
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
    setIsUserTyping: (value: boolean) => void
}

export function useTranscription({textareaRef, setIsUserTyping}: UseTranscriptionParams) {
    const handleTranscriptionComplete = useCallback((transcription: string) => {
        if (transcription && textareaRef.current) {
            const currentValue = textareaRef.current.value || ''
            textareaRef.current.value = currentValue + (currentValue ? ' ' : '') + transcription
            setIsUserTyping(true)
        }
    }, [textareaRef, setIsUserTyping])

    const handleTranscriptionError = useCallback((error: string) => {
        console.error('Transcription error:', error)
    }, [])

    return {
        handleTranscriptionComplete,
        handleTranscriptionError
    }
}

