'use client';

import {Suspense, useMemo, useCallback} from "react";
import {BackLink} from "@shared/components/BackLink";
import {ConfirmDeleteButton} from "@shared/components/ConfirmDeleteButton";
import {Button} from "@shared/components/ui/button";
import useEventPage from "@shared/hooks/useEventPage";

import Spinner from "@shared/components/ui/spinner";
import UsersList from "@shared/components/UsersList";
import useEventSocket from "@shared/hooks/useEventSocket";
import {ShowEventDetails} from "@shared/components/EventDetails";
import { EventProvider } from "@shared/contexts/EventContext";
import { useSearchParams } from "next/navigation";
import { ActivityType } from "@shared/types/models";
import AddActivityDialog from "@shared/components/AddActivityDialog";
import ManageActivityUsersDialog from "@shared/components/ManageActivityUsersDialog";

function EventPageContent() {
    const {
        event,
        activities,
        loading,
        handleAddActivity,
        handleCurrentActivityUpdate,
        handleDeleteEvent,
        deleteActivity,
        currentActivity: eventPageCurrentActivity,
        handleCloseEvent
    } = useEventPage();

    const {activeActivityId} = useEventSocket(event?.eventId || '')

    // Priority: Live socket data > Static event data
    // This ensures we use the most up-to-date information
    const currentActivityId = activeActivityId || event?.currentActivityId || null

    // Find the current activity object (prioritize live socket data)
    const currentActivity = activities.find(a => a.activityId === currentActivityId) || eventPageCurrentActivity

    // Memoize the isActivityActive function to avoid redundant calculations
    const isActivityActive = useMemo(() => (activityId: string) => {
        return currentActivityId === activityId
    }, [currentActivityId])

    const memoizedHandleCurrentActivityUpdate = useCallback((activityId: string) => {
        handleCurrentActivityUpdate(activityId)
    }, [handleCurrentActivityUpdate])

    const memoizedDeleteActivity = useCallback((activityId: string) => {
        deleteActivity(activityId)
    }, [deleteActivity])

    const memoizedHandleAddActivity = useCallback((activityData: { title: string; question: string; type: ActivityType }) => {
        handleAddActivity(activityData)
    }, [handleAddActivity])

    if (loading) {
        return <Spinner/>;
    }

    const Header = () => (
        <div className="mb-4 flex">
            <BackLink href="/admin"/>

            <div className="flex gap-2">
                <Button
                onClick={handleCloseEvent}
                >
                    Close Event
                </Button>
                <ConfirmDeleteButton
                    name="event"
                    onConfirm={handleDeleteEvent}
                    buttonText="Delete Event"
                    buttonVariant="destructiveOutline"
                    mode="icon"
                />
            </div>

        </div>
    )

    const CurrentActivityIndicator = () => {
        const currentActivityName = currentActivity?.title || 'No active activity'
        const isUsingLiveData = activeActivityId !== null

        return useMemo(() => (
            <div className={`p-4 bg-white border rounded mb-3 ${
                !event?.open ? 'border-r-4 border-r-red-700' :
                    isUsingLiveData
                        ? 'border-r-4 border-r-green-500'
                        : 'border-r-4 border-r-yellow-500'
            }`}>
                <div className="flex items-center justify-between">
                    <p>
                        <span className="font-bold">Current Activity: </span>
                        <span className="text-lg">{currentActivityName}</span>
                    </p>
                    <div className="text-sm text-gray-600">
                        {!event?.open ? 'Event Closed' : isUsingLiveData ? 'Live' : ''}
                    </div>
                </div>
            </div>
        ), [currentActivityName, isUsingLiveData])
    }

    const ShowActivities = () => {
        // Memoize the activities list to avoid unnecessary re-renders
        const activitiesList = useMemo(() => {
            if (activities.length === 0) {
                return <p className="mt-2 text-sm text-gray-500">No activities yet</p>
            }

            // Sort activities by date (earlier first)
            const sortedActivities = [...activities].sort((a, b) => {
                const dateA = new Date(a.date)
                const dateB = new Date(b.date)
                return dateA.getTime() - dateB.getTime()
            })

            return (
                <ul className="mt-2 space-y-2">
                    {sortedActivities.map((activity) => {
                        const isActive = isActivityActive(activity.activityId)
                        
                        return (
                            <li
                                key={activity.activityId}
                                className={`pb-6 space-y-1 flex flex-col items-start border-b relative ${
                                    isActive ? 'mt-6 m-[-15px] p-3' : 'mt-6'
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 border-2 border-primary rounded-lg pointer-events-none"></div>
                                )}
                                <div className="w-full">
                                    <div className="flex items-start gap-2 justify-between w-full">
                                    <p className="font-bold text-lg">{activity.title}</p>
                                    <ConfirmDeleteButton
                                        name="Activity"
                                        onConfirm={() => memoizedDeleteActivity(activity.activityId)}
                                        buttonText="Delete Activity"
                                        mode="icon"
                                    />
                                    </div>
                                    <p className="text-gray-600">{activity.question}</p>
                                    <div className={`inline-flex items-center mt-3 px-3 py-1 rounded-full text-sm font-medium ${
                                        activity.type === 'partner' 
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                            : 'bg-green-100 text-green-800 border border-green-200'
                                    }`}>
                                        {activity.type === 'partner' ? '👥 Partner' : '👤 Self'}
                                    </div>
                                </div>
                                <div className="w-full mt-4 pt-4 border-t">
                                    <div className="flex gap-2 w-full">
                                        {activity.type === 'partner' && isActive && (
                                            <ManageActivityUsersDialog
                                                event={event}
                                                activityId={activity.activityId}
                                                activityTitle={activity.title}
                                                trigger={
                                                    <Button 
                                                        variant="outlinePrimary"
                                                        className="flex-1  hover:bg-gray-50"
                                                    >
                                                        Manage Users
                                                    </Button>
                                                }
                                            />
                                        )}
                                        {!isActive ? (
                                            <Button
                                                variant="outlinePrimary"
                                                onClick={() => memoizedHandleCurrentActivityUpdate(activity.activityId)}
                                                disabled={isActive}
                                                className="flex-1 hover:bg-gray-50"
                                            >
                                                Initiate Activity
                                            </Button>
                                        ) : (
                                            <Button
                                                variant="outlinePrimary"
                                                className="flex-1 hover:bg-gray-50"
                                                disabled
                                            >
                                                Active
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )
        }, [])

        return (
            <div className="p-4 bg-white border rounded">
                <h2 className="pb-3 border-b font-semibold text-xl">Activities</h2>
                {activitiesList}
            </div>
        )
    }

    return (
        <div className="page-background">
            <Header/>
            <CurrentActivityIndicator/>
            <ShowEventDetails event={event}/>
            <UsersList event={event} mode="all-users"/>
            <ShowActivities/>
            <div className="mt-4">
                <AddActivityDialog onAddActivity={memoizedHandleAddActivity} />
            </div>
        </div>
    );
}

export default function EventPage() {
    const searchParams = useSearchParams()
    const eventId = searchParams.get("id")

    return (
        <Suspense fallback={null}>
            <EventProvider eventId={eventId || ""}>
                <EventPageContent />
            </EventProvider>
        </Suspense>
    );
}