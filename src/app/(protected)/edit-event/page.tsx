'use client';

import {Suspense} from "react";
import {BackLink} from "@/components/BackLink";
import {ConfirmDeleteButton} from "@/components/ConfirmDeleteButton";
import AddActivityForm from "@/components/AddActivity";
import {Button} from "@/components/ui/button";
import useEventPage from "@/hooks/useEventPage";
import Spinner from "@/components/ui/spinner";
import UsersList from "@/components/UsersList";
import useEventSocket from "@/hooks/useEventSocket";
import {ShowEventDetails} from "@/components/EventDetails";

export default function EventPage() {

    const {
        event,
        activities,
        loading,
        showForm,
        setShowForm,
        handleAddActivity,
        handleCurrentActivityUpdate,
        handleDeleteEvent,
        deleteActivity,
    } = useEventPage();

    const {activeActivityId} = useEventSocket(event?.eventId || '')

    // Priority: Live socket data > Static event data
    // This ensures we use the most up-to-date information
    const currentActivityId = activeActivityId || event?.currentActivityId || null

    // Find the current activity object
    const currentActivity = activities.find(a => a.activityId === currentActivityId)

    // Determine if an activity is currently active (either from socket or event)
    const isActivityActive = (activityId: string) => {
        return currentActivityId === activityId
    }

    if (loading) {
        return <Spinner/>;
    }

    const Header = () => (
        <div className="mb-4 flex justify-between items-center">
            <BackLink href="/admin"/>
            <ConfirmDeleteButton
                name="event"
                onConfirm={handleDeleteEvent}
                buttonText="Delete Event"
                buttonVariant="destructiveOutline"
            />
        </div>
    )

    const CurrentActivityIndicator = () => {
        const currentActivityName = currentActivity?.title || 'No active activity'
        const isUsingLiveData = activeActivityId !== null

        return (
            <div className={`p-4 bg-white border rounded ${
                !event?.open ? 'border-r-4 border-r-red-700' :
                    isUsingLiveData
                        ? 'border-r-4 border-r-green-500'
                        : 'border-r-4 border-r-yellow-500'
            }`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="font-bold">Current Activity:</h1>
                        <p className="text-lg">{currentActivityName}</p>
                    </div>
                    <div className="text-sm text-gray-600">
                        {!event?.open ? 'Event Closed' : isUsingLiveData ? 'Live' : ''}
                    </div>
                </div>
            </div>
        )
    }

    const ShowActivities = () => (
        <div className="p-4 bg-white border rounded">
            <h2 className="pb-3 border-b font-semibold text-xl">Activities</h2>

            {activities.length > 0 ? (
                <ul className="mt-2 space-y-2">
                    {activities.map((activity) => (
                        <li
                            key={activity.activityId}
                            className="pb-3 space-y-1 flex flex-col justify-between items-start border-b sm:flex-row sm:items-center"
                        >
                            <div>
                                <p className="font-bold text-lg">{activity.title}</p>
                                <p className="text-gray-600">{activity.question}</p>
                                <div className="text-m text-white bg-primary max-w-fit rounded pl-2 pr-2 ">
                                    Type: {activity.type.toUpperCase()}
                                </div>
                            </div>
                            <div className="ml-[auto] flex flex-col gap-2">
                                <Button
                                    variant="outlinePrimary"
                                    onClick={() => handleCurrentActivityUpdate(activity.activityId)}
                                    // Button is disabled if this activity is currently active
                                    // Uses live socket data if available, falls back to static event data
                                    disabled={isActivityActive(activity.activityId)}
                                >
                                    {isActivityActive(activity.activityId) ? 'Currently Active' : 'Initiate Activity'}
                                </Button>
                                <ConfirmDeleteButton
                                    name="Activity"
                                    onConfirm={() => deleteActivity(activity.activityId)}
                                    buttonText="Delete Activity"
                                    buttonVariant="destructiveOutline"
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="mt-2 text-sm text-gray-500">No activities yet</p>
            )}
        </div>
    )

    const AddNewActivity = () => (
        <div>
            {showForm ? (
                <AddActivityForm activityData={handleAddActivity}/>
            ) : (
                <Button className="w-full" onClick={() => setShowForm(true)}>
                    Add Activity
                </Button>
            )}
        </div>
    )

    return (
        <Suspense fallback={null}>
            <div className="page-background">
                <Header/>
                <CurrentActivityIndicator/>
                <ShowEventDetails event={event}/>
                <UsersList eventId={event?.eventId}/>
                <ShowActivities/>
                <AddNewActivity/>
            </div>
        </Suspense>
    );
}