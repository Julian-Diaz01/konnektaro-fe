'use client'

import {Button} from "@shared/components/ui/button"
import Spinner from "@shared/components/ui/spinner"
import {Dialog, DialogContent} from "@shared/components/ui/dialog"
import React, {useEffect, useState, useRef, useCallback, useMemo} from "react"
import useCountdown from "@shared/hooks/useCountdown"
import {ChevronRight, Upload, Mic} from "lucide-react"
import {useUserContext} from "@shared/contexts/UserContext"
import {Activity, ActivityGroupItem, ParticipantUser} from "@shared/types/models"
import Image from 'next/image'
import usePartnerNote from "@/hooks/usePartnerNote"
import {getGroupColorClasses} from "./getGroupColorClasses"
import useCurrentActivity from "@/hooks/useCurrentActivity"
import { KonnektaroAudioRecorder } from '@konnektaro/speech-to-text'

interface CurrentActivityProps {
    userId: string
    activityId: string | null | undefined
    shouldRenderPartnerActivity: boolean
    currentUserPartner: ParticipantUser | null
    currentUserGroup: ActivityGroupItem | null | undefined
    getCountdownAction: () => number
    onSkipCountdown?: () => void
}

export default function CurrentActivity({
                                            userId,
                                            activityId,
                                            getCountdownAction,
                                            onSkipCountdown,
                                            shouldRenderPartnerActivity,
                                            currentUserPartner,
                                            currentUserGroup
                                        }: CurrentActivityProps) {
    // Countdown logic hook
    const {displayCountdown, skipCountdown} = useCountdown({
        getCountdown: getCountdownAction,
        onSkipCountdown
    })
    // Business logic hooks
    const {
        activity,
        userActivity,
        activitiesLoading,
        loadingUserActivity,
        setNotes,
        handleSubmit,
    } = useCurrentActivity({
        userId,
        activityId
    })

    const {user, firebaseUser} = useUserContext()

    const { partnerNote } = usePartnerNote({
        activityId: activityId ?? null,
        partnerId: currentUserPartner?.userId ?? null
    })

    // State to control edit mode
    const [isEditing, setIsEditing] = useState(false)

    // Local state for displayed notes (combines API data with local updates)
    const [displayedNotes, setDisplayedNotes] = useState<string | null>(null)
    
    // Ref to maintain textarea value without causing re-renders
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    
    // Flag to prevent hook interference while typing
    const [isUserTyping, setIsUserTyping] = useState(false)

    // State to track submission status
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Audio recorder state
    const [showRecorder, setShowRecorder] = useState(false)
    const [authToken, setAuthToken] = useState<string>('')

    // Memoized displayed notes to prevent unnecessary re-renders
    const notesToDisplay = useMemo(() => {
        return displayedNotes || userActivity?.notes || null
    }, [displayedNotes, userActivity?.notes])

    useEffect(() => {
        setDisplayedNotes(userActivity?.notes || null)
    }, [userActivity?.notes, activityId])

    // Handle transcription completion from audio recorder
    const handleTranscriptionComplete = useCallback((transcription: string) => {
        if (transcription && textareaRef.current) {
            // Append transcription to existing text
            const currentValue = textareaRef.current.value || ''
            const newValue = currentValue + (currentValue ? ' ' : '') + transcription
            textareaRef.current.value = newValue
            setIsUserTyping(true)
            setShowRecorder(false)
        }
    }, [])

    const handleTranscriptionError = useCallback((error: string) => {
        console.error('Transcription error:', error)
        setShowRecorder(false)
    }, [])

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

    // Initialize textarea value when activity changes (but not when user is typing)
    useEffect(() => {
        if (activityId && !isEditing && !isUserTyping && textareaRef.current) {
            const stored = localStorage.getItem(`notes:${userId}:${activityId}`)
            if (stored) {
                textareaRef.current.value = stored
            } else if (userActivity?.notes) {
                textareaRef.current.value = userActivity.notes
            } else {
                textareaRef.current.value = ''
            }
        }
    }, [activityId, userId, userActivity?.notes, isEditing, isUserTyping])


    const ActivityDescription = ({activity}: { activity: Activity }) => {
        return (
            <div className="bg-[var(--terciary)] border rounded mr-12 p-2 ">
                <li
                    key={activity.activityId}
                    className="pb-3 space-y-1 flex flex-col"
                >
                    <div className="w-full">
                        <p className="font-bold text-lg">{activity.title}</p>
                        <p className="text-gray-600">{activity.question}</p>
                    </div>
                </li>
            </div>
        )
    }

    const ActivityWithPartner = ({activity}: { activity: Activity }) => {
        if (activity.type !== 'partner') return null
        else if (activity.type === 'partner') {
            return (
                <div className="bg-[var(--terciary)] border rounded mr-12 p-2 mt-3">
                    <div className="text-m text-black bg-[var(--terciary)] max-w-fit rounded pl-2 pr-2">
                        This activity is with a {activity.type.toUpperCase()}
                    </div>
                </div>
            )
        }
    }

    const ActivityNotes = useCallback(() => {
        if (!notesToDisplay) return null
        
        return (
            <div className="bg-green-100 border text-black rounded ml-12 p-2 mt-3">
                <div className="text-green-800 font-bold text-sm">{user?.name}</div>
                <div className="break-words whitespace-pre-wrap max-w-full">
                    {notesToDisplay}
                </div>
            </div>
        )
    }, [notesToDisplay, user?.name])

    const ActivityPartnerNote = () => {
        if (!shouldRenderPartnerActivity) return null
        else if (shouldRenderPartnerActivity && currentUserPartner) {
            const colorClasses = getGroupColorClasses(currentUserGroup?.groupColor)

            return (
                <div className="flex flex-col">
                    <div
                        className={`flex flex-flow items-start  justify-center gap-4 bg-gray-200 rounded mr-12 p-2 px-2 mt-3 border-l-5 ${colorClasses.border}`}>
                        <div
                            className={`${colorClasses.bg} rounded-full p-2 flex items-center justify-center w-12 h-12 flex-shrink-0`}>
                            <Image
                                src={`/avatars/${currentUserPartner.icon}`}
                                alt={currentUserPartner.name}
                                width={32}
                                height={32}
                                className="w-8 h-8"
                            />
                        </div>
                        <div className="flex flex-col">
                            <div className="text-gray-800 text-sm">You have been matched with{" "}
                                <span className="font-bold">{currentUserPartner.name}</span>
                                {
                                    currentUserGroup?.groupNumber &&
                                    <span>{" "}in group number{" "}{currentUserGroup?.groupNumber}</span>
                                }
                            </div>
                            {currentUserPartner?.email && <div className="text-gray-800 text-sm">
                                • {currentUserPartner?.email}
                            </div>}
                            <div className="text-gray-800 text-sm">
                                • {currentUserPartner?.description}
                            </div>
                            <div className="break-words whitespace-pre-wrap max-w-full">
                            </div>
                        </div>
                    </div>
                    <div
                        className={`flex text-xsm flex-col items-start justify-center bg-gray-200 rounded mr-12 text-black p-2 mt-3 border-l-5 ${colorClasses.border}`}>
                        Find your partner and have a chat!
                      <div className="text-sm">  Tip: Both of you will be assigned the same color and number, look for someone with the same color and number as you.</div>
                    </div>
                </div>
            )
        }
    }

    const PartnerLiveNote = () => {
        if (!shouldRenderPartnerActivity || !currentUserPartner || !partnerNote) return null
        const colorClasses = getGroupColorClasses(currentUserGroup?.groupColor)
        return (
            <div className={`bg-gray-200 border text-black rounded mr-12 p-2 mt-3 border-l-5 ${colorClasses.border}`}>
                <div className="text-gray-800 font-bold text-sm">{currentUserPartner.name}</div>
                <div className="break-words whitespace-pre-wrap max-w-full">{partnerNote}</div>
            </div>
        )
    }

    const handleEditClick = useCallback(() => {
        setIsEditing(true)
        setIsUserTyping(false)
        
        // Get the text to edit - prioritize stored notes, then displayed notes, then empty
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

    const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        const currentValue = textareaRef.current?.value || ''
        if (currentValue.trim() && !isSubmitting) {
            setIsSubmitting(true)
            skipCountdown()
            setIsUserTyping(false)
            setNotes(currentValue)
            
            try {
                await handleSubmit(e)
                // Only update displayed notes if the submission was successful (no error thrown)
                setDisplayedNotes(currentValue)
                setIsEditing(false)
            } catch (error) {
                // If submission failed, don't update displayed notes
                console.error('Failed to submit notes:', error)
                // The error will be handled by the toast in the service
            } finally {
                setIsSubmitting(false)
            }
        }
    }, [skipCountdown, setNotes, handleSubmit, isSubmitting])

    const handleTextareaChange = useCallback(() => {
        setIsUserTyping(true)
        // Don't call setNotes here to prevent hook from resetting the value
        // We'll call it only when submitting
    }, [])

    const AudioRecorderDialog = useCallback(() => {
        return (
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
                                        Wait - it will close automatically and you'll get your transcription
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
        )
    }, [showRecorder, firebaseUser, authToken, handleTranscriptionComplete, handleTranscriptionError])

    const BottomTextArea = useCallback(() => {
        return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 h-[68px] flex items-center">
            {notesToDisplay && !isEditing ? (
                /* Show Edit Button when notes exist and not editing */
                <div className="flex justify-center max-w-screen-md mx-auto px-0 w-full">
                    <Button
                        onClick={handleEditClick}
                        className="bg-[var(--primary)] hover:bg-[var(--terciary)] w-full text-white px-0 py-2 rounded-lg h-[44px]"
                    >
                        Edit Answer
                    </Button>
                </div>
            ) : (
                /* Show Input Form when no notes exist or when editing */
                <form className="flex gap-3 max-w-screen-md mx-auto px-0 items-center w-full" onSubmit={handleFormSubmit}>
                    <div className="flex-1 relative">
                        <textarea
                            ref={textareaRef}
                            placeholder="Write your thoughts..."
                            onChange={handleTextareaChange}
                            required
                            className="h-[44px] resize-none border border-gray-300 rounded-2xl w-full py-2 pr-12 pl-12 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
                            style={{
                                lineHeight: '1.5',
                                paddingRight: '48px'
                            }}
                        />
                    </div>

                    {/* Submit Button - Always visible */}
                    {/* Microphone Button */}
                    <Button
                            type="button"
                            onClick={() => setShowRecorder(true)}
                            className="h-[44px] w-[44px] rounded-full p-0 flex-shrink-0 bg-[var(--primary)] hover:bg-[var(--terciary)] disabled:bg-gray-400 transition-colors"
                            >
                            <Mic className="w-4 h-4" />
                        </Button>
                    <Button
                        type="submit"
                        disabled={displayCountdown > 0 || loadingUserActivity || isSubmitting || !(textareaRef.current?.value || '').trim()}
                        className="h-[44px] w-[44px] rounded-full p-0 flex-shrink-0 bg-[var(--primary)] hover:bg-[var(--terciary)] disabled:bg-gray-400 transition-colors"
                    >
                        {displayCountdown > 0
                            ? '⏱️'
                            : isSubmitting || loadingUserActivity
                                ? <Upload className="w-5 h-5 text-white animate-spin"/>
                                : (userActivity?.notes ?
                                        <Upload className="w-5 h-5 text-white"/> :
                                        <ChevronRight className="w-5 h-5 text-white"/>
                                )
                        }
                    </Button>
                </form>
            )}
        </div>
    }, [notesToDisplay, isEditing, handleEditClick, handleFormSubmit, handleTextareaChange, displayCountdown, loadingUserActivity, userActivity?.notes, isSubmitting])

    // Early returns for loading states
    if (!userId || !activity) return null
    if (activitiesLoading) return <Spinner/>

    return (
        <div className="w-full flex flex-col">
            {/* Content Area - Scrollable with bottom padding for input */}
            <div className="flex-1 overflow-y-auto pb-3">
                <div
                    className='text-white pt-1 pb-1 pl-3 pr-3 m-2 place-self-center bg-gray-500 text-sm border rounded-2xl'>{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Activity
                </div>
                <ActivityDescription activity={activity}/>
                <ActivityWithPartner activity={activity}/>
                <ActivityPartnerNote/>
                <PartnerLiveNote/>
                <ActivityNotes/>
            </div>
            <AudioRecorderDialog/>
            <BottomTextArea/>

        </div>
    )
}
