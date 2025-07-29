'use client'

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import {Event, Activity, ActivityType} from "@/types/models"
import {Button} from "@/components/ui/button"
import {deleteEvent, getEventById} from "@/services/eventService"
import {createActivity, deleteActivity} from "@/services/activityService"
import Image from "next/image"
import AuthenticatedLayout from "@/components/AuthenticatedLayout"
import AddActivityForm from "@/components/AddActivity"
import {ConfirmDeleteButton} from "@/components/ConfirmDeleteButton"
import axios from "@/utils/axiosInstance"
import {BackLink} from "@/components/BackLink";
import Spinner from "@/components/ui/spinner";

export default function EventDetailsPage() {
    const {eventId} = useParams()
    const router = useRouter()
    const [event, setEvent] = useState<Event | null>(null)
    const [activities, setActivities] = useState<Activity[]>([]) // Store full activity details
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        const fetchEventData = async () => {
            const response = await getEventById(eventId as string)
            setEvent(response.data)
            // Fetch full activity details if activity IDs exist
            if (response.data.activityIds?.length) {
                const activityResponses = await Promise.all(
                    response.data.activityIds.map((activityId) =>
                        axios.get<Activity>(`/activity/${activityId}`)
                    )
                )
                setActivities(activityResponses.map((res) => res.data))
            }
        }
        fetchEventData()
    }, [eventId])

    const handleDeleteEvent = async () => {
        await deleteEvent(eventId as string)
        router.push("/admin")
    }

    const handleAddActivity = async (activityData: {
        title: string
        question: string
        type: ActivityType
    }) => {
        if (!event) return
        const activity: Partial<Activity> = {
            title: activityData.title,
            question: activityData.question,
            type: activityData.type,
            eventId: event.eventId,
        }
        const created = await createActivity(activity)
        setEvent((prev) => ({
            ...prev!,
            activityIds: [...(prev?.activityIds || []), created.activityId],
        }))
        setActivities([...activities, created])
        setShowForm(false)
    }

    const handleDeleteActivity = async (activityId: string) => {
        await deleteActivity(activityId)
        setActivities((prev) => prev.filter((activity) => activity.activityId !== activityId))
    }

    if (!event) return <Spinner color="white" />

    return (
        <AuthenticatedLayout onlyAdmin allowAnonymous={false}>
            <div className="max-w-3xl mx-auto p-6 pt-8 space-y-6 white-background">
                <div className="mb-4 flex justify-between items-center">
                    <BackLink href="/admin" />
                    <ConfirmDeleteButton
                        name="event"
                        onConfirm={handleDeleteEvent}
                        buttonText="Delete Event"
                        buttonVariant="destructiveOutline"
                    />

                </div>
                <div className="w-full mb-8 flex flex-row gap-6 items-start bg-white border">
                    {event.picture && (
                        <Image
                            src={`/avatars/${event.picture}`}
                            alt="Event"
                            width={400}
                            height={300}
                            className="w-[30%] h-auto p-3 rounded shadow-none event-img"
                        />
                    )}

                    <div className="m-3 ml-0 flex flex-col flex-grow gap-3">
                        <h2 className="pb-3 border-b font-bold text-3xl">{event.name}</h2>
                        <p className="text-gray-700">{event.description}</p>
                        <div className="ml-auto">
                            <Button variant="disabled">Edit Event</Button>
                        </div>
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
                                            onConfirm={() => handleDeleteActivity(activity.activityId)}
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
                        <AddActivityForm
                            eventData={handleAddActivity}
                            eventId={event.eventId}
                        />
                    ) : (
                        <Button className="w-full" onClick={() => setShowForm(true)}>Add Activity</Button>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    )
}