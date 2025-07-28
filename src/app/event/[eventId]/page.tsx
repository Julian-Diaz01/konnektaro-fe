'use client'

import {useEffect, useState} from 'react'
import {useParams, useRouter} from 'next/navigation'
import {Event, Activity, ActivityType} from '@/types/models'
import {Button} from '@/components/ui/button'
import {deleteEvent, getEventById} from '@/services/eventService'
import {createActivity, deleteActivity} from '@/services/activityService'
import Image from 'next/image'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import AddActivityForm from "@/components/AddActivity";

export default function EventDetailsPage() {
    const {eventId} = useParams()
    const router = useRouter()
    const [event, setEvent] = useState<Event | null>(null)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        const fetchEvent = async () => {
            const response = await getEventById(eventId as string)
            setEvent(response.data)
        }
        fetchEvent()
    }, [eventId])

    const handleDeleteEvent = async () => {
        await deleteEvent(eventId as string)
        router.push('/admin')
    }

    const handleAddActivity = async (activityData: { title: string; question: string; type: ActivityType }) => {
        if (!event) return
        const activity: Partial<Activity> = {
            title: activityData.title,
            question: activityData.question,
            type: activityData.type,
            eventId: event.eventId,
        }
        const created = await createActivity(activity)
        setEvent(prev => ({
            ...prev!,
            activityIds: [...(prev?.activityIds || []), created.activityId],
        }))
        setShowForm(false)
    }

    const handleDeleteActivity = async (activityId: string) => {
        await deleteActivity(activityId)
        setEvent(prev => {
            if (!prev) return prev
            return {
                ...prev,
                activityIds: prev.activityIds?.filter(id => id !== activityId) ?? [],
            }
        })
    }

    if (!event) return <p className="p-8">Loading...</p>

    return (
        <AuthenticatedLayout onlyAdmin allowAnonymous={false}>
            <div className="p-6 pt-16 space-y-6 max-w-3xl mx-auto white-background">
                <h1 className="text-3xl font-bold">{event.name}</h1>
                <p className="text-gray-600">{event.description}</p>

                {event.picture && (
                    <Image
                        src={`/avatars/${event.picture}`}
                        alt="Event"
                        width={400}
                        height={300}
                        className="rounded shadow-md"
                    />
                )}

                <div className="flex gap-3">
                    <Button variant="destructive" onClick={handleDeleteEvent}>Delete Event</Button>
                    <Button onClick={() => router.push('/admin')}>Back to Admin</Button>
                </div>

                <section>
                    <h2 className="text-xl font-semibold">Activities</h2>
                    {event.activityIds?.length ? (
                        <ul className="space-y-2 mt-2">
                            {event.activityIds.map(id => (
                                <li key={id} className="flex justify-between items-center border p-2 rounded">
                                    <span>Activity ID: {id}</span>
                                    <Button variant="outline" onClick={() => handleDeleteActivity(id)}>Delete</Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 mt-2">No activities yet</p>
                    )}
                </section>

                <section>
                    {showForm ? (
                        <AddActivityForm eventData={handleAddActivity} eventId={event.eventId}/>
                    ) : (
                        <Button onClick={() => setShowForm(true)}>Add Activity</Button>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    )
}
