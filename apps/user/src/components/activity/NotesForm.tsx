import React from "react"
import {Button} from "@shared/components/ui/button"
import {ChevronRight, Upload} from "lucide-react"
import {AudioRecorder} from "../AudioRecorder"

interface NotesFormProps {
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

export function NotesForm({
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
                          }: NotesFormProps) {
    const getButtonIcon = () => {
        if (displayCountdown > 0) return '⏱️'
        if (isSubmitting || loadingUserActivity) {
            return <Upload className="w-5 h-5 text-white animate-spin"/>
        }
        return hasExistingNotes
            ? <Upload className="w-5 h-5 text-white"/>
            : <ChevronRight className="w-5 h-5 text-white"/>
    }

    return (
        <form className="flex gap-3 max-w-screen-md mx-auto px-0 items-center w-full" onSubmit={onSubmit}>
            <div className="flex-1 relative">
                <textarea
                    ref={textareaRef}
                    placeholder="Write your thoughts..."
                    onChange={onChange}
                    required
                    className="h-[44px] resize-none border border-gray-300 rounded-2xl w-full py-2 pr-12 pl-12 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
                    style={{
                        lineHeight: '1.5',
                        paddingRight: '48px'
                    }}
                />
            </div>

            <AudioRecorder
                onTranscriptionComplete={onTranscriptionComplete}
                onTranscriptionError={onTranscriptionError}
            />

            <Button
                type="submit"
                disabled={displayCountdown > 0 || loadingUserActivity || isSubmitting || !isFormValid}
                className="h-[44px] w-[44px] rounded-full p-0 flex-shrink-0 bg-[var(--primary)] hover:bg-[var(--terciary)] disabled:bg-gray-400 transition-colors"
            >
                {getButtonIcon()}
            </Button>
        </form>
    )
}

