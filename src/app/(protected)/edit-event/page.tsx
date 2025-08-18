'use client';

import {Suspense, useMemo} from "react";
import {BackLink} from "@/components/BackLink";
import {ConfirmDeleteButton} from "@/components/ConfirmDeleteButton";
import AddActivityForm from "@/components/AddActivity";
import {Button} from "@/components/ui/button";
import useEventPage from "@/hooks/useEventPage";
import useGroupedUsersDisplay from "@/hooks/useGroupedUsersDisplay";
import Spinner from "@/components/ui/spinner";
import UsersList from "@/components/UsersList";
import useEventSocket from "@/hooks/useEventSocket";
import {ShowEventDetails} from "@/components/EventDetails";
import { EventProvider } from "@/contexts/EventContext";
import { useSearchParams } from "next/navigation";

function EventPageContent() {
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
        handlePairUsers,
        groupActivity,
        currentActivity: eventPageCurrentActivity
    } = useEventPage();

    const {activeActivityId} = useEventSocket(event?.eventId || '')

    // Priority: Live socket data > Static event data
    // This ensures we use the most up-to-date information
    const currentActivityId = activeActivityId || event?.currentActivityId || null

    // Find the current activity object (prioritize live socket data)
    const currentActivity = activities.find(a => a.activityId === currentActivityId) || eventPageCurrentActivity

    const {handleShowGroupedUsers} = useGroupedUsersDisplay(groupActivity)

    // Memoize the isActivityActive function to avoid redundant calculations
    const isActivityActive = useMemo(() => (activityId: string) => {
        return currentActivityId === activityId
    }, [currentActivityId])

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

        return useMemo(() => (
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
        ), [currentActivityName, isUsingLiveData])
    }

    const ShowActivities = () => {
        // Memoize the activities list to avoid unnecessary re-renders
        const activitiesList = useMemo(() => (
            activities.length > 0 ? (
                <ul className="mt-2 space-y-2">
                    {activities.map((activity) => {
                        const isActive = isActivityActive(activity.activityId)
                        const hasGroupActivity = groupActivity && groupActivity.activityId === activity.activityId
                        
                        return (
                            <li
                                key={activity.activityId}
                                className={`pb-6 space-y-1 flex flex-col justify-between items-start border-b sm:flex-row sm:items-center ${
                                    isActive ? 'm-[-15px] p-3 bg-[var(--terciary)]' : 'mt-6'
                                }`}
                            >
                                <div>
                                    <p className="font-bold text-lg">{activity.title}</p>
                                    <p className="text-gray-600">{activity.question}</p>
                                    <div className="text-m text-white bg-primary max-w-fit rounded pl-2 pr-2 ">
                                        Type: {activity.type.toUpperCase()}
                                    </div>
                                </div>
                                <div className="ml-[auto] flex flex-col gap-2">
                                    {activity.type === 'partner' && isActive && (
                                        <Button
                                            onClick={() => handlePairUsers(activity.activityId)}
                                        >
                                            Pair Users
                                        </Button>
                                    )}
                                    {activity.type === 'partner' && hasGroupActivity && isActive && (
                                        <UsersList
                                            eventId={event?.eventId}
                                            groupActivity={groupActivity}
                                            mode="grouped-users"
                                            activityId={activity.activityId}
                                            inline={true}
                                            onShowUsers={handleShowGroupedUsers}
                                        />
                                    )}
                                    {!isActive ? (
                                        <Button
                                            variant="outlinePrimary"
                                            onClick={() => handleCurrentActivityUpdate(activity.activityId)}
                                            disabled={isActive}
                                        >
                                            Initiate Activity
                                        </Button>
                                    ) : null}
                                    <ConfirmDeleteButton
                                        name="Activity"
                                        onConfirm={() => deleteActivity(activity.activityId)}
                                        buttonText="Delete Activity"
                                        buttonVariant="destructiveOutline"
                                    />
                                </div>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                <p className="mt-2 text-sm text-gray-500">No activities yet</p>
            )
        ), [])

        return (
            <div className="p-4 bg-white border rounded">
                <h2 className="pb-3 border-b font-semibold text-xl">Activities</h2>
                {activitiesList}
            </div>
        )
    }

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
        <div className="page-background">
            <Header/>
            <CurrentActivityIndicator/>
            <ShowEventDetails event={event}/>
            <UsersList eventId={event?.eventId} mode="all-users"/>
            <ShowActivities/>
            <AddNewActivity/>
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