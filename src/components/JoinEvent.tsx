'use client';

import EventCard from '@/components/EventCard';

interface Event {
    eventId: string;
    name: string;
    description: string;
    picture?: string;
}

interface JoinEventProps {
    user: any | null;
    events: Event[];
    onEventClick: (eventId: string) => void;
}

export default function JoinEvent({ user, events, onEventClick }: JoinEventProps) {
    if (user) return null; // Don't show if user already exists (has joined an event)
    
    return (
        <>
            <h2 className="text-2xl font-semibold text-primary mb-3">Join an Event</h2>
            {events.length === 0 ? (
                <p className="text-gray-500">No open events available</p>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {events.map(event => (
                        <EventCard
                            handleClick={() => onEventClick(event.eventId)}
                            key={event.eventId}
                            name={event.name}
                            description={event.description}
                            picture={event.picture}
                        />
                    ))}
                </div>
            )}
        </>
    );
}
