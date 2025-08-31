'use client'

import {AutoGrowTextarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import React, {useEffect, useState, useRef, useCallback, useMemo} from "react"
import useCurrentActivity from "@/hooks/useCurrentActivity"
import useCountdown from "@/hooks/useCountdown"
import {ChevronRight, Upload} from "lucide-react"
import {useUserContext} from "@/contexts/UserContext"
import {Activity, ActivityGroupItem, ParticipantUser} from "@/types/models"
import Image from 'next/image'
import {getGroupColorClasses} from "./getGroupColorClasses"

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
    const {displayCountdown, skipCountdown, countdown} = useCountdown({
        getCountdown: getCountdownAction,
        onSkipCountdown
    })
    // Business logic hooks
    const {
        activity,
        userActivity,
        notes,
        activitiesLoading,
        loadingUserActivity,
        setNotes,
        handleSubmit,
    } = useCurrentActivity({
        userId,
        activityId,
        countdown
    })

    const {user} = useUserContext()

    // State to control edit mode
    const [isEditing, setIsEditing] = useState(false)

    // Local state for displayed notes (combines API data with local updates)
    const [displayedNotes, setDisplayedNotes] = useState<string | null>(null)
    
    // Ref to maintain textarea value without causing re-renders
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    
    // Flag to prevent hook interference while typing
    const [isUserTyping, setIsUserTyping] = useState(false)

    // Memoized displayed notes to prevent unnecessary re-renders
    const notesToDisplay = useMemo(() => {
        return displayedNotes || userActivity?.notes || null
    }, [displayedNotes, userActivity?.notes])

    useEffect(() => {
        setDisplayedNotes(userActivity?.notes || null)
    }, [userActivity?.notes, activityId])

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
                        className={`flex flex-flow items-center justify-center gap-4 bg-gray-200 rounded mr-12 p-2 px-2 mt-3 border-l-5 ${colorClasses.border}`}>
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
                        className={`flex flex-flow items-center justify-center gap-4 bg-gray-200 rounded mr-12 text-black p-2 mt-3 border-l-5 ${colorClasses.border}`}>
                        Find your partner and have a chat!
                    </div>
                </div>
            )
        }
    }

    const handleEditClick = useCallback(() => {
        setIsEditing(true)
        setIsUserTyping(false)
        const notesToEdit = notesToDisplay || ''
        if (textareaRef.current) {
            textareaRef.current.value = notesToEdit
        }
        setNotes(notesToEdit)
    }, [notesToDisplay, setNotes])

    const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        const currentValue = textareaRef.current?.value || ''
        if (currentValue.trim()) {
            skipCountdown()
            setIsUserTyping(false)
            setNotes(currentValue)
            await handleSubmit(e)
            setDisplayedNotes(currentValue)
            setIsEditing(false)
        }
    }, [skipCountdown, setNotes, handleSubmit])

    const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setIsUserTyping(true)
        // Don't call setNotes here to prevent hook from resetting the value
        // We'll call it only when submitting
    }, [])

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
                            className="h-[44px] resize-none border border-gray-300 rounded-2xl w-full py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent text-black"
                            style={{
                                lineHeight: '1.5',
                                paddingRight: '48px'
                            }}
                        />
                    </div>

                    {/* Submit Button - Always visible */}
                    <Button
                        type="submit"
                        disabled={displayCountdown > 0 || loadingUserActivity || !(textareaRef.current?.value || '').trim()}
                        className="h-[44px] w-[44px] rounded-full p-0 flex-shrink-0 bg-[var(--primary)] hover:bg-[var(--terciary)] disabled:bg-gray-400 transition-colors"
                    >
                        {displayCountdown > 0
                            ? '⏱️'
                            : loadingUserActivity
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
    }, [notesToDisplay, isEditing, handleEditClick, handleFormSubmit, handleTextareaChange, displayCountdown, loadingUserActivity, userActivity?.notes])

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
                <ActivityNotes/>
            </div>
            <BottomTextArea/>

        </div>
    )
}
