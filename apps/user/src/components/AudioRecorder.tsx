'use client'

import React, { useCallback, useEffect, useState } from "react"
import { Button } from "@shared/components/ui/button"
import { Dialog, DialogContent } from "@shared/components/ui/dialog"
import { Mic } from "lucide-react"
import { KonnektaroAudioRecorder } from '@konnektaro/speech-to-text'
import { useUserContext } from "@shared/contexts/UserContext"
import useRecorderHealth from "@/hooks/useRecorderHealth"

interface AudioRecorderProps {
    onTranscriptionComplete: (transcription: string) => void
    onTranscriptionError: (error: string) => void
    disabled?: boolean
}

export function AudioRecorder({ 
    onTranscriptionComplete, 
    onTranscriptionError,
    disabled = false
}: AudioRecorderProps) {
    const [showRecorder, setShowRecorder] = useState(false)
    const [authToken, setAuthToken] = useState<string>('')
    const { firebaseUser } = useUserContext()
    const { isHealthy, isChecking } = useRecorderHealth()

    // Get Firebase token when dialog opens
    useEffect(() => {
        const getToken = async () => {
            if (showRecorder && firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken()
                    setAuthToken(token)
                } catch (error) {
                    console.error('Failed to get Firebase token:', error)
                    setAuthToken('')
                }
            }
        }

        getToken()
    }, [showRecorder, firebaseUser])

    const handleTranscriptionComplete = useCallback((transcription: string) => {
        onTranscriptionComplete(transcription)
        setShowRecorder(false)
    }, [onTranscriptionComplete])

    const handleTranscriptionError = useCallback((error: string) => {
        onTranscriptionError(error)
        setShowRecorder(false)
    }, [onTranscriptionError])

    return (
        <>
            <Button
                type="button"
                onClick={() => setShowRecorder(true)}
                disabled={disabled || !isHealthy || isChecking}
                className="h-[44px] w-[44px] rounded-full p-0 flex-shrink-0 bg-[var(--primary)] hover:bg-[var(--terciary)] disabled:bg-gray-400 transition-colors"
                title={!isHealthy ? "Audio recorder service is not available" : isChecking ? "Checking audio recorder service..." : "Record audio"}
            >
                <Mic className="w-4 h-4" />
            </Button>
            
            {/* Audio Recorder Dialog */}
            <Dialog open={showRecorder} onOpenChange={setShowRecorder}>
                <DialogContent className="max-w-md h-[80vh] p-0 flex flex-col">
                    {showRecorder && firebaseUser && (
                        <>
                            {/* Header with instructions */}
                            <div className="p-6 pb-4 border-b flex-shrink-0">
                                <h2 className="text-xl font-semibold text-gray-900 mb-2">Voice Recording</h2>
                                <div className="text-sm text-gray-600 space-y-2">
                                    <p className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        Press the microphone button to start recording
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                        Press it again to stop recording
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        Wait - it will close automatically and you will get your transcription
                                    </p>
                                </div>
                            </div>
                            
                            {/* Audio recorder component */}
                            <div className="flex-1 relative min-h-0 overflow-hidden">
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                        .audio-recorder-container .fixed {
                                            position: absolute !important;
                                            top: 50% !important;
                                            left: 50% !important;
                                            transform: translate(-50%, 15%) !important;
                                        }
                                    `
                                }} />
                                {authToken ? (
                                <div className=" w-full h-full">
                                    <KonnektaroAudioRecorder
                                        apiUrl={process.env.NEXT_PUBLIC_RECORDER_API_URL || undefined}
                                        token={authToken}
                                        onTranscriptionComplete={handleTranscriptionComplete}
                                        onError={handleTranscriptionError}
                                        colors={{
                                            idle: { background: "var(--primary)", border: "6px solid #fb2c36",  icon: "#fb2c36" },
                                            active: { background: "var(--primary)", border: "6px solid #2cfa1f", icon: "#2cfa1f" },
                                            disabled: { background: "#9ca3af", icon: "#ffffff" },
                                            transcribing: { background: "#828388", icon: "#ffffff" },
                                            ripple: "#2cfa1f"
                                          }}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                                        <p>Loading audio recorder...</p>
                                    </div>
                                </div>
                            )}
                            </div>
                            
                            {/* Footer with additional info */}
                            <div className="p-4 pt-2 border-t bg-gray-50 flex-shrink-0">
                                <p className="text-xs text-gray-500 text-center">
                                    Make sure you have microphone permissions enabled
                                </p>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    )
}
