'use client';

import EventCard from '@/components/EventCard'
import Spinner from "@/components/ui/spinner";
import useHomePage from "@/hooks/useHomePage";
import useEvent from "@/hooks/useEvent";
import {ShowEventDetails} from "@/components/EventDetails";

export default function HomePage() {

    const {
        user,
        name,
        events,
        loading,
        handleClick
    } = useHomePage()

    const {
        event,
    } = useEvent(user?.eventId || '')

    if (loading) return <Spinner color="white"/>

    const JoinEvent = () => {
        if (!user)
            return <><h2 className="text-2xl font-semibold text-primary mb-6">Join an Event</h2>
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
                )}</>
    }

    return (
        <div className="flex flex-col h-screen p-8 pt-16 white-background rounded border">
            <h1 className="text-3xl font-semibold text-gray-800 mb-6">Welcome {name}</h1>
            <JoinEvent/>
            <ShowEventDetails event={event}/>
        </div>
    )
}