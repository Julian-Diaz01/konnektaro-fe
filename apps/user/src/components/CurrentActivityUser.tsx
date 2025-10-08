'use client'

import Spinner from "@shared/components/ui/spinner"
import React, {useCallback, useState} from "react"
import useCountdown from "@shared/hooks/useCountdown"
import {useUserContext} from "@shared/contexts/UserContext"
import {ActivityGroupItem, ParticipantUser} from "@shared/types/models"
import usePartnerNote from "@/hooks/usePartnerNote"
import useCurrentActivity from "@/hooks/useCurrentActivity"
import {useNotesManagement} from "@/hooks/useNotesManagement"
import {useTranscription} from "@/hooks/useTranscription"
import {ActivityTypeIndicator} from "./activity/ActivityTypeIndicator"
import {ActivityDescription} from "./activity/ActivityDescription"
import {ActivityWithPartner} from "./activity/ActivityWithPartner"
import {ActivityNotes} from "./activity/ActivityNotes"
import {PartnerInfoCard} from "./activity/PartnerInfoCard"
import {PartnerLiveNote} from "./activity/PartnerLiveNote"
import {BottomTextArea} from "./activity/BottomTextArea"

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
    // Countdown logic
    const {displayCountdown, skipCountdown} = useCountdown({
        getCountdown: getCountdownAction,
        onSkipCountdown
    })

    // Activity data
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

    const {user} = useUserContext()

    const {partnerNote} = usePartnerNote({
        activityId: activityId ?? null,
        partnerId: currentUserPartner?.userId ?? null
    })

    // Notes management
    const {
        isEditing,
        setIsEditing,
        setDisplayedNotes,
        setIsUserTyping,
        notesToDisplay,
        textareaRef,
        handleEditClick,
        handleTextareaChange
    } = useNotesManagement({
        userId,
        activityId,
        userActivityNotes: userActivity?.notes,
        setNotes
    })

    //transcription 
    const {handleTranscriptionComplete, handleTranscriptionError} = useTranscription({
        textareaRef,
        setIsUserTyping
    })

    // Form
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        const currentValue = textareaRef.current?.value || ''
        if (currentValue.trim() && !isSubmitting) {
            setIsSubmitting(true)
            skipCountdown()
            setIsUserTyping(false)
            setNotes(currentValue)

            try {
                await handleSubmit(e, currentValue)
                setDisplayedNotes(currentValue)
                setIsEditing(false)
            } catch (error) {
                console.error('Failed to submit notes:', error)
            } finally {
                setIsSubmitting(false)
            }
        }
    }, [skipCountdown, setNotes, handleSubmit, isSubmitting, textareaRef, setIsUserTyping, setDisplayedNotes, setIsEditing])

    const isFormValid = (textareaRef.current?.value || '').trim().length > 0

    if (!userId || !activity) return null
    if (activitiesLoading) return <Spinner/>

    return (
        <div className="w-full flex flex-col">
            <div className="flex-1 overflow-y-auto pb-3">
                <ActivityTypeIndicator activityType={activity.type}/>
                <ActivityDescription activity={activity}/>
                <ActivityWithPartner activity={activity}/>

                {shouldRenderPartnerActivity && currentUserPartner && (
                    <PartnerInfoCard
                        partner={currentUserPartner}
                        groupColor={currentUserGroup?.groupColor}
                        groupNumber={currentUserGroup?.groupNumber}
                    />
                )}

                {shouldRenderPartnerActivity && currentUserPartner && partnerNote && (
                    <PartnerLiveNote
                        partnerName={currentUserPartner.name}
                        partnerNote={partnerNote}
                        groupColor={currentUserGroup?.groupColor}
                    />
                )}

                <ActivityNotes notes={notesToDisplay} userName={user?.name}/>
            </div>

            <BottomTextArea
                hasNotes={!!notesToDisplay}
                isEditing={isEditing}
                onEditClick={handleEditClick}
                textareaRef={textareaRef}
                onSubmit={handleFormSubmit}
                onChange={handleTextareaChange}
                onTranscriptionComplete={handleTranscriptionComplete}
                onTranscriptionError={handleTranscriptionError}
                isSubmitting={isSubmitting}
                loadingUserActivity={loadingUserActivity}
                displayCountdown={displayCountdown}
                hasExistingNotes={!!userActivity?.notes}
                isFormValid={isFormValid}
            />
        </div>
    )
}
