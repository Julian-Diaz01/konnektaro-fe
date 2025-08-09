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
        const currentActivityName =
            activities.filter(a => a.activityId === activeActivityId)[0]?.title ||
            event?.currentActivityId ||
            'No active activity'
        return <div className="p-4 bg-white border rounded">
            <h1><p className="font-bold">Current Activity:</p> {currentActivityName}</h1>
        </div>

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
                                <p className="text-sm text-gray-500 italic">
                                    Type: {activity.type}
                                </p>
                            </div>
                            <div className="ml-[auto] flex gap-2">
                                <Button
                                    variant="outlinePrimary"
                                    onClick={() => handleCurrentActivityUpdate(activity.activityId)}
                                    disabled={activeActivityId === activity.activityId}
                                >Initiate Activity</Button>
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
            <div className="max-w-3xl mx-auto p-6 pt-8 space-y-6 white-background">
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