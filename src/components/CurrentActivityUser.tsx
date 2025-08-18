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

            {/* Activity Form */}
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <AutoGrowTextarea
                    label="Answer"
                    placeholder="Write your thoughts..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                />

                {/* Submit Button */}
                <Button
                    type="submit"
                    onClick={skipCountdown}
                    disabled={displayCountdown > 0}
                >
                    {displayCountdown > 0
                        ? 'Switch Now'
                        : loadingUserActivity
                            ? (userActivity?.notes ? 'Updating...' : 'Saving...')
                            : (userActivity?.notes ? 'Update' : 'Save')
                    }
                </Button>
            </form>
        </div>
    )
}
