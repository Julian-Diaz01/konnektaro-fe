'use client'

import {AutoGrowTextarea} from "@/components/ui/textarea"
import {Button} from "@/components/ui/button"
import Spinner from "@/components/ui/spinner"
import React, {useState, useEffect, useRef} from "react"
import useUserActivity from "@/hooks/useUserActivity"
import useActivity from "@/hooks/useActivity"

interface CurrentActivityProps {
    userId: string
    activityId: string | null | undefined
}

export default function CurrentActivity({userId, activityId}: CurrentActivityProps) {
    const {
        activity,
        loading: activitiesLoading,
    } = useActivity({activityId: activityId || null})
    const {
        userActivity,
        createNewUserActivity,
        updateCurrentUserActivity,
        loading: loadingUserActivity,
        error: errorUserActivity
    } = useUserActivity({userId, activityId: activityId})

    const [notes, setNotes] = useState(userActivity?.notes || '')
    //to do reassign groups
    const [groupId] = useState(undefined)
    const prevActivityId = useRef(activityId)

    // Keep notes synced with fetched userActivity
    useEffect(() => {
        if (userActivity?.notes) {
            setNotes(userActivity.notes)
        }
    }, [userActivity])

    // Auto-save when activityId changes
    //// TODO FIX THIS AUTO SAVE
    useEffect(() => {
        if (prevActivityId.current && prevActivityId.current !== activityId) {
            saveOrUpdate(prevActivityId.current) // save for the *previous* activity
        }
        prevActivityId.current = activityId
    }, [activityId])

    async function saveOrUpdate(targetActivityId: string) {
        if (!userId || !targetActivityId || !notes.trim()) return

        if (userActivity?.notes && targetActivityId === activityId) {
            await updateCurrentUserActivity({
                targetActivityId: targetActivityId,
                groupId,
                notes
            })
        } else {
            await createNewUserActivity({
                activityId: targetActivityId,
                userId,
                groupId,
                notes
            })
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if(!activityId) return
        await saveOrUpdate(activityId)
    }
    if (!userId || !activity) return null
    if (activitiesLoading) return <Spinner/>
    return (
        <div className="w-full p-4 bg-white border rounded">
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

            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                <AutoGrowTextarea
                    label="Answer"
                    placeholder="Write your thoughts..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    required
                />

                {errorUserActivity && (
                    <p className="mt-2 text-sm text-red-600">{errorUserActivity}</p>
                )}

                <Button type="submit">
                    {loadingUserActivity
                        ? (userActivity?.notes ? 'Updating...' : 'Saving...')
                        : (userActivity?.notes ? 'Update' : 'Save')}
                </Button>
            </form>
        </div>
    )
}
