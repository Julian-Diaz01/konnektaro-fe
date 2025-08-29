'use client'

import {AutoGrowTextarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import React, { useEffect, useState } from "react"
import useCurrentActivity from "@/hooks/useCurrentActivity"
import useCountdown from "@/hooks/useCountdown"
import { ChevronRight, Upload } from "lucide-react"
import { useUserContext } from "@/contexts/UserContext"

interface CurrentActivityProps {
    userId: string
    activityId: string | null | undefined
    getCountdownAction: () => number
    onSkipCountdown?: () => void
}

export default function CurrentActivity({
                                            userId,
                                            activityId,
                                            getCountdownAction,
                                            onSkipCountdown
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

    useEffect(() => {
        setDisplayedNotes(userActivity?.notes || null)
    }, [userActivity?.notes, activityId])

    // Early returns for loading states
    if (!userId || !activity) return null
    if (activitiesLoading) return <Spinner/>

    return (
        <div className="w-full flex flex-col min-h-screen">
            {/* Content Area - Scrollable with bottom padding for input */}
            <div className="flex-1 overflow-y-auto pb-24">
                <div
                    className='text-white pt-1 pb-1 pl-3 pr-3 m-2 place-self-center bg-gray-500 text-sm border rounded-2xl'>{activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} Activity
                </div>
                <div className="bg-[var(--terciary)] border rounded mr-12 p-2">
                    <li
                        key={activity.activityId}
                        className="pb-3 space-y-1 flex flex-col justify-between items-start sm:flex-row sm:items-center"
                    >
                        <div className="w-full">
                            <p className="font-bold text-lg">Perfect! I&#39;ve successfully updated the ShowActivities
                                component
                                to sort the activities by date with earlier dates first. Here&#39;s what I
                                changed{activity.title}</p>
                            <p className="text-gray-600">Added date sorting: The activities are now sorted using the date
                                field from the Activity interface
                                Earlier dates first: Used dateA.getTime() - dateB.getTime() to sort in ascending order
                                (earliest to latest)
                                Improved memoization: Added all the dependencies to the useMemo dependency array to ensure
                                proper re-rendering when needed{activity.question}</p>
                        </div>
                    </li>
                </div>
                {activity.type === 'partner' &&
                    <div className="bg-[var(--terciary)] border rounded mr-12 p-2 mt-3">
                        <div className="text-m text-black bg-[var(--terciary)] max-w-fit rounded pl-2 pr-2">
                            This activity is with a {activity.type.toUpperCase()}
                        </div>
                    </div>
                }

            {/* Notes section - Show when there are saved notes or local updates */}
            {(displayedNotes || userActivity?.notes) && (
                <div className="bg-green-100 border text-black rounded ml-12 p-2 mt-3">
                    <div className="text-green-800 font-bold text-sm">{user?.name}</div>
                    <div className="break-words whitespace-pre-wrap max-w-full">
                        {displayedNotes || userActivity?.notes}
                    </div>
                </div>
            )} 

            </div>

           
            {/* WhatsApp-style Input Area - Fixed at Bottom */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 z-50 ">
                {(displayedNotes || userActivity?.notes) && !isEditing ? (
                    /* Show Edit Button when notes exist and not editing */
                    <div className="flex justify-center max-w-screen-md mx-auto px-6">
                        <Button
                            onClick={() => {
                                setIsEditing(true)
                                setNotes(displayedNotes || userActivity?.notes || '')
                            }}
                            className="bg-[var(--primary)] hover:bg-[var(--terciary)] w-full text-white px-6 py-2 rounded-lg"
                        >
                            Edit Answer
                        </Button>
                    </div>
                ) : (
                    /* Show Input Form when no notes exist or when editing */
                    <form className="flex gap-3 items-end max-w-screen-md mx-auto px-6" onSubmit={async (e) => {
                        e.preventDefault()
                        if (notes.trim()) {
                            skipCountdown()
                            await handleSubmit(e)
                            // Update local state with the submitted notes
                            setDisplayedNotes(notes)
                            setIsEditing(false)
                        }
                    }}>
                        <div className="flex-1 relative">
                            <AutoGrowTextarea
                                placeholder="Write your thoughts..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                required
                                className="min-h-[44px] max-h-[120px] resize-none border border-gray-300 rounded-2xl px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                                style={{
                                    lineHeight: '1.5',
                                    paddingRight: '48px'
                                }}
                            />
                        </div>
                        
                        {/* Submit Button - Always visible */}
                        <Button
                            type="submit"
                            disabled={displayCountdown > 0 || loadingUserActivity || !notes.trim()}
                            className="h-[44px] w-[44px] rounded-full p-0 flex-shrink-0 bg-[var(--primary)] hover:bg-[var(--terciary)] disabled:bg-gray-400 transition-colors"
                        >
                            {displayCountdown > 0
                                ? '⏱️'
                                : loadingUserActivity
                                    ? <Upload className="w-5 h-5 text-white animate-spin" />
                                    : (userActivity?.notes ? 
                                        <Upload className="w-5 h-5 text-white"/> : 
                                        <ChevronRight className="w-5 h-5 text-white" />
                                      )
                            }
                        </Button>
                    </form>
                )}
            </div>
        </div>
    )
}
