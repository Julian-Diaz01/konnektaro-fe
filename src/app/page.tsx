'use client'

import {useRouter} from 'next/navigation'
import useAuthUser from '@/hooks/useAuthUser'
import useOpenEvents from '@/hooks/useOpenEvents'
import AuthenticatedLayout from '@/components/AuthenticatedLayout'
import EventCard from '@/components/EventCard'
import {Button} from '@/components/ui/button'
import Spinner from "@/components/ui/spinner";

export default function HomePage() {
    const router = useRouter()
    const {user, loading: userLoading} = useAuthUser()
    const {events, loading: eventsLoading} = useOpenEvents()

    const handleCreateEvent = () => {
        router.push('/create-event')
    }

    const isAnonymous = user?.isAnonymous
    const name = user?.displayName || '👋'

    const loading = userLoading || eventsLoading

    const handleClick = (eventId: string) => {
        router.push(`/create-user?eventId=${eventId}`)
    }

    return (
        <AuthenticatedLayout onlyAdmin={false} allowAnonymous={true}>
            <div className="flex flex-col h-screen p-8 pt-16 bg-white">
                {loading ? (
                    <Spinner/>
                ) : (
                    <>
                        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Welcome {name}</h1>
                        <h2 className="text-2xl font-semibold text-primary mb-6">Join an Event</h2>

                        {!isAnonymous && (
                            <Button
                                onClick={handleCreateEvent}
                                className="bg-primary text-white py-4 px-6 rounded-lg shadow-md hover:bg-opacity-90 cursor-pointer text-lg"
                            >
                                Create a New Event
                            </Button>
                        )}

                        {events.length === 0 ? (
                            <p className="text-gray-500">No open events available</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2">
                                {events.map(event => (
                                    <EventCard
                                        handleClick={() => handleClick(event.eventId)}
                                        key={event.eventId}
                                        name={event.name}
                                        description={event.description}
                                        picture={event.picture}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </AuthenticatedLayout>
    )
}
