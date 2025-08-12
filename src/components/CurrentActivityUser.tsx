'use client'

import {AutoGrowTextarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import React from "react"
import useCurrentActivity from "@/hooks/useCurrentActivity"
import useCountdown from "@/hooks/useCountdown"

interface CurrentActivityProps {
    userId: string
    activityId: string | null | undefined
    getCountdown: () => number
    onSkipCountdown?: () => void
}

export default function CurrentActivity({
    userId,
    activityId,
    getCountdown,
    onSkipCountdown
}: CurrentActivityProps) {
    // Countdown logic hook
    const {displayCountdown, skipCountdown, countdown} = useCountdown({
        getCountdown,
        onSkipCountdown
    })

    // Business logic hooks
    const {
        activity,
        userActivity,
        notes,
        activitiesLoading,
        loadingUserActivity,
        errorUserActivity,
        setNotes,
        handleSubmit
    } = useCurrentActivity({
        userId,
        activityId,
        countdown,
        onSkipCountdown
    })

    // Early returns for loading states
    if (!userId || !activity) return null
    if (activitiesLoading) return <Spinner/>

    return (
        <div className="w-full p-4 bg-white border rounded">
            {/* Activity Header */}
            <li
                key={activity.activityId}
                className="pb-3 space-y-1 flex flex-col justify-between items-start sm:flex-row sm:items-center"
            >
                <div className="w-full">
                    <p className="font-bold text-lg">{activity.title}</p>
                    <p className="text-gray-600">{activity.question}</p>
                    <div className="text-m text-primary bg-[var(--terciary)] max-w-fit rounded pl-2 pr-2 float-end">
                        {activity.type.toUpperCase()}
                    </div>
                </div>
            </li>

            {/* Countdown Notification */}
            {displayCountdown > 0 && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                        <strong>🔄 New activity detected!</strong> Switching to new activity
                        in {displayCountdown} seconds...
                        <br/>
                        <span className="text-xs">Click the button below to switch immediately</span>
                    </p>
                </div>
            )}

            {/* Activity Form */}
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <AutoGrowTextarea
                    label="Answer"
                    placeholder="Write your thoughts..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                />

                {/* Error Display */}
                {errorUserActivity && (
                    <p className="mt-2 text-sm text-red-600">{errorUserActivity}</p>
                )}

                {/* Submit Button */}
                <Button
                    type="submit"
                    onClick={skipCountdown}
                    disabled={displayCountdown > 0}
                >
                    {displayCountdown > 0
                        ? `Switching in ${displayCountdown}s...`
                        : loadingUserActivity
                            ? (userActivity?.notes ? 'Updating...' : 'Saving...')
                            : (userActivity?.notes ? 'Update' : 'Save')
                    }
                </Button>
            </form>
        </div>
    )
}
