'use client';

import {Suspense} from "react";
import {BackLink} from "@/components/BackLink";
import {ConfirmDeleteButton} from "@/components/ConfirmDeleteButton";
import Image from "next/image";
import AddActivityForm from "@/components/AddActivity";
import {Button} from "@/components/ui/button";
import useEventPage from "@/hooks/useEventPage";
import Spinner from "@/components/ui/spinner";

export default function EventPage() {

    const {
        event,
        activities,
        loading,
        showForm,
        setShowForm,
        handleAddActivity,
        handleDeleteEvent,
        deleteActivity,
    } = useEventPage();

    if (loading) {
        return <Spinner/>;
    }

    return (
        <Suspense fallback={null}>
            <div className="max-w-3xl mx-auto p-6 pt-8 space-y-6 white-background">
                <div className="mb-4 flex justify-between items-center">
                    <BackLink href="/admin"/>
                    <ConfirmDeleteButton
                        name="event"
                        onConfirm={handleDeleteEvent}
                        buttonText="Delete Event"
                        buttonVariant="destructiveOutline"
                    />
                </div>

                <div className="w-full mb-8 flex flex-row gap-6 items-start bg-white border">
                    {event?.picture && (
                        <Image
                            src={`/avatars/${event.picture}`}
                            alt="Event"
                            width={400}
                            height={300}
                            className="w-[30%] h-auto p-3 rounded shadow-none event-img"
                        />
                    )}

                    <div className="m-3 ml-0 flex flex-col flex-grow gap-3">
                        <h2 className="pb-3 border-b font-bold text-3xl">{event?.name}</h2>
                        <p className="text-gray-700">{event?.description}</p>
                    </div>
                </div>

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

                <section>
                    {showForm ? (
                        <AddActivityForm activityData={handleAddActivity}/>
                    ) : (
                        <Button className="w-full" onClick={() => setShowForm(true)}>
                            Add Activity
                        </Button>
                    )}
                </section>
            </div>
        </Suspense>
    );
}