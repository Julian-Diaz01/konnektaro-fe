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
        setActivities([...activities, created]) // Add newly created activity to the list
        setShowForm(false)
    }

    const handleDeleteActivity = async (activityId: string) => {
        await deleteActivity(activityId)
        setActivities((prev) => prev.filter((activity) => activity.activityId !== activityId))
    }

    if (!event) return <p className="p-8">Loading...</p>

    return (
        <AuthenticatedLayout onlyAdmin allowAnonymous={false}>
            <div className="p-6 pt-8 space-y-6 max-w-3xl mx-auto white-background">
                <Button
                    variant="outlinePrimary"
                    onClick={() => router.push("/admin")}
                >
                    {"< Back to Admin"}
                </Button>
                <h2 className="text-3xl font-bold ">{event.name}</h2>
                <p className="">{event.description}</p>
                <div className="flex flex-wrap flex-flow-row gap-3">
                    {event.picture && (
                        <Image
                            src={`/avatars/${event.picture}`}
                            alt="Event"
                            width={400}
                            height={300}
                            className="rounded shadow-md event-img mb-4 p-4 bg-white"
                        />
                    )}
                    <div>
                        <div className="flex gap-3">
                            <Button variant="disabled" onClick={() => {
                            }}>
                                Edit Event
                            </Button>
                            <ConfirmDeleteButton
                                name="event"
                                onConfirm={handleDeleteEvent}
                                buttonText="Delete Event"
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white border p-4 rounded">
                    <h2 className="text-xl font-semibold border-b">Activities</h2>

                    {activities.length > 0 ? (
                        <ul className="space-y-2 mt-2">
                            {activities.map((activity) => (
                                <li
                                    key={activity.activityId}
                                    className="flex justify-between items-start space-y-1 flex-col sm:flex-row sm:items-center border-b"
                                >
                                    <div>
                                        <p className="font-bold text-lg">{activity.title}</p>
                                        <p className="text-gray-600">{activity.question}</p>
                                        <p className="italic text-sm text-gray-500">
                                            Type: {activity.type}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 float-right">
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
                        <p className="text-sm text-gray-500 mt-2">No activities yet</p>
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