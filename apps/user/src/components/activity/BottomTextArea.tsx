import React from "react"
import {EditButton} from "./EditButton"
import {NotesForm} from "./NotesForm"

interface BottomTextAreaProps {
    hasNotes: boolean
    isEditing: boolean
    onEditClick: () => void
    textareaRef: React.RefObject<HTMLTextAreaElement | null>
    onSubmit: (e: React.FormEvent) => void
    onChange: () => void
    onTranscriptionComplete: (transcription: string) => void
    onTranscriptionError: (error: string) => void
    isSubmitting: boolean
    loadingUserActivity: boolean
    displayCountdown: number
    hasExistingNotes: boolean
    isFormValid: boolean
}

export function BottomTextArea({
                                   hasNotes,
                                   isEditing,
                                   onEditClick,
                                   textareaRef,
                                   onSubmit,
                                   onChange,
                                   onTranscriptionComplete,
                                   onTranscriptionError,
                                   isSubmitting,
                                   loadingUserActivity,
                                   displayCountdown,
                                   hasExistingNotes,
                                   isFormValid
                               }: BottomTextAreaProps) {
    return (
        <div
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 h-[68px] flex items-center">
            {hasNotes && !isEditing ? (
                <EditButton onClick={onEditClick}/>
            ) : (
                <NotesForm
                    textareaRef={textareaRef}
                    onSubmit={onSubmit}
                    onChange={onChange}
                    onTranscriptionComplete={onTranscriptionComplete}
                    onTranscriptionError={onTranscriptionError}
                    isSubmitting={isSubmitting}
                    loadingUserActivity={loadingUserActivity}
                    displayCountdown={displayCountdown}
                    hasExistingNotes={hasExistingNotes}
                    isFormValid={isFormValid}
                />
            )}
        </div>
    )
}

